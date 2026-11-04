<?php
require_once __DIR__ . '/../../includes/init.php';

if (isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/index.php');
    exit();
}

$b = BASE_URL;

// Self-service password reset is deliberately disabled.
//
// The previous version changed the password of any account whose email
// address was typed in, without proving the requester owned that address —
// anyone could take over any account (including admins). A safe reset needs a
// single-use, time-limited token sent by email, and GreenScore has no mail
// delivery configured yet. Until it does, an administrator resets passwords
// from Admin → Manage Users → Edit Details.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Reset Password | GreenScore</title>
    <meta name="description" content="Reset your GreenScore account password.">
    <style>
        .auth-wrapper { max-width: 500px; margin: 0 auto; }
        .form-label   { color: #222; font-weight: 500; }
        footer        { position: relative; z-index: 1; background-color: #fff;
                        padding: 2rem 0; width: 100%; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>

<div class="container content-wrapper">
    <div class="auth-wrapper">
        <div class="auth-card">
            <h2 class="text-success text-center mb-4">🔄 Reset Your Password</h2>

            <div class="alert alert-info" role="status">
                <p class="mb-2">For your security, passwords can't be reset from this page.</p>
                <p class="mb-0">Please ask a GreenScore administrator to reset your password
                    for you. They will confirm your identity before doing so.</p>
            </div>
            <div class="text-center mt-3">
                <a href="<?= $b ?>/pages/auth/login.php" class="text-success">← Back to Login</a>
            </div>
        </div>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>