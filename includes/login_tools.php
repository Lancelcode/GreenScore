<?php
use GreenScore\Auth;

if (!function_exists('validate')) {
    /**
     * Look up a user by email and check the password.
     *
     * @return array{0: bool, 1: array<string, mixed>|list<string>}
     */
    function validate(mysqli $link, string $email = '', string $pwd = ''): array
    {
        $user = null;
        if ($email !== '' && $pwd !== '') {
            $stmt = mysqli_prepare($link,
                'SELECT id, username, email, password, role, status FROM new_users WHERE email = ? LIMIT 1'
            );
            mysqli_stmt_bind_param($stmt, 's', $email);
            mysqli_stmt_execute($stmt);
            $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt)) ?: null;
            mysqli_stmt_close($stmt);
        }
        return Auth::check($user, $email, $pwd);
    }
}

if (!function_exists('load')) {
    function load(string $page = 'login.php'): never
    {
        $base = defined('BASE_URL') ? BASE_URL : '';
        header('Location: ' . $base . '/' . ltrim($page, '/'));
        exit();
    }
}
