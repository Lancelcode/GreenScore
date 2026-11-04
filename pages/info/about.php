<?php
require_once __DIR__ . '/../../includes/init.php';
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Why GreenScore? | GreenScore</title>
    <meta name="description" content="Learn about GreenScore and how it helps organisations meet their sustainability goals.">
    <style>
        .section-title { font-size: 1.75rem; font-weight: 600; color: #2e7d32; }
        .img-fluid     { border-radius: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.25); }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper">
<main id="main" tabindex="-1">
    <div class="container content-wrapper">
        <div class="card card-bg mb-5 text-center p-4">
            <h1 class="text-success mb-3">💼 Why GreenScore?</h1>
            <p class="lead">Empowering organisations to measure, track, and improve sustainability efforts.</p>
        </div>

        <div class="row gy-5">
            <div class="col-lg-12">
                <div class="card card-bg p-4">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <img src="<?= $b ?>/assets/images/earth-hands.jpg"
                                 alt="Sustainable Responsibility"
                                 class="img-fluid mb-3 mb-md-0 w-100">
                        </div>
                        <div class="col-md-6">
                            <h3 class="section-title">🌍 Purpose-Built for Corporate Sustainability</h3>
                            <p>GreenScore is designed to support educational institutions, businesses,
                            and public organisations in meeting their environmental responsibilities.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-12">
                <div class="card card-bg p-4">
                    <div class="row align-items-center">
                        <div class="col-md-6 order-md-2">
                            <img src="<?= $b ?>/assets/images/team-green.jpg"
                                 alt="Collaborative Sustainability"
                                 class="img-fluid mb-3 mb-md-0 w-100">
                        </div>
                        <div class="col-md-6 order-md-1">
                            <h3 class="section-title">📈 Track, Learn, Grow</h3>
                            <p>With GreenScore, your organisation can quantify environmental efforts,
                            set benchmarks, and receive recognition through a point-based
                            certification model.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-12">
                <div class="card card-bg p-4">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <img src="<?= $b ?>/assets/images/sdg.jpg"
                                 alt="Sustainable Development Goals"
                                 class="img-fluid mb-3 mb-md-0 w-100">
                        </div>
                        <div class="col-md-6">
                            <h3 class="section-title">📚 Backed by Global Goals</h3>
                            <p>GreenScore is inspired by the
                                <a href="https://sdgs.un.org/goals" target="_blank">
                                    UN Sustainable Development Goals
                                </a> and the core pillars of sustainability as outlined by
                                <strong>UNESCO</strong>.
                            </p>
                            <ul>
                                <li><strong>🌿 Environmental Sustainability</strong></li>
                                <li><strong>💼 Economic Sustainability</strong></li>
                                <li><strong>🤝 Social Sustainability</strong></li>
                                <li><strong>🎭 Cultural Sustainability</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 text-center">
                <div class="card card-bg p-4">
                    <h2 class="text-success mb-3">🚀 Start Your Green Transformation</h2>
                    <p>Whether you're a college campus, a non-profit, or a forward-thinking enterprise,
                    GreenScore provides a practical and engaging way to take environmental action. 🌿</p>
                    <a href="<?= $b ?>/pages/calculator/green_calculator.php"
                       class="btn btn-success mt-3 px-4">Begin Assessment</a>
                </div>
            </div>
        </div>
    </div>

    </main>
    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>