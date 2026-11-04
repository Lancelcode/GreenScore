<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

$b          = BASE_URL;
$show_modal = false;
$award = $emoji = $message = '';
$total = $shortfall = $cost = 0;
$green = $amber = $red = 0;

$measures = \GreenScore\Scoring::MEASURES;

$explanations = [
    "Waste Reduction"                 => "Waste reduction assesses how actively a company minimises its total waste output through operational improvements, material efficiency, recycling programmes, and waste prevention strategies.\n\nExamples: Conducting annual waste audits, setting formal targets (5–10% per year), composting organic waste, eliminating single-use plastics, transitioning to digital documentation.\n\nImpact: Reduces landfill methane emissions, decreases environmental contamination, and lowers demand for raw material extraction.",
    "Renewable Energy Usage"          => "Evaluates the proportion of a company's energy supply that comes from sustainable sources such as solar, wind, hydro, or biomass.\n\nExamples: Installing solar panels, purchasing certified green electricity, entering renewable energy power purchase agreements (PPAs).\n\nImpact: Cuts CO₂ emissions from fossil fuel combustion, contributing to climate change mitigation.",
    "Water Conservation"              => "Measures how effectively a company reduces freshwater usage through technology upgrades, behaviour change, and reuse initiatives.\n\nExamples: Installing low-flow fixtures, rainwater harvesting, recycling greywater, fixing leaks promptly.\n\nImpact: Reduces energy and chemicals required for water treatment, preserving natural water ecosystems.",
    "Sustainable Supply Chain"        => "Evaluates how a company integrates environmental responsibility into supplier selection, purchasing policies, and logistics.\n\nExamples: Preferring local suppliers, sourcing certified sustainable materials, conducting supplier environmental audits.\n\nImpact: Reduces environmental impact across the entire product lifecycle.",
    "Eco-friendly Products/Services"  => "Measures the extent to which a company designs and offers products or services with reduced environmental impacts.\n\nExamples: Biodegradable packaging, energy-efficient devices, carbon-neutral services, designing for recyclability.\n\nImpact: Lowers total resource footprint and encourages responsible consumer choices.",
    "Energy-Efficient Infrastructure" => "Assesses the extent to which company buildings are optimised to minimise energy use.\n\nExamples: LED lighting, upgraded insulation, energy management systems, LEED/BREEAM certifications.\n\nImpact: Reduces operational carbon emissions and supports net-zero building targets.",
    "Transportation Sustainability"   => "Measures efforts to minimise emissions from commuting, business travel, and logistics.\n\nExamples: Electrifying vehicle fleets, promoting public transport or cycling, offering remote work, carbon-neutral freight.\n\nImpact: Reduces emissions from transportation — a major source of greenhouse gases.",
    "Community Engagement"            => "Evaluates a company's efforts to raise environmental awareness and support local sustainability initiatives.\n\nExamples: Sponsoring tree-planting drives, employee volunteer days, public education campaigns.\n\nImpact: Multiplies positive environmental impacts and builds goodwill with stakeholders.",
    "Carbon Offsetting"               => "Assesses commitment to compensate for unavoidable greenhouse gas emissions by supporting certified climate projects.\n\nExamples: Purchasing carbon credits from reforestation projects, investing in renewable energy farms.\n\nImpact: Balances emissions while financing global climate mitigation.",
    "Transparency and Reporting"      => "Evaluates how openly a company communicates its environmental impact, targets, and progress.\n\nExamples: Annual sustainability reports (GRI, CDP standards), greenhouse gas inventories, science-based targets.\n\nImpact: Builds stakeholder trust and drives internal accountability.",
];

$form_error = '';
$submitted  = $_SERVER['REQUEST_METHOD'] === 'POST';
$points     = null;

if ($submitted) {
    \GreenScore\Csrf::requireValid();
    $points = \GreenScore\Scoring::parseAnswers($_POST, count($measures));
}

