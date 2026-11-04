<?php
require_once __DIR__ . '/../../includes/init.php';

if (!isset($_SESSION['username']) || !isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

// Redirect GET requests — this page only handles POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . BASE_URL . '/pages/user/view_cards.php');
    exit();
}

\GreenScore\Csrf::requireValid();

use GreenScore\Card;

require_once ROOT_PATH . '/includes/connect_db.php';

$action = $_POST['action'] ?? null;
$userId = (int) $_SESSION['user_id'];
$str    = static fn (string $k): string => is_string($_POST[$k] ?? null) ? trim($_POST[$k]) : '';

// Only the last four digits, expiry month and cardholder name are stored.
// The full card number is discarded after validation and the security code
// (CVV) is never collected — storing it is forbidden by PCI DSS.
if ($action === 'add') {
    $errors = Card::validateNew($str('card_number'), $str('expiry_date'), $str('card_name'));
    if ($errors !== []) {
        $_SESSION['toast_error'] = implode(' ', $errors);
        mysqli_close($link);
        header('Location: ' . BASE_URL . '/pages/user/user_account.php');
        exit();
    }

    $lastFour = Card::lastFour($str('card_number'));
    $expiry   = Card::parseExpiry($str('expiry_date'))->format('Y-m-d');
    $holder   = $str('card_name');

    $stmt = mysqli_prepare($link,
        'INSERT INTO credit_cards (user_id, card_last4, expiry_date, cardholder_name) VALUES (?, ?, ?, ?)'
    );
    mysqli_stmt_bind_param($stmt, 'isss', $userId, $lastFour, $expiry, $holder);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    $_SESSION['toast_success'] = 'Card ending ' . $lastFour . ' added.';
} elseif ($action === 'update') {
    $cardId = (int) ($_POST['card_id'] ?? 0);
    $errors = Card::validateDetails($str('expiry_date'), $str('card_name'));
    if ($errors !== []) {
        $_SESSION['toast_error'] = implode(' ', $errors);
    } else {
        $expiry = Card::parseExpiry($str('expiry_date'))->format('Y-m-d');
        $holder = $str('card_name');
        $stmt   = mysqli_prepare($link,
            'UPDATE credit_cards SET expiry_date = ?, cardholder_name = ? WHERE id = ? AND user_id = ?'
        );
        mysqli_stmt_bind_param($stmt, 'ssii', $expiry, $holder, $cardId, $userId);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        $_SESSION['toast_success'] = 'Card updated successfully.';
    }
} elseif ($action === 'delete') {
    $cardId = (int) ($_POST['card_id'] ?? 0);
    $stmt   = mysqli_prepare($link, 'DELETE FROM credit_cards WHERE id = ? AND user_id = ?');
    mysqli_stmt_bind_param($stmt, 'ii', $cardId, $userId);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    $_SESSION['toast_success'] = 'Card deleted.';
}

mysqli_close($link);
header('Location: ' . BASE_URL . '/pages/user/view_cards.php');
exit();
