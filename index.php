<?php
require_once __DIR__ . '/includes/init.php';
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include __DIR__ . '/includes/head.php'; ?>
    <title>Welcome to GreenScore</title>
    <meta name="description" content="GreenScore helps organisations measure, track and improve their environmental impact through a structured scoring and certification system.">
    <style>
        /* Index-specific only */
        body { font-size: 1.1rem; color: #fff; }
        .icon-circle {
            background-color: #e6f4ea;
            border-radius: 50%;
            padding: 15px;
            display: inline-block;
            margin-bottom: 1rem;
        }
        .carousel-item img {
            max-height: 450px;
            width: auto;
            margin: 0 auto;
            display: block;
        }
        .carousel-caption h5 {
            color: white;
            font-weight: bold;
            text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
        }
    </style>
</head>
<body class="bg-page overlay-60"
      style="background-image: url('<?= $b ?>/assets/images/earth-bg.jpg');">
<?php include __DIR__ . '/includes/nav.php'; ?>
<div class="page-wrapper">

    <!-- Hero -->
    <div class="container content-wrapper text-center">
        <h1 class="text-white display-4 mb-4">🌿 Welcome to GreenScore</h1>
        <p class="text-white fs-5 mb-4">Track, reduce, and showcase your sustainability progress.</p>

        <?php if (!isset($_SESSION['user_id'])): ?>
            <a href="<?= $b ?>/pages/auth/register.php" class="btn btn-success btn-lg px-4">
                🌱 Join the Movement
            </a>
            <a href="<?= $b ?>/pages/auth/login.php" class="btn btn-outline-light btn-lg px-4">
                🔐 Member Login
            </a>
        <?php endif; ?>

        <div class="text-center mt-3">
            <a href="<?= $b ?>/pages/info/about.php" class="btn btn-light btn-sm px-4">
                🌍 Our Mission
            </a>
        </div>

        <div class="mt-4 p-4 bg-light bg-opacity-75 rounded text-dark shadow fs-6">
            <p class="mb-3 fw-semibold">
                🌍 Earning the highest GreenScore badge is more than recognition —
                it's a verified contribution to planetary recovery.
            </p>
            <p class="mb-3">
                By reaching this level, your organisation actively safeguards over
                <strong>100 square metres of endangered rainforest</strong>, supporting
                biodiversity and protecting vital carbon sinks.
            </p>
            <p class="mb-3">
                For every <strong>£10,000</strong> raised through certified sustainability
                practices, <strong>£1,000</strong> is directly reinvested into global
                reforestation and carbon offset initiatives.
            </p>
            <p class="mb-0">
                GreenScore empowers responsible businesses to lead by example, aligning with the
                <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">
                    <em>United Nations Sustainable Development Goals</em>
                </a>.
            </p>
        </div>
    </div>

    <!-- Features -->
    <div class="container content-wrapper">
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <div class="col">
                <div class="card card-bg shadow-sm h-100 text-center p-4">
                    <div class="icon-circle">
                        <i class="fa fa-leaf fa-2x text-success"></i>
                    </div>
                    <h5>🌍 Measure Your Impact</h5>
                    <p>Use our Green Calculator to evaluate your organisation's sustainability
                    practices and discover areas for improvement.</p>
                </div>
            </div>
            <div class="col">
                <div class="card card-bg shadow-sm h-100 text-center p-4">
                    <div class="icon-circle">
                        <i class="fa fa-medal fa-2x text-warning"></i>
                    </div>
                    <h5>🏅 Earn Recognition</h5>
                    <p>Gain certification levels — Gold, Silver, Bronze — and download
                    official digital certificates that show your commitment.</p>
                </div>
            </div>
            <div class="col">
                <div class="card card-bg shadow-sm h-100 text-center p-4">
                    <div class="icon-circle">
                        <i class="fa fa-users fa-2x text-primary"></i>
                    </div>
                    <h5>🤝 Join the Green Community</h5>
                    <p>Connect with like-minded organisations, share tips, and contribute
                    to a collective movement aligned with the UN's sustainability goals.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Badge Carousel -->
    <div class="container content-wrapper">
        <h2 class="text-white text-center mb-4">🏆 GreenScore Badge Levels</h2>
        <div id="badgeCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
            <div class="carousel-inner">
                <?php
                $badges = \GreenScore\Badges::all();
                $first = true;
                foreach ($badges as $badge):
                ?>
                    <div class="carousel-item <?= $first ? 'active' : '' ?>">
                        <img src="<?= $b ?>/assets/images/illustrations/<?= $badge['slug'] ?>.jpg"
                             class="d-block rounded shadow"
                             alt="<?= htmlspecialchars($badge['label']) ?>">
                        <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
                            <h5><?= e($badge['label']) ?></h5>
                        </div>
                    </div>
                <?php $first = false; endforeach; ?>
            </div>
            <button class="carousel-control-prev" type="button"
                    data-bs-target="#badgeCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button"
                    data-bs-target="#badgeCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    </div>

    <?php include __DIR__ . '/includes/footer.php'; ?>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>