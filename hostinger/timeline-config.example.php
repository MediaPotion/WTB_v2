<?php
// Copy to timeline-config.php (same folder as timeline-api.php) and fill in.
// timeline-config.php holds the database password: it is ignored by git and
// must never be committed.
return [
  // Hostinger hPanel → Databases → MySQL: database name, user, password.
  'dsn'      => 'mysql:host=localhost;dbname=YOUR_DATABASE;charset=utf8mb4',
  'user'     => 'YOUR_DB_USER',
  'password' => 'YOUR_DB_PASSWORD',

  // Sites allowed to use shared timelines (scheme + host, no trailing slash),
  // e.g. ['https://weddingpotion.com']. Empty = any site.
  'allowed_origins' => [],
];
