<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    \GreenScore\Csrf::requireValid();

    $message = \GreenScore\Validator::tipMessage($_POST['message'] ?? null);
    $user_id = (int) $_SESSION['user_id'];

    if ($message !== null) {
        $stmt = mysqli_prepare($link,
            "INSERT INTO community_tips (user_id, message) VALUES (?, ?)"
        );
        mysqli_stmt_bind_param($stmt, 'is', $user_id, $message);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        $_SESSION['toast_success'] = 'Your tip has been posted!';
    } else {
        $_SESSION['toast_warning'] = 'Please enter a tip of up to 500 characters.';
    }
}

mysqli_close($link);
header('Location: ' . BASE_URL . '/pages/community/community.php');
exit();