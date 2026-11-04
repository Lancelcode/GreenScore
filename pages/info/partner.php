<?php
require_once __DIR__ . '/../../includes/init.php';
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Green Partnerships | GreenScore</title>
    <meta name="description" content="GreenScore partners with leading sustainability organisations including the UN, WWF, Greenpeace and more.">
    <style>
        .logo-grid img { max-height: 80px; object-fit: contain; }
        .list-group-item a { text-decoration: none; color: #28a745; font-weight: bold; }
        .list-group-item a:hover { text-decoration: underline; }
        body.dark-mode .list-group-item a { color: #4ade80; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg'); color: #333;">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper">
    <div class="container content-wrapper text-center">
        <h1 class="text-white display-4 mb-4">🌍 GreenScore Partnerships</h1>
        <p class="text-white fs-5 mb-5">
            We collaborate with some of the most trusted eco-leaders and institutions around the world.
        </p>

        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4
                    justify-content-center logo-grid mb-5">
            <?php
            $logos = ['un','greenpeace','defra','wwf','ukgov','oxfam','edincol'];
            foreach ($logos as $logo): ?>
                <div class="col">
                    <img src="<?= $b ?>/assets/images/logos/<?= $logo ?>.png"
                         class="img-fluid p-2 bg-white shadow-sm rounded"
                         alt="<?= strtoupper($logo) ?>">
                </div>
            <?php endforeach; ?>
        </div>

        <div class="card card-bg shadow-sm p-4">
            <h2 class="mb-3 text-success">Why Partner With GreenScore?</h2>
            <p class="lead mb-3">
                We are building a cleaner future, together. Every logo above represents a verified
                sustainability effort and a shared mission to reduce carbon emissions globally.
            </p>
            <div class="mt-4 text-start">
                <h3 class="text-success mb-3">Our Supporters:</h3>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">🌍
                        <a href="https://www.un.org/" target="_blank">United Nations (UN)</a></li>
                    <li class="list-group-item">🌿
                        <a href="https://www.greenpeace.org/" target="_blank">Greenpeace</a></li>
                    <li class="list-group-item">🌳
                        <a href="https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs"
                           target="_blank">DEFRA</a></li>
                    <li class="list-group-item">🐼
                        <a href="https://www.worldwildlife.org/" target="_blank">WWF</a></li>
                    <li class="list-group-item">🇬🇧
                        <a href="https://www.gov.uk/government/topical-events/the-uks-green-industrial-revolution"
                           target="_blank">UK Government Initiatives</a></li>
                    <li class="list-group-item">🤝
                        <a href="https://www.oxfam.org/" target="_blank">Oxfam</a></li>
                    <li class="list-group-item">🎓
                        <a href="https://www.edinburghcollege.ac.uk/" target="_blank">
                            Edinburgh College Sustainability Hub</a></li>
                </ul>
            </div>
        </div>
    </div>

    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>