<?php
require_once __DIR__ . '/init.php';
require_once __DIR__ . '/connect_db.php';
require_once __DIR__ . '/login_tools.php';

$errors = [];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

if (!\GreenScore\Csrf::isValid($_POST['csrf_token'] ?? null)) {
    $errors[] = 'Your session expired. Please try again.';
}

$email    = is_string($_POST['email'] ?? null) ? trim($_POST['email']) : '';
// Passwords are not trimmed: leading/trailing spaces are part of the password.
$password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';

if (empty($email))    $errors[] = 'Email is required.';
if (empty($password)) $errors[] = 'Password is required.';

// ── Rate limiting ────────────────────────────────────────────
// Block an IP that has 5+ failed attempts in the last 15 minutes
$ip           = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$window       = 15 * 60; // 15 minutes in seconds
$max_attempts = 5;
$locked_out   = false;

if (empty($errors)) {
    $stmt = mysqli_prepare($link,
        "SELECT COUNT(*) AS attempts
         FROM login_attempts
         WHERE ip_address = ?
           AND attempted_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)"
    );
    mysqli_stmt_bind_param($stmt, 'si', $ip, $window);
    mysqli_stmt_execute($stmt);
    $row      = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    $attempts = (int) ($row['attempts'] ?? 0);
    mysqli_stmt_close($stmt);

    if ($attempts >= $max_attempts) {
        $locked_out = true;
        $errors[]   = 'Too many failed login attempts. Please wait 15 minutes before trying again.';
    }
}

// ── Validate credentials ─────────────────────────────────────
if (empty($errors) && !$locked_out) {
    [$is_valid, $user_data] = validate($link, $email, $password);

    if ($is_valid) {
        // Clear login attempts for this IP on successful login
        $stmt = mysqli_prepare($link,
            "DELETE FROM login_attempts WHERE ip_address = ?"
        );
        mysqli_stmt_bind_param($stmt, 's', $ip);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        // Regenerate session ID immediately on login — prevents session fixation
        session_regenerate_id(true);

        $_SESSION['user_id']  = $user_data['id'];
        $_SESSION['username'] = $user_data['username'];
        $_SESSION['email']    = $user_data['email'];
        $_SESSION['role']     = $user_data['role'];

        mysqli_close($link);
        header('Location: ' . BASE_URL . '/index.php');
        exit();

    } else {
        // Record the failed attempt
        $stmt = mysqli_prepare($link,
            "INSERT INTO login_attempts (ip_address, email) VALUES (?, ?)"
        );
        mysqli_stmt_bind_param($stmt, 'ss', $ip, $email);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        // Warn user how many attempts remain
        $stmt = mysqli_prepare($link,
            "SELECT COUNT(*) AS attempts
             FROM login_attempts
             WHERE ip_address = ?
               AND attempted_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)"
        );
        mysqli_stmt_bind_param($stmt, 'si', $ip, $window);
        mysqli_stmt_execute($stmt);
        $new_count = (int) mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['attempts'];
        mysqli_stmt_close($stmt);
        $_SESSION['login_attempts_left'] = $max_attempts - $new_count;

        $errors = $user_data;
    }
}

mysqli_close($link);
$_SESSION['login_error'] = implode(' ', $errors);
header('Location: ' . BASE_URL . '/pages/auth/login.php');
exit();