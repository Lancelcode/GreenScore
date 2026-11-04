<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    \GreenScore\Csrf::requireValid();

    $tip_id  = (int) ($_POST['tip_id']  ?? 0);
    $message = \GreenScore\Validator::tipMessage($_POST['message'] ?? null);
    $user_id = (int) $_SESSION['user_id'];

    if ($message !== null && $tip_id > 0) {
        $stmt = mysqli_prepare($link,
            "UPDATE community_tips SET message = ? WHERE id = ? AND user_id = ?"
        );
        mysqli_stmt_bind_param($stmt, 'sii', $message, $tip_id, $user_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        $_SESSION['toast_success'] = 'Your tip has been updated.';
    }
}

mysqli_close($link);
header('Location: ' . BASE_URL . '/pages/community/community.php');
exit();