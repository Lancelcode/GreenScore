<?php
require_once __DIR__ . '/../../includes/init.php';

// Logging out changes state, so it must be a POST carrying the CSRF token —
// otherwise any site could log a visitor out with a hidden image link.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . BASE_URL . '/index.php');
    exit();
}
\GreenScore\Csrf::requireValid();

$_SESSION = [];

// Delete the session cookie explicitly
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}

session_destroy();
header('Location: ' . BASE_URL . '/index.php');
exit();