<?php
/**
 * Wedding Timeline Builder — "Send to Media Potion" endpoint.
 *
 * Upload this file to your Hostinger site (e.g. public_html/wtb/send-timeline.php).
 * The app POSTs the timeline PDF + project JSON here; this script emails both
 * to RECIPIENT with the subject "{Bride} & {Groom} Wedding Timeline".
 *
 * SETUP:
 * 1. Upload this file via Hostinger File Manager.
 * 2. (Recommended) In Hostinger, make sure an email account exists on
 *    weddingpotion.com matching FROM_ADDRESS below (timeline@weddingpotion.com)
 *    so mail passes SPF and lands in your inbox, not spam.
 * 3. The SECRET below must match the one in the app (src/lib/sendToMediaPotion.js).
 *    The secret ships in the app's public JavaScript, so it is not real
 *    protection; the origin check, rate limit and file checks below are.
 * 4. ALLOWED_ORIGINS lists the live site (scheme + host, no trailing slash).
 *    Other sites, including a local `npm start`, can't send. While the list
 *    is empty, any site may send, as before.
 */

const RECIPIENT    = 'info@mediapotion.net';
const FROM_ADDRESS = 'timeline@weddingpotion.com';
const FROM_NAME    = 'Wedding Timeline Builder';
const SECRET       = '46b8dc32b9ba8c17ad96c7237d352b0b953cd06ea8f8fb57';
const MAX_BYTES    = 15728640; // 15 MB per file

// Sites allowed to send, e.g. ['https://weddingpotion.com', 'https://www.weddingpotion.com'].
// Empty = allow any origin (the old behaviour).
const ALLOWED_ORIGINS = ['https://wtb-v2.vercel.app'];

// Per-IP rate limit: at most RATE_LIMIT sends in RATE_WINDOW seconds.
const RATE_LIMIT  = 3;
const RATE_WINDOW = 60;

// Timestamps in the email body use Eastern time (handles EST/EDT automatically).
date_default_timezone_set('America/New_York');

function fail($code, $msg) {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg]);
  exit;
}

// ---- CORS + origin check ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$originAllowed = empty(ALLOWED_ORIGINS) || in_array($origin, ALLOWED_ORIGINS, true);

header('Content-Type: application/json; charset=utf-8');
header('Vary: Origin');
if (empty(ALLOWED_ORIGINS)) {
  header('Access-Control-Allow-Origin: *');
} elseif ($originAllowed) {
  header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (!$originAllowed) fail(403, 'This site is not allowed to send timelines');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'POST only');

// ---- Rate limit (per IP, stored in a temp file) ----
function rate_limited($ip) {
  $file = sys_get_temp_dir() . '/wtb_send_rate.json';
  $fh = @fopen($file, 'c+');
  if (!$fh) return false; // can't track; don't block real clients
  flock($fh, LOCK_EX);
  $raw = stream_get_contents($fh);
  $log = json_decode($raw ?: '{}', true);
  if (!is_array($log)) $log = [];
  $now = time();
  // Drop timestamps outside the window, for every IP, so the file stays small.
  foreach ($log as $k => $times) {
    $log[$k] = array_values(array_filter((array)$times, function ($t) use ($now) {
      return $t > $now - RATE_WINDOW;
    }));
    if (empty($log[$k])) unset($log[$k]);
  }
  $key = hash('sha256', $ip);
  $limited = count($log[$key] ?? []) >= RATE_LIMIT;
  if (!$limited) $log[$key][] = $now;
  ftruncate($fh, 0);
  rewind($fh);
  fwrite($fh, json_encode($log));
  fflush($fh);
  flock($fh, LOCK_UN);
  fclose($fh);
  return $limited;
}

