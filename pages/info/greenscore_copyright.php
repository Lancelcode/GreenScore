<?php
require_once __DIR__ . '/../../includes/init.php';
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Copyright | GreenScore</title>
    <style>
        footer { background-color: #fff; z-index: 2; }
        a.text-success:hover { text-decoration: underline; }
    </style>
</head>
<body class="bg-page overlay-60"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg'); color: #333;">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<main id="main" tabindex="-1">

<main class="d-flex flex-column min-vh-100">
    <div class="container py-5 flex-grow-1">
        <div class="card-bg p-4">
            <h1 class="mb-4">🌱 GreenScore Copyright</h1>
            <p>&copy; <?= date('Y') ?> <strong>GreenScore</strong>. All rights reserved.</p>
            <p>All content on this website, including text, graphics, logos, icons, images,
            and software, is the property of GreenScore unless otherwise stated. Unauthorised
            use, reproduction, or distribution of any material without prior written permission
            is strictly prohibited.</p>
            <p>We support sharing for educational and environmental purposes. You are welcome
            to reference our material provided proper credit is given and a link to GreenScore
            is included.</p>
            <p>Questions? Contact us at:
                <a href="mailto:contact@greenscore.com" class="text-success">
                    contact@greenscore.com
                </a>
            </p>
        </div>
    </div>
    </main>
    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</main>

<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>