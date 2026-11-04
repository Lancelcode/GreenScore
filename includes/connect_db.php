<?php
// Database connection. Settings come from environment variables (or a local
// .env file — see .env.example); nothing secret is stored in the code.
use GreenScore\Env;

if (!defined('ROOT_PATH')) {
    require_once __DIR__ . '/init.php';
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $link = new mysqli(
        Env::get('DB_HOST', '127.0.0.1'),
        Env::get('DB_USER', 'greenscore'),
        Env::get('DB_PASSWORD', ''),
        Env::get('DB_NAME', 'gradedunit'),
        (int) Env::get('DB_PORT', '3306'),
    );
    $link->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    // Log the detail for the operator; never show it to visitors.
    error_log('GreenScore database connection failed: ' . $e->getMessage());
    http_response_code(503);
    echo "<div class='alert alert-danger'>Sorry, GreenScore is temporarily unavailable. Please try again shortly.</div>";
    exit;
}
