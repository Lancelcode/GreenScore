<?php
require_once __DIR__ . '/../../includes/init.php';
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Terms &amp; Conditions | GreenScore</title>
    <meta name="description" content="GreenScore terms and conditions of use.">
    <style>
        h2.section-title { color: #2c7a7b; }
        footer { background-color: #fff; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg'); color: #333;">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper">
<main id="main" tabindex="-1">
    <div class="container content-wrapper">
        <h1 class="text-white text-center mb-4">Terms &amp; Conditions</h1>

        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using GreenScore, you agree to be bound by these Terms
            and our Privacy Policy.</p>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">2. Use of Service</h2>
            <ul>
                <li>You must provide accurate company information when registering.</li>
                <li>Do not misuse our services or upload harmful content.</li>
                <li>Respect intellectual property rights.</li>
            </ul>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">3. User Accounts</h2>
            <ul>
                <li>Keep your account credentials secure.</li>
                <li>Notify us immediately of any unauthorised account use.</li>
                <li>We reserve the right to suspend or terminate accounts.</li>
            </ul>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">4. GreenScore Points &amp; Certifications</h2>
            <p>Points are awarded based on verified emission reductions. Certifications may be
            revoked if fraud or misrepresentation is detected.</p>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">5. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, GreenScore is not liable for indirect,
            incidental, or consequential damages.</p>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">6. Changes to Terms</h2>
            <p>We may update these terms occasionally. Continued use after changes implies acceptance.</p>
        </div>

        <div class="text-center">
            <a href="<?= $b ?>/pages/user/user_account.php" class="btn btn-outline-light">
                ⬅ Back to My Profile
            </a>
        </div>
    </div>
    </main>
    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>