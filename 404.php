<?php
require_once __DIR__ . '/includes/init.php';
http_response_code(404);
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include __DIR__ . '/includes/head.php'; ?>
    <title>404 — Page Not Found | GreenScore</title>
    <meta name="description" content="The page you were looking for could not be found.">
    <style>
        .error-page {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
            text-align: center;
            padding: 2rem 1rem;
        }
        .error-code {
            font-size: 8rem;
            font-weight: 800;
            color: rgba(255,255,255,0.15);
            line-height: 1;
            margin-bottom: -1rem;
        }
        .error-emoji { font-size: 4rem; }
        .error-card {
            background: rgba(255,255,255,0.95);
            border-radius: 1rem;
            padding: 2.5rem 2rem;
            max-width: 480px;
            width: 100%;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body class="bg-page overlay-60"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include __DIR__ . '/includes/nav.php'; ?>
<main id="main" tabindex="-1">

<div class="error-page">
    <div class="error-code">404</div>
    <div class="error-card">
        <div class="error-emoji mb-3">🌿</div>
        <h1 class="h3 text-success fw-bold mb-2">Page Not Found</h1>
        <p class="text-muted mb-4">
            The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="d-flex flex-column gap-2">
            <a href="<?= $b ?>/index.php" class="btn btn-success">
                🏠 Go to Home
            </a>
            <?php if (isset($_SESSION['user_id'])): ?>
                <a href="<?= $b ?>/pages/user/user_account.php"
                   class="btn btn-outline-secondary">
                    👤 My Profile
                </a>
            <?php else: ?>
                <a href="<?= $b ?>/pages/auth/login.php"
                   class="btn btn-outline-secondary">
                    🔐 Login
                </a>
            <?php endif; ?>
        </div>
    </div>
</div>

</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>