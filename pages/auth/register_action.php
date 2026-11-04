<?php
require_once __DIR__ . '/../../includes/init.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . BASE_URL . '/pages/auth/register.php');
    exit();
}

require ROOT_PATH . '/includes/connect_db.php';

$errors = [];

if (!\GreenScore\Csrf::isValid($_POST['csrf_token'] ?? null)) {
    $errors[] = 'Your session expired. Please try again.';
}

// ── Validate input (rules live in src/Validator.php) ─────────
$validation     = \GreenScore\Validator::registration($_POST);
$errors         = array_merge($errors, $validation['errors']);
$fn             = $validation['data']['username'];
$e              = $validation['data']['email'];
$company_name   = $validation['data']['company_name'];
$contact_person = $validation['data']['contact_person'];
$phone_number   = $validation['data']['phone_number'];
if ($errors === []) {
    $p = password_hash($validation['data']['password'], PASSWORD_DEFAULT);
}

// ── Duplicate email check ────────────────────────────────────
if (empty($errors)) {
    $stmt = mysqli_prepare($link, "SELECT id FROM new_users WHERE email = ?");
    mysqli_stmt_bind_param($stmt, 's', $e);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) !== 0) {
        $errors[] = 'That email address is already registered.';
    }
    mysqli_stmt_close($stmt);
}

// ── Redirect back on errors ──────────────────────────────────
if (!empty($errors)) {
    $_SESSION['register_errors'] = $errors;
    $_SESSION['register_old']    = [
        'username'       => $fn,
        'email'          => $e,
        'company_name'   => $company_name,
        'contact_person' => $contact_person,
        'phone_number'   => $phone_number,
    ];
    mysqli_close($link);
    header('Location: ' . BASE_URL . '/pages/auth/register.php');
    exit();
}

// ── Insert new user ──────────────────────────────────────────
$stmt = mysqli_prepare($link,
    "INSERT INTO new_users (username, email, password, company_name, contact_person, phone_number)
     VALUES (?, ?, ?, ?, ?, ?)"
);
mysqli_stmt_bind_param($stmt, 'ssssss', $fn, $e, $p, $company_name, $contact_person, $phone_number);
$success = mysqli_stmt_execute($stmt);

if ($success) {
    $user_id = mysqli_insert_id($link);
    mysqli_stmt_close($stmt);

    $stmt2 = mysqli_prepare($link,
        "INSERT INTO green_calculator_results
            (user_id, total_score, green_count, amber_count, red_count,
             award_level, emoji, feedback_message, shortfall, donation_cost)
         VALUES (?, 0, 0, 0, 0, 'Initial Registration 🎟️', '🎟️',
                 'Thank you for joining GreenScore!', 0, 0.00)"
    );
    mysqli_stmt_bind_param($stmt2, 'i', $user_id);
    mysqli_stmt_execute($stmt2);
    mysqli_stmt_close($stmt2);
    mysqli_close($link);

    $_SESSION['register_success'] = 'Account created successfully. You can now log in.';
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
} else {
    mysqli_stmt_close($stmt);
    mysqli_close($link);
    $_SESSION['register_errors'] = ['Registration failed. Please try again.'];
    header('Location: ' . BASE_URL . '/pages/auth/register.php');
    exit();
}