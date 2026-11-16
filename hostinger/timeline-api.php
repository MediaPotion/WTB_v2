<?php
/**
 * Wedding Timeline Builder — shared timelines (Phase 4).
 *
 * Stores each timeline under two secret links: an EDIT key (can change it)
 * and a VIEW key (can read it and add comments). No logins. Saves carry a
 * version number; a save based on an old version is refused with 409 so two
 * editors never silently overwrite each other.
 *
 * SETUP (Hostinger):
 * 1. Create a MySQL database + user in hPanel.
 * 2. Copy timeline-config.example.php to timeline-config.php, fill in the
 *    database details and the site address, upload both PHP files next to
 *    each other (e.g. public_html/wtb/). Tables are created on first use.
 * 3. Build the app with REACT_APP_TIMELINE_API set to this file's URL.
 *
 * API (JSON in, JSON out):
 *   POST {action:"create", data, name}                    → {editKey, viewKey, version, updatedAt}
 *   GET  ?action=load&key=K                               → {role, data, version, updatedBy, updatedAt, viewKey?, comments}
 *   POST {action:"save", key, data, baseVersion, name}    → {version, updatedAt}  | 409 {conflict, version, updatedBy, updatedAt}
 *   POST {action:"comment", key, rowId, author, body}     → {comment}
 * The edit key is stored only as a hash. The view key is returned only to editors.
 */

const MAX_DATA_BYTES = 1048576; // 1 MB of timeline JSON
const LIMITS = [           // per IP: [max requests, window seconds]
  'create'  => [20, 3600],
  'save'    => [120, 60],
  'comment' => [30, 3600],
  'load'    => [240, 60],
];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail($code, $msg, $extra = []) {
  http_response_code($code);
  echo json_encode(array_merge(['ok' => false, 'error' => $msg], $extra));
  exit;
}
function ok($payload) {
  echo json_encode(array_merge(['ok' => true], $payload));
  exit;
}

$configFile = __DIR__ . '/timeline-config.php';
if (!is_file($configFile)) fail(500, 'Sharing is not set up on the server');
$config = require $configFile;
$allowedOrigins = $config['allowed_origins'] ?? [];

// ---- CORS + origin check (empty list = any site, as with send-timeline.php) ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$originAllowed = empty($allowedOrigins) || $origin === '' || in_array($origin, $allowedOrigins, true);
header('Vary: Origin');
if (empty($allowedOrigins)) header('Access-Control-Allow-Origin: *');
elseif ($originAllowed && $origin !== '') header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if (!$originAllowed) fail(403, 'This site is not allowed to use shared timelines');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ---- Database ----
try {
  $db = new PDO($config['dsn'], $config['user'] ?? null, $config['password'] ?? null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Exception $e) {
  fail(500, 'Could not reach the timeline database');
}
$isMysql = $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
$autoId = $isMysql ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
$tail = $isMysql ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : '';
$db->exec("CREATE TABLE IF NOT EXISTS wtb_timelines (
  id $autoId,
  edit_hash CHAR(64) NOT NULL UNIQUE,
  view_hash CHAR(64) NOT NULL UNIQUE,
  view_key CHAR(32) NOT NULL,
  data MEDIUMTEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_by VARCHAR(80) NOT NULL DEFAULT '',
  updated_at VARCHAR(25) NOT NULL,
  created_at VARCHAR(25) NOT NULL
)$tail");
$db->exec("CREATE TABLE IF NOT EXISTS wtb_comments (
  id $autoId,
  timeline_id INT NOT NULL,
  row_id VARCHAR(40) NOT NULL,
  author VARCHAR(80) NOT NULL,
  body TEXT NOT NULL,
  created_at VARCHAR(25) NOT NULL
)$tail");
$db->exec("CREATE TABLE IF NOT EXISTS wtb_rate (
  ip_hash CHAR(64) NOT NULL,
  action VARCHAR(16) NOT NULL,
  at INT NOT NULL
)$tail");

function now_iso() { return gmdate('Y-m-d\TH:i:s\Z'); }
function key_hash($key) { return hash('sha256', 'wtb:' . $key); }
function clean_text($s, $max) {
  $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)$s);
  return trim(mb_substr($s, 0, $max));
}

function rate_limited($db, $action) {
  [$max, $window] = LIMITS[$action];
  $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
  $now = time();
  $db->prepare('DELETE FROM wtb_rate WHERE at < ?')->execute([$now - 3600]);
  $q = $db->prepare('SELECT COUNT(*) FROM wtb_rate WHERE ip_hash = ? AND action = ? AND at > ?');
  $q->execute([$ip, $action, $now - $window]);
  if ((int)$q->fetchColumn() >= $max) return true;
  $db->prepare('INSERT INTO wtb_rate (ip_hash, action, at) VALUES (?, ?, ?)')->execute([$ip, $action, $now]);
  return false;
}

/** Timeline JSON from the request: must be an object with a userRows list. */
function timeline_json($data) {
  if (!is_array($data) || !isset($data['userRows']) || !is_array($data['userRows'])) {
    fail(400, 'That is not a timeline');
  }
  $json = json_encode($data);
  if ($json === false || strlen($json) > MAX_DATA_BYTES) fail(413, 'Timeline is too large');
  return $json;
}

