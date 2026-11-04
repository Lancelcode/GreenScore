<?php
require_once __DIR__ . '/../../includes/init.php';
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Privacy Policy | GreenScore</title>
    <meta name="description" content="GreenScore privacy policy — how we collect, use and protect your data.">
    <style>
        h2.section-title { color: #2c7a7b; }
        footer { background-color: #fff; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg'); color: #333;">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper">
    <div class="container content-wrapper">
        <h1 class="text-white text-center mb-4">Privacy Policy</h1>

        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">Introduction</h2>
            <p>At <strong>GreenScore</strong>, we respect your privacy and are committed to
            protecting your personal data.</p>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">1. Information We Collect</h2>
            <ul>
                <li><strong>Account Information:</strong> Name, email, company details.</li>
                <li><strong>Usage Data:</strong> Dashboard interactions, emission reports.</li>
                <li><strong>Payment Information:</strong> Encrypted credit card details.</li>
            </ul>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">2. How We Use Your Data</h2>
            <ul>
                <li>Provide and improve our services.</li>
                <li>Manage your account and customer support.</li>
                <li>Process payments securely.</li>
                <li>Send important updates (you can opt out anytime).</li>
            </ul>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">3. Data Security</h2>
            <p>We implement SSL encryption, secure servers, and regular audits to protect
            your information from unauthorised access.</p>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">4. Your Rights</h2>
            <ul>
                <li>Access and update your personal data.</li>
                <li>Request deletion of your account and data.</li>
                <li>Opt out of marketing communications.</li>
            </ul>
        </div>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <h2 class="section-title mb-3">5. Contact Us</h2>
            <p>Questions? <a href="mailto:privacy@greenscore.com">Contact us here</a>.</p>
        </div>

        <div class="text-center">
            <a href="<?= $b ?>/pages/user/user_account.php" class="btn btn-outline-light">
                ⬅ Back to My Profile
            </a>
        </div>
    </div>
    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>