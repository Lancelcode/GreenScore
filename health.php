<?php
// Liveness/readiness probe for Docker and the reverse proxy.
// Returns 200 "ok" when PHP is running and the database answers, 503 otherwise.
declare(strict_types=1);

define('ROOT_PATH', __DIR__);
require ROOT_PATH . '/src/autoload.php';

use GreenScore\Env;

Env::load(ROOT_PATH . '/.env');
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

mysqli_report(MYSQLI_REPORT_OFF);
$link = @mysqli_connect(
    Env::get('DB_HOST', '127.0.0.1'),
    Env::get('DB_USER', 'greenscore'),
    Env::get('DB_PASSWORD', ''),
    Env::get('DB_NAME', 'gradedunit'),
    (int) Env::get('DB_PORT', '3306'),
);

if ($link === false || !mysqli_query($link, 'SELECT 1')) {
    http_response_code(503);
    echo "database unavailable\n";
    exit;
}
mysqli_close($link);
echo "ok\n";
