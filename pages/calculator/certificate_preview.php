<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

$b        = BASE_URL;
$user_id  = (int) $_SESSION['user_id'];
$is_admin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
$entry_id = (int) ($_GET['id'] ?? 0);

if ($entry_id <= 0) {
    header('Location: ' . BASE_URL . '/pages/calculator/certificate_history.php');
    exit();
}

// Load from DB by ID — never trust $_GET for the award level
// Admins can view any certificate; regular users only their own
if ($is_admin) {
    $stmt = mysqli_prepare($link,
        "SELECT gcr.id, gcr.award_level, gcr.total_score, gcr.submitted_at,
                u.username, u.company_name
         FROM green_calculator_results gcr
         JOIN new_users u ON gcr.user_id = u.id
         WHERE gcr.id = ?"
    );
    mysqli_stmt_bind_param($stmt, 'i', $entry_id);
} else {
    $stmt = mysqli_prepare($link,
        "SELECT gcr.id, gcr.award_level, gcr.total_score, gcr.submitted_at,
                u.username, u.company_name
         FROM green_calculator_results gcr
         JOIN new_users u ON gcr.user_id = u.id
         WHERE gcr.id = ? AND gcr.user_id = ?"
    );
    mysqli_stmt_bind_param($stmt, 'ii', $entry_id, $user_id);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$cert   = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);
mysqli_close($link);

if (!$cert) {
    header('Location: ' . BASE_URL . '/pages/calculator/certificate_history.php');
    exit();
}

$award       = htmlspecialchars($cert['award_level']);
$username    = htmlspecialchars($cert['username']);
$company     = htmlspecialchars($cert['company_name'] ?? 'Independent');
$score       = (int) $cert['total_score'];
$issued_date = date('F j, Y', strtotime($cert['submitted_at']));
$cert_ref    = 'GS-' . date('Y', strtotime($cert['submitted_at']))
             . '-' . str_pad($cert['id'], 6, '0', STR_PAD_LEFT);

// Award colour — elseif so only the first match applies
$award_colour = '#4CAF50';
if      (str_contains($award, 'Gold'))   $award_colour = '#d4a017';
elseif  (str_contains($award, 'Silver')) $award_colour = '#8a9ba8';
elseif  (str_contains($award, 'Bronze')) $award_colour = '#a0522d';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>GreenScore Certificate — <?= $cert_ref ?></title>
    <meta name="description" content="Your official GreenScore sustainability certificate.">
    <style>
        .cert-page {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 3rem 1rem;
            position: relative;
            z-index: 1;
            min-height: 80vh;
        }

        .certificate {
            background: #fff;
            padding: 4rem 3rem;
            max-width: 860px;
            width: 100%;
            border: 10px double <?= $award_colour ?>;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 0 30px rgba(0,0,0,0.25);
            position: relative;
        }

        .cert-logo  { font-size: 3rem; margin-bottom: 0.25rem; }

        .cert-title {
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            color: #666;
            margin-bottom: 2rem;
        }

        .cert-body p { font-size: 1.1rem; color: #555; margin-bottom: 0.25rem; }

        .cert-name {
            font-size: 2.6rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0.5rem 0;
            font-family: Georgia, serif;
        }

        .cert-company { font-size: 1.3rem; color: #444; margin-bottom: 1.5rem; }

        .cert-award {
            display: inline-block;
            font-size: 1.6rem;
            font-weight: 700;
            color: <?= $award_colour ?>;
            background: <?= $award_colour ?>18;
            border: 2px solid <?= $award_colour ?>;
            padding: 0.6rem 2rem;
            border-radius: 2rem;
            margin: 1rem 0;
        }

        .cert-score { font-size: 1rem; color: #777; margin: 1rem 0 2rem; }

        .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e0e0e0;
            font-size: 0.85rem;
            color: #888;
        }

        .cert-footer .ref { font-family: monospace; font-size: 0.8rem; }

        .cert-watermark {
            position: absolute;
            bottom: 5rem;
            left: 50%;
            transform: translateX(-50%);
            font-size: 6rem;
            opacity: 0.04;
            pointer-events: none;
            user-select: none;
        }

        .action-bar {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 2rem;
            position: relative;
            z-index: 1;
        }

        @media print {
            header, footer, .action-bar, nav { display: none !important; }
            body { background: #fff !important; }
            body::before { display: none !important; }
            .cert-page { padding: 0; min-height: unset; }
            .certificate {
                box-shadow: none;
                border-radius: 0;
                max-width: 100%;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">

<?php include ROOT_PATH . '/includes/nav.php'; ?>
<main id="main" tabindex="-1">

<div class="cert-page">
    <div>
        <div class="certificate">
            <h1 class="visually-hidden">GreenScore certificate <?= e($cert_ref) ?></h1>
            <div class="cert-watermark">🌿</div>

            <div class="cert-logo">🌿</div>
            <div class="cert-title">GreenScore — Official Certificate of Achievement</div>

            <div class="cert-body">
                <p>This certifies that</p>
                <div class="cert-name"><?= $username ?></div>
                <div class="cert-company"><?= $company ?></div>
                <p>has achieved the award level of</p>
                <div class="cert-award"><?= $award ?></div>
                <div class="cert-score">Assessment Score: <?= $score ?> / 100</div>
            </div>

            <div class="cert-footer">
                <div>
                    <strong>GreenScore</strong><br>
                    Sustainability Certification Programme<br>
                    <span class="ref"><?= $cert_ref ?></span>
                </div>
                <div style="text-align: right;">
                    Issued on<br>
                    <strong><?= $issued_date ?></strong>
                </div>
            </div>
        </div>

        <div class="action-bar">
            <button onclick="window.print()" class="btn btn-success btn-lg px-4">
                🖨️ Print / Save as PDF
            </button>
            <a href="<?= $b ?>/pages/calculator/certificate_history.php"
               class="btn btn-outline-light btn-lg px-4">
                ⬅ Back to History
            </a>
        </div>
    </div>
</div>

</main>
<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>