if (rate_limited($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
  header('Retry-After: ' . RATE_WINDOW);
  fail(429, 'Too many sends. Please wait a minute and try again.');
}

// ---- Auth ----
$secret = $_POST['secret'] ?? '';
if (!hash_equals(SECRET, $secret)) fail(403, 'Not authorized');

// ---- Inputs ----
$bride = trim($_POST['bride'] ?? '');
$groom = trim($_POST['groom'] ?? '');
// Strip anything that could break email headers
$clean = function ($s) {
  $s = preg_replace('/[\r\n\t]+/', ' ', $s);
  $s = preg_replace('/[^\p{L}\p{N} .\'&-]/u', '', $s);
  return trim(mb_substr($s, 0, 40));
};
$bride = $clean($bride) ?: 'Bride';
$groom = $clean($groom) ?: 'Groom';

if (empty($_FILES['pdf']) || empty($_FILES['json'])) fail(400, 'Missing files');

$attachments = [];
foreach (['pdf' => 'application/pdf', 'json' => 'application/json'] as $key => $mime) {
  $f = $_FILES[$key];
  if ($f['error'] !== UPLOAD_ERR_OK) fail(400, "Upload error for $key");
  if ($f['size'] <= 0 || $f['size'] > MAX_BYTES) fail(400, "Bad file size for $key");
  $data = file_get_contents($f['tmp_name']);
  if ($data === false) fail(400, "Could not read $key");
  // Check the contents, not the name or the browser-supplied type.
  if ($key === 'pdf' && strncmp($data, '%PDF-', 5) !== 0) fail(400, 'The PDF file is not a PDF');
  if ($key === 'json') {
    $decoded = json_decode($data, true);
    if (!is_array($decoded) || !isset($decoded['userRows']) || !is_array($decoded['userRows'])) {
      fail(400, 'The timeline file is not a timeline');
    }
  }
  $name = preg_replace('/[^a-zA-Z0-9._()&-]/', '_', basename($f['name']));
  if ($name === '') $name = "timeline.$key";
  // Force the expected extension regardless of what was sent
  $ext = $key === 'pdf' ? '.pdf' : '.json';
  if (substr($name, -strlen($ext)) !== $ext) $name .= $ext;
  $attachments[] = [
    'name' => $name,
    'mime' => $mime,
    'data' => $data,
  ];
}

// ---- Build multipart email ----
$subject  = "$bride & $groom Wedding Timeline";
$boundary = 'wtb_' . bin2hex(random_bytes(12));

// Optional link to the shared (live) timeline. Only http(s) URLs, no line breaks.
$link = trim($_POST['link'] ?? '');
if ($link !== '' && (strlen($link) > 300 || !preg_match('#^https?://[^\s]+$#', $link) || !filter_var($link, FILTER_VALIDATE_URL))) {
  $link = '';
}

$bodyText = "A wedding timeline was sent from the Wedding Timeline Builder.\r\n\r\n"
          . "Couple: $bride & $groom\r\n"
          . "Sent: " . date('F j, Y g:i A T') . "\r\n\r\n"
          . ($link !== '' ? "Open the live timeline (can edit): $link\r\n\r\n" : '')
          . "Attached: timeline PDF and project JSON (backup copy).\r\n";

$message  = "--$boundary\r\n";
$message .= "Content-Type: text/plain; charset=utf-8\r\n";
$message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$message .= $bodyText . "\r\n";

foreach ($attachments as $a) {
  $message .= "--$boundary\r\n";
  $message .= "Content-Type: {$a['mime']}; name=\"{$a['name']}\"\r\n";
  $message .= "Content-Transfer-Encoding: base64\r\n";
  $message .= "Content-Disposition: attachment; filename=\"{$a['name']}\"\r\n\r\n";
  $message .= chunk_split(base64_encode($a['data'])) . "\r\n";
}
$message .= "--$boundary--\r\n";

$headers  = 'From: ' . FROM_NAME . ' <' . FROM_ADDRESS . ">\r\n";
$headers .= 'Reply-To: ' . FROM_ADDRESS . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$sent = mail(RECIPIENT, $subject, $message, $headers);

if (!$sent) fail(500, 'Email send failed on server');

echo json_encode(['ok' => true]);
