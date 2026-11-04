<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    include ROOT_PATH . '/403.php';
    exit();
}

$b       = BASE_URL;
$user_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($user_id <= 0) {
    http_response_code(404);
    exit('Invalid user ID.');
}

$stmt = mysqli_prepare($link,
    "SELECT username, email, role, status, company_name, contact_person, phone_number
     FROM new_users WHERE id = ?"
);
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $username, $email, $role, $status, $company, $contact, $phone);
if (!mysqli_stmt_fetch($stmt)) {
    mysqli_stmt_close($stmt);
    die('User not found.');
}
mysqli_stmt_close($stmt);

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    \GreenScore\Csrf::requireValid();

    $str          = static fn (string $k): string => is_string($_POST[$k] ?? null) ? trim($_POST[$k]) : '';
    $new_username = $str('username');
    $new_email    = $str('email');
    $new_company  = $str('company_name');
    $new_contact  = $str('contact_person');
    $new_phone    = $str('phone_number');
    $new_role     = ($_POST['role'] ?? '') === 'admin' ? 'admin' : 'user';
    $allowed      = ['active', 'inactive', 'deactivated'];
    $new_status   = in_array($_POST['status'] ?? '', $allowed, true) ? $_POST['status'] : 'active';
    $new_password = is_string($_POST['new_password'] ?? null) ? $_POST['new_password'] : '';
    $is_self      = $user_id === (int) $_SESSION['user_id'];

    if ($new_username === '' || $new_email === '') {
        $error = 'Username and email cannot be empty.';
    } elseif (!\GreenScore\Validator::isEmail($new_email)) {
        $error = 'Enter a valid email address.';
    } elseif ($is_self && ($new_role !== 'admin' || $new_status !== 'active')) {
        $error = 'You cannot remove your own admin role or deactivate your own account.';
    } elseif ($new_password !== ''
        && ($pwError = \GreenScore\Validator::passwordError($new_password, $new_password)) !== null) {
        $error = $pwError;
    } else {
        $dupe = mysqli_prepare($link, 'SELECT id FROM new_users WHERE email = ? AND id <> ?');
        mysqli_stmt_bind_param($dupe, 'si', $new_email, $user_id);
        mysqli_stmt_execute($dupe);
        mysqli_stmt_store_result($dupe);
        $taken = mysqli_stmt_num_rows($dupe) > 0;
        mysqli_stmt_close($dupe);

        if ($taken) {
            $error = 'Another account already uses that email address.';
        } else {
            $stmt = mysqli_prepare($link,
                "UPDATE new_users
                 SET username = ?, email = ?, role = ?, status = ?,
                     company_name = ?, contact_person = ?, phone_number = ?
                 WHERE id = ?"
            );
            mysqli_stmt_bind_param($stmt, 'sssssssi',
                $new_username, $new_email, $new_role, $new_status,
                $new_company, $new_contact, $new_phone, $user_id
            );
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            if ($new_password !== '') {
                $hash = password_hash($new_password, PASSWORD_DEFAULT);
                $pw   = mysqli_prepare($link, 'UPDATE new_users SET password = ? WHERE id = ?');
                mysqli_stmt_bind_param($pw, 'si', $hash, $user_id);
                mysqli_stmt_execute($pw);
                mysqli_stmt_close($pw);
            }

            $success  = $new_password !== '' ? 'User and password updated successfully.' : 'User updated successfully.';
            $username = $new_username; $email   = $new_email;
            $role     = $new_role;     $status  = $new_status;
            $company  = $new_company;  $contact = $new_contact;
            $phone    = $new_phone;
        }
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Edit User | GreenScore</title>
    <style>
        .auth-wrapper { max-width: 600px; margin: 0 auto; }
        .form-label   { font-weight: 500; }
    </style>
</head>
<body class="bg-page overlay-60"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>

<div class="container content-wrapper">
    <div class="auth-wrapper">
        <div class="auth-card">
            <h2 class="text-success text-center mb-4">✏️ Edit User</h2>

            <?php if ($error): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
            <?php elseif ($success): ?>
                <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
            <?php endif; ?>

            <form method="post">
                <input type="hidden" name="csrf_token"
                       value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

                <div class="mb-3">
                    <label for="username" class="form-label">Username:</label>
                    <input type="text" name="username" id="username" class="form-control"
                           value="<?= htmlspecialchars($username) ?>" required maxlength="50">
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email:</label>
                    <input type="email" name="email" id="email" class="form-control"
                           value="<?= htmlspecialchars($email) ?>" required maxlength="100">
                </div>
                <div class="mb-3">
                    <label for="company_name" class="form-label">Company Name:</label>
                    <input type="text" name="company_name" id="company_name" class="form-control"
                           value="<?= htmlspecialchars($company ?? '') ?>" maxlength="100">
                </div>
                <div class="mb-3">
                    <label for="contact_person" class="form-label">Contact Person:</label>
                    <input type="text" name="contact_person" id="contact_person" class="form-control"
                           value="<?= htmlspecialchars($contact ?? '') ?>" maxlength="100">
                </div>
                <div class="mb-3">
                    <label for="phone_number" class="form-label">Phone Number:</label>
                    <input type="tel" name="phone_number" id="phone_number" class="form-control"
                           value="<?= htmlspecialchars($phone ?? '') ?>" maxlength="20">
                </div>
                <div class="mb-3">
                    <label for="role" class="form-label">Role:</label>
                    <select name="role" id="role" class="form-select">
                        <option value="user"  <?= $role === 'user'  ? 'selected' : '' ?>>User</option>
                        <option value="admin" <?= $role === 'admin' ? 'selected' : '' ?>>Admin</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="status" class="form-label">Status:</label>
                    <select name="status" id="status" class="form-select">
                        <option value="active"      <?= $status === 'active'      ? 'selected' : '' ?>>Active</option>
                        <option value="inactive"    <?= $status === 'inactive'    ? 'selected' : '' ?>>Inactive</option>
                        <option value="deactivated" <?= $status === 'deactivated' ? 'selected' : '' ?>>Deactivated</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label for="new_password" class="form-label">New password (optional):</label>
                    <input type="password" name="new_password" id="new_password" class="form-control"
                           autocomplete="new-password" maxlength="72" aria-describedby="newPasswordHelp">
                    <div id="newPasswordHelp" class="form-text">
                        Leave blank to keep the current password. At least 8 characters with
                        upper- and lower-case letters and a number.
                    </div>
                </div>

                <div class="d-flex justify-content-between mt-4">
                    <a href="<?= $b ?>/pages/admin/manage_users.php"
                       class="btn btn-secondary">← Back</a>
                    <button type="submit" class="btn btn-success">💾 Update User</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>