if ($submitted && $points === null) {
    http_response_code(422);
    $form_error = 'Please choose Green, Amber or Red for every measure.';
} elseif ($points !== null) {
    $result    = \GreenScore\Scoring::evaluate($points);
    $total     = $result['total'];
    $green     = $result['green'];
    $amber     = $result['amber'];
    $red       = $result['red'];
    $award     = $result['award'];
    $emoji     = $result['emoji'];
    $message   = $result['message'];
    $shortfall = $result['shortfall'];
    $cost      = $result['cost'];

    $user_id = (int) $_SESSION['user_id'];
    $stmt    = mysqli_prepare($link,
        "INSERT INTO green_calculator_results
            (user_id, total_score, green_count, amber_count, red_count,
             award_level, emoji, feedback_message, shortfall, donation_cost, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"
    );
    mysqli_stmt_bind_param($stmt, 'iiiiisssii',
        $user_id, $total, $green, $amber, $red,
        $award, $emoji, $message, $shortfall, $cost
    );
    mysqli_stmt_execute($stmt);
    $last_cert_id = mysqli_insert_id($link);
    mysqli_stmt_close($stmt);
    $show_modal = true;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Green Calculator | GreenScore</title>
    <meta name="description" content="Complete the GreenScore sustainability assessment to receive a score, feedback and a certificate for your organisation.">
    <link href="<?= BASE_URL ?>/assets/vendor/animate/animate.min.css" rel="stylesheet">
    <style>
        /* Calculator-specific only */
        html { overflow-y: scroll; }
        .modal-header { background-color: #198754; color: white; }
        .modal-title  { color: #00ff66 !important; }
        body.modal-open { padding-right: 0 !important; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>

<div class="container mt-5 mb-5">
    <div class="card p-4 shadow-sm">
        <div class="row">
            <div class="col-md-8">
                <h1 class="text-success mb-4">🌿 Green Calculator</h1>
                <p class="lead">Evaluate your sustainability impact by selecting your practices below.</p>
                <?php if ($form_error): ?>
                    <div class="alert alert-danger" role="alert"><?= e($form_error) ?></div>
                <?php endif; ?>
                <form method="POST">
                    <?= \GreenScore\Csrf::field() ?>
                    <?php foreach ($measures as $index => $measure):
                        $modalId = "info" . preg_replace('/[^A-Za-z0-9]/', '', $measure);
                    ?>
                        <div class="form-group mb-3">
                            <label><strong><?= htmlspecialchars($measure) ?></strong>
                                <button type="button" class="btn btn-link p-0 ms-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#<?= $modalId ?>">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </label>
                            <select class="form-control" name="measure_<?= $index ?>" required>
                                <option value="">-- Select Level --</option>
                                <option value="10">🟢 Green (Excellent)</option>
                                <option value="5">🟠 Amber (Moderate)</option>
                                <option value="0">🔴 Red (Not Implemented)</option>
                            </select>
                        </div>

                        <div class="modal fade" id="<?= $modalId ?>" tabindex="-1">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title"><?= htmlspecialchars($measure) ?></h5>
                                        <button type="button" class="btn-close"
                                                data-bs-dismiss="modal"></button>
                                    </div>
                                    <div class="modal-body" style="white-space: pre-line;">
                                        <?= htmlspecialchars($explanations[$measure]) ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>

                    <button type="submit" class="btn btn-success mt-3" name="submit">
                        Calculate My Score 🌍
                    </button>
                    <div class="mt-3">
                        <a href="<?= $b ?>/pages/user/user_account.php"
                           class="btn btn-outline-dark">👤 Back to My Profile</a>
                    </div>
                </form>
            </div>

            <div class="col-md-4">
                <div class="card shadow-sm p-3">
                    <h5 class="mb-3 text-center">Legend</h5>
                    <ul class="list-unstyled mb-3">
                        <li>🟢 <strong>Green</strong> = 10 points</li>
                        <li>🟠 <strong>Amber</strong> = 5 points</li>
                        <li>🔴 <strong>Red</strong>  = 0 points</li>
                    </ul>
                    <hr>
                    <h6 class="text-center mb-2">Awards:</h6>
                    <ul class="list-unstyled text-center mb-0">
                        <li>🥇 Gold:        80–100 pts</li>
                        <li>🥈 Silver:      65–79 pts</li>
                        <li>🥉 Bronze:      51–64 pts</li>
                        <li>👏 Certificate: 0–50 pts</li>
                    </ul>
                </div>
                <div class="card shadow-sm p-3 mt-4">
                    <h5 class="mb-3 text-center text-success">🌍 Ethical Reminder</h5>
                    <p class="mb-0 text-center">
                        We encourage all companies to answer these questions truthfully.
                        Honest reflection is the first step toward meaningful change. 🌱🤝
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php if ($show_modal): ?>
<div class="modal fade show" id="resultModal" tabindex="-1"
     style="display:block;" aria-modal="true" role="dialog">
    <div class="modal-dialog modal-dialog-centered animate__animated animate__zoomIn">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title animate__animated animate__rubberBand">
                    <?= e($emoji) ?> <?= htmlspecialchars($award) ?>
                </h5>
            </div>
            <div class="modal-body">
                <p><strong>Your Score:</strong> <?= $total ?> / 100</p>
                <p><?= htmlspecialchars($message) ?></p>

                <div class="mb-3">
                    <label>🟢 Green</label>
                    <div class="progress">
                        <div class="progress-bar bg-success"
                             style="width:<?= $green * 10 ?>%"><?= $green ?></div>
                    </div>
                </div>
                <div class="mb-3">
                    <label>🟠 Amber</label>
                    <div class="progress">
                        <div class="progress-bar bg-warning text-dark"
                             style="width:<?= $amber * 10 ?>%"><?= $amber ?></div>
                    </div>
                </div>
                <div class="mb-3">
                    <label>🔴 Red</label>
                    <div class="progress">
                        <div class="progress-bar bg-danger"
                             style="width:<?= $red * 10 ?>%"><?= $red ?></div>
                    </div>
                </div>

                <?php if ($shortfall > 0): ?>
                    <p class="text-danger">
                        <?= e($emoji) ?> <strong><?= htmlspecialchars($message) ?></strong><br>
                        You're <strong><?= $shortfall ?> points</strong> short.
                        Consider donating <strong>£<?= $cost ?></strong>.
                    </p>
                <?php else: ?>
                    <p class="text-success">✅ Perfect score! You're a green superstar!</p>
                <?php endif; ?>
            </div>
            <div class="modal-footer d-flex flex-wrap justify-content-between gap-2">
                <a href="<?= $b ?>/pages/calculator/certificate_preview.php?id=<?= (int) $last_cert_id ?>"
                   class="btn btn-outline-success">📄 Download Certificate</a>
                <?php if ($shortfall > 0): ?>
                    <a href="<?= $b ?>/pages/calculator/buy_points.php?shortfall=<?= (int) $shortfall ?>"
                       class="btn btn-outline-warning">💸 Buy Points</a>
                <?php endif; ?>
                <a href="<?= $b ?>/pages/community/community.php"
                   class="btn btn-outline-info">🌱 Visit Community</a>
                <a href="<?= $b ?>/pages/info/green_resources.php"
                   class="btn btn-outline-dark">📚 Tips &amp; Guides</a>
                <button class="btn btn-secondary"
                        onclick="window.location='<?= $b ?>/pages/calculator/green_calculator.php'">
                    Close
                </button>
            </div>
        </div>
    </div>
</div>
<div class="modal-backdrop fade show"></div>
<?php endif; ?>

<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php mysqli_close($link); ?>