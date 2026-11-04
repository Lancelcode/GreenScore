<?php
declare(strict_types=1);

/**
 * Create an admin account, or promote and reset the password of an existing
 * account with that email. Command line only.
 *
 *   docker compose exec app php scripts/create-admin.php admin@example.com "Site Admin"
 *
 * The password is read from the ADMIN_PASSWORD environment variable if set,
 * otherwise prompted for (hidden) twice.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

define('ROOT_PATH', dirname(__DIR__));
require ROOT_PATH . '/src/autoload.php';

use GreenScore\Env;
use GreenScore\Validator;

Env::load(ROOT_PATH . '/.env');

[$script, $email, $name] = array_pad($argv, 3, null);
if ($email === null || $name === null) {
    fwrite(STDERR, "Usage: php scripts/create-admin.php <email> <display name>\n");
    exit(2);
}
$email = trim($email);
$name  = trim($name);
if (!Validator::isEmail($email) || $name === '' || mb_strlen($name) > 50) {
    fwrite(STDERR, "Give a valid email address and a display name of up to 50 characters.\n");
    exit(2);
}

function prompt_hidden(string $label): string
{
    fwrite(STDOUT, $label);
    $tty = stream_isatty(STDIN);
    if ($tty) {
        shell_exec('stty -echo');
    }
    $value = rtrim((string) fgets(STDIN), "\r\n");
    if ($tty) {
        shell_exec('stty echo');
    }
    fwrite(STDOUT, "\n");
    return $value;
}

$password = getenv('ADMIN_PASSWORD');
if ($password === false || $password === '') {
    $password = prompt_hidden('Password: ');
    $confirm  = prompt_hidden('Confirm password: ');
} else {
    $confirm = $password;
}

$error = Validator::passwordError($password, $confirm);
if ($error !== null) {
    fwrite(STDERR, $error . "\n");
    exit(1);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$link = new mysqli(
    Env::get('DB_HOST', '127.0.0.1'),
    Env::get('DB_USER', 'greenscore'),
    Env::get('DB_PASSWORD', ''),
    Env::get('DB_NAME', 'gradedunit'),
    (int) Env::get('DB_PORT', '3306'),
);
$link->set_charset('utf8mb4');

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $link->prepare(
    "INSERT INTO new_users (username, email, password, role, status, company_name, contact_person)
     VALUES (?, ?, ?, 'admin', 'active', 'GreenScore', ?)
     ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'admin', status = 'active'"
);
$stmt->bind_param('ssss', $name, $email, $hash, $name);
$stmt->execute();
$created = $stmt->affected_rows === 1;
$stmt->close();
$link->close();

fwrite(STDOUT, ($created ? 'Created admin ' : 'Updated existing account as admin: ') . $email . "\n");
