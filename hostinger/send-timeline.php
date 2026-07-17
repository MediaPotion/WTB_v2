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
 */

const RECIPIENT    = 'info@mediapotion.net';
const FROM_ADDRESS = 'timeline@weddingpotion.com';
const FROM_NAME    = 'Wedding Timeline Builder';
const SECRET       = '46b8dc32b9ba8c17ad96c7237d352b0b953cd06ea8f8fb57';
const MAX_BYTES    = 15728640; // 15 MB per file

// Timestamps in the email body use Eastern time (handles EST/EDT automatically).
date_default_timezone_set('America/New_York');

// ---- CORS (allows the app to call this from localhost or any domain) ----
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function fail($code, $msg) {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'POST only');

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
  $name = preg_replace('/[^a-zA-Z0-9._()&-]/', '_', basename($f['name']));
  if ($name === '') $name = "timeline.$key";
  // Force the expected extension regardless of what was sent
  $ext = $key === 'pdf' ? '.pdf' : '.json';
  if (substr($name, -strlen($ext)) !== $ext) $name .= $ext;
  $attachments[] = [
    'name' => $name,
    'mime' => $mime,
    'data' => file_get_contents($f['tmp_name']),
  ];
}

// ---- Build multipart email ----
$subject  = "$bride & $groom Wedding Timeline";
$boundary = 'wtb_' . bin2hex(random_bytes(12));

$bodyText = "A wedding timeline was sent from the Wedding Timeline Builder.\r\n\r\n"
          . "Couple: $bride & $groom\r\n"
          . "Sent: " . date('F j, Y g:i A T') . "\r\n\r\n"
          . "Attached: timeline PDF and project JSON.\r\n";

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
