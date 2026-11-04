<?php
require_once __DIR__ . '/../../includes/init.php';

if (isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/index.php');
    exit();
}

// Convert inline alerts to toasts so footer picks them up
if (!empty($_SESSION['login_error'])) {
    $_SESSION['toast_error'] = $_SESSION['login_error'];
    unset($_SESSION['login_error']);
}
if (!empty($_SESSION['register_success'])) {
    $_SESSION['toast_success'] = $_SESSION['register_success'];
    unset($_SESSION['register_success']);
}
if (isset($_SESSION['login_attempts_left'])
    && $_SESSION['login_attempts_left'] >= 1
    && $_SESSION['login_attempts_left'] <= 2) {
    $_SESSION['toast_warning'] = '⚠️ ' . (int)$_SESSION['login_attempts_left']
        . ' attempt(s) remaining before lockout.';
    unset($_SESSION['login_attempts_left']);
}

$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Login | GreenScore</title>
    <meta name="description" content="Log in to your GreenScore account to access your sustainability dashboard and certificates.">
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
<main id="main" tabindex="-1">

<div class="container content-wrapper">
    <div class="auth-wrapper">
        <div class="auth-card">
            <h1 class="h2 text-success text-center mb-4">Login to GreenScore</h1>

            <form action="<?= $b ?>/includes/login_action.php" method="post"
                  autocomplete="on">
                <input type="hidden" name="csrf_token"
                       value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

                <div class="mb-3">
                    <label for="email" class="form-label">Email:</label>
                    <input type="email" id="email" name="email" class="form-control"
                           required placeholder="Enter your email"
                           autocomplete="email">
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password:</label>
                    <input type="password" id="password" name="password" class="form-control"
                           required placeholder="Enter your password"
                           autocomplete="current-password">
                </div>

                <button type="submit" class="btn btn-success w-100 py-2">Log in</button>
            </form>

            <div class="text-center mt-3">
                <a href="<?= $b ?>/pages/auth/forgot_password.php" class="text-success">
                    Forgot your password?
                </a>
            </div>
            <div class="text-center mt-2">
                <a href="<?= $b ?>/pages/auth/register.php" class="text-muted">
                    Don't have an account? Register
                </a>
            </div>
        </div>
    </div>
</div>

</main>
<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>