/** [row, role] for a key, or fail 404. */
function find_by_key($db, $key) {
  if (!is_string($key) || !preg_match('/^[a-f0-9]{32}$/', $key)) fail(404, 'Timeline not found');
  $h = key_hash($key);
  $q = $db->prepare('SELECT * FROM wtb_timelines WHERE edit_hash = ?');
  $q->execute([$h]);
  if ($row = $q->fetch()) return [$row, 'edit'];
  $q = $db->prepare('SELECT * FROM wtb_timelines WHERE view_hash = ?');
  $q->execute([$h]);
  if ($row = $q->fetch()) return [$row, 'view'];
  fail(404, 'Timeline not found');
}

function comments_for($db, $timelineId) {
  $q = $db->prepare('SELECT id, row_id, author, body, created_at FROM wtb_comments WHERE timeline_id = ? ORDER BY id');
  $q->execute([$timelineId]);
  return array_map(function ($c) {
    return [
      'id' => (int)$c['id'],
      'rowId' => $c['row_id'],
      'author' => $c['author'],
      'body' => $c['body'],
      'createdAt' => $c['created_at'],
    ];
  }, $q->fetchAll());
}

// ---- Request ----
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
  $in = $_GET;
} elseif ($method === 'POST') {
  $raw = file_get_contents('php://input', false, null, 0, MAX_DATA_BYTES + 4096);
  $in = json_decode($raw ?: '', true);
  if (!is_array($in)) fail(400, 'Expected JSON');
} else {
  fail(405, 'GET or POST only');
}
$action = $in['action'] ?? '';
if (!is_string($action) || !array_key_exists($action, LIMITS)) fail(400, 'Unknown action');
if (($action === 'load') !== ($method === 'GET')) fail(405, 'Wrong method for this action');
if (rate_limited($db, $action)) {
  header('Retry-After: 60');
  fail(429, 'Too many requests. Please wait a minute and try again.');
}

switch ($action) {
  case 'create': {
    $json = timeline_json($in['data'] ?? null);
    $editKey = bin2hex(random_bytes(16));
    $viewKey = bin2hex(random_bytes(16));
    $now = now_iso();
    $db->prepare('INSERT INTO wtb_timelines (edit_hash, view_hash, view_key, data, version, updated_by, updated_at, created_at)
                  VALUES (?, ?, ?, ?, 1, ?, ?, ?)')
       ->execute([key_hash($editKey), key_hash($viewKey), $viewKey, $json, clean_text($in['name'] ?? '', 80), $now, $now]);
    ok(['editKey' => $editKey, 'viewKey' => $viewKey, 'version' => 1, 'updatedAt' => $now]);
  }

  case 'load': {
    [$row, $role] = find_by_key($db, $in['key'] ?? '');
    $payload = [
      'role' => $role,
      'data' => json_decode($row['data'], true),
      'version' => (int)$row['version'],
      'updatedBy' => $row['updated_by'],
      'updatedAt' => $row['updated_at'],
      'comments' => comments_for($db, $row['id']),
    ];
    if ($role === 'edit') $payload['viewKey'] = $row['view_key'];
    ok($payload);
  }

  case 'save': {
    [$row, $role] = find_by_key($db, $in['key'] ?? '');
    if ($role !== 'edit') fail(403, 'This link can only view the timeline');
    $json = timeline_json($in['data'] ?? null);
    $base = (int)($in['baseVersion'] ?? 0);
    $now = now_iso();
    $name = clean_text($in['name'] ?? '', 80);
    // Only succeeds if nobody saved since this editor's copy was loaded.
    $u = $db->prepare('UPDATE wtb_timelines SET data = ?, version = version + 1, updated_by = ?, updated_at = ?
                       WHERE id = ? AND version = ?');
    $u->execute([$json, $name, $now, $row['id'], $base]);
    if ($u->rowCount() === 0) {
      $q = $db->prepare('SELECT version, updated_by, updated_at FROM wtb_timelines WHERE id = ?');
      $q->execute([$row['id']]);
      $cur = $q->fetch();
      fail(409, 'Someone else changed this timeline', [
        'conflict' => true,
        'version' => (int)$cur['version'],
        'updatedBy' => $cur['updated_by'],
        'updatedAt' => $cur['updated_at'],
      ]);
    }
    ok(['version' => $base + 1, 'updatedAt' => $now]);
  }

  case 'comment': {
    [$row] = find_by_key($db, $in['key'] ?? ''); // edit and view links may both comment
    $author = clean_text($in['author'] ?? '', 80);
    $body = clean_text($in['body'] ?? '', 2000);
    $rowId = clean_text($in['rowId'] ?? '', 40);
    if ($author === '' || $body === '' || $rowId === '') fail(400, 'A comment needs a name, an event and some text');
    $now = now_iso();
    $db->prepare('INSERT INTO wtb_comments (timeline_id, row_id, author, body, created_at) VALUES (?, ?, ?, ?, ?)')
       ->execute([$row['id'], $rowId, $author, $body, $now]);
    ok(['comment' => [
      'id' => (int)$db->lastInsertId(),
      'rowId' => $rowId,
      'author' => $author,
      'body' => $body,
      'createdAt' => $now,
    ]]);
  }
}
