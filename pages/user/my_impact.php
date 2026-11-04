<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

$b       = BASE_URL;
$user_id = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($link,
    "SELECT
        COUNT(*)           AS total,
        SUM(green_count)   AS green,
        SUM(donation_cost) AS donation
     FROM green_calculator_results
     WHERE user_id = ?"
);
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$row      = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
$total    = (int)   ($row['total']    ?? 0);
$green    = (int)   ($row['green']    ?? 0);
$donation = (float) ($row['donation'] ?? 0);
mysqli_stmt_close($stmt);

$badge        = \GreenScore\Badges::forGreenCount($green);
$badgeSlug    = $badge['slug'];
$badgeLevel   = $badge['level'];
$badgeText    = $badge['text'];
$badge        = $badge['label'];
$greenPercent = \GreenScore\Badges::progressPercent($green);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>My Impact Report | GreenScore</title>
</head>
<body class="bg-page overlay-60 d-flex flex-column min-vh-100"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<main id="main" tabindex="-1">

<div class="container content-wrapper flex-grow-1">
    <h1 class="text-white text-center mb-5">📊 My Sustainability Impact</h1>

    <!-- Report Summary card — explicit dark text since body has no color set -->
    <div class="card-bg p-4 shadow mb-5" style="color: #333;">
        <h3 class="mb-3 text-success">🧾 Report Summary</h3>
        <p><strong>Total Submissions:</strong> <?= $total ?></p>
        <p><strong>Green Answers Earned:</strong> <?= $green ?> / 100</p>
        <p><strong>Total Contributions (demo):</strong> £<?= number_format($donation, 2) ?></p>
        <div class="mb-3">
            <p class="form-label fw-semibold mb-1" id="journeyLabel">Your Green Journey Progress</p>
            <div class="progress">
                <div class="progress-bar bg-success"
                     style="width:<?= $greenPercent ?>%;" role="progressbar" aria-labelledby="journeyLabel"
                     aria-valuenow="<?= $greenPercent ?>" aria-valuemin="0" aria-valuemax="100">
                    <?= $greenPercent ?>%
                </div>
            </div>
        </div>
        <p class="fs-5 fw-bold mb-0">
            🏅 Current Badge:
            <span class="text-success">Level <?= $badgeLevel ?> — <?= e($badge) ?></span>
        </p>
    </div>

    <!-- Action buttons -->
    <div class="text-center d-flex flex-wrap justify-content-center gap-3">
        <a href="<?= $b ?>/pages/calculator/certificate_history.php"
           class="btn btn-lg btn-outline-light fw-bold px-4 py-2 shadow-sm">
            📄 View Certificates
        </a>
        <a href="<?= $b ?>/pages/calculator/green_calculator.php"
           class="btn btn-lg btn-success fw-bold px-4 py-2 shadow-sm">
            🧮 Take the Calculator Again
        </a>
        <a href="<?= $b ?>/pages/user/user_account.php"
           class="btn btn-lg btn-outline-light fw-bold px-4 py-2 shadow-sm">
            👤 Back to My Profile
        </a>
    </div>

    <!-- Badge card — explicit dark text -->
    <div class="card-bg p-4 shadow mt-5 mb-5" style="color: #333;">
        <div class="text-center px-4">
            <h3 class="text-success mb-2">🏆 Your Current Title</h3>
            <p class="text-secondary mb-1" style="font-size: 1rem;">Level <?= $badgeLevel ?></p>
            <h2 class="fw-bold mb-4"><?= e($badge) ?></h2>
            <?php
            $badgeImage    = ROOT_PATH . "/assets/images/illustrations/{$badgeSlug}.jpg";
            $badgeImageUrl = $b . "/assets/images/illustrations/{$badgeSlug}.jpg";
            if (file_exists($badgeImage)) {
                echo "<div class='d-flex justify-content-center'>
                    <img src='" . e($badgeImageUrl) . "'
                         alt='" . htmlspecialchars($badge) . "'
                         class='img-fluid my-3'
                         style='max-width:560px; border-radius:1rem;
                                box-shadow:0 0 16px rgba(0,0,0,0.25);'>
                  </div>";
            }
            ?>
            <p class="lead text-secondary mt-3 mb-0">
                <em><?= htmlspecialchars($badgeText) ?></em>
            </p>
        </div>
    </div>
</div>

</main>
<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php mysqli_close($link); ?>