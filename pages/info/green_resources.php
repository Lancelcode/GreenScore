<?php
require_once __DIR__ . '/../../includes/init.php';
$b = BASE_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Green Resources | GreenScore</title>
    <meta name="description" content="Sustainability guides, tools and resources to help your organisation go green.">
    <style>
        .resource-card {
            background: rgba(255,255,255,0.95);
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 0 12px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
        }
        .resource-card:hover { transform: translateY(-4px); }
        .resource-title { color: #2c7a7b; font-weight: 600; margin-bottom: 1rem; }
        .resource-link {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.5rem 0;
            font-weight: 500;
            text-decoration: none;
            color: #155724;
        }
        .resource-link i { width: 20px; }
        .resource-link:hover { color: #0f5132; text-decoration: underline; }

        /* Dark mode */
        body.dark-mode .resource-card {
            background: rgba(30,30,30,0.97);
            border: 1px solid #444;
        }
        body.dark-mode .resource-title { color: #4ade80; }
        body.dark-mode .resource-link  { color: #a5d6a7; }
        body.dark-mode .resource-link:hover { color: #81c784; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg'); color: #333;">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper">
    <div class="container content-wrapper">
        <h1 class="text-white text-center mb-5">📚 Green Resources</h1>
        <div class="row gy-4">
            <div class="col-md-6">
                <div class="resource-card">
                    <h3 class="resource-title">🌍 United Nations SDG Resources</h3>
                    <a class="resource-link" href="https://sdgs.un.org/goals" target="_blank">
                        <i class="fas fa-leaf"></i> UN Sustainable Development Goals</a>
                    <a class="resource-link" href="https://www.globalgoals.org/" target="_blank">
                        <i class="fas fa-globe"></i> The Global Goals Overview</a>
                    <a class="resource-link"
                       href="https://sdgs.un.org/sites/default/files/publications/21252030%20Agenda%20for%20Sustainable%20Development%20web.pdf"
                       target="_blank">
                        <i class="fas fa-file-pdf"></i> SDG Agenda 2030 (PDF)</a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="resource-card">
                    <h3 class="resource-title">📁 Downloadable Guides</h3>
                    <a class="resource-link"
                       href="<?= $b ?>/assets/documents/green_tips_guide.pdf" target="_blank">
                        <i class="fas fa-book"></i> Green Living Tips Guide (PDF)</a>
                    <a class="resource-link"
                       href="<?= $b ?>/assets/documents/carbon_reduction_checklist.pdf" target="_blank">
                        <i class="fas fa-list-check"></i> Carbon Reduction Checklist (PDF)</a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="resource-card">
                    <h3 class="resource-title">🧠 Educational &amp; Research Platforms</h3>
                    <a class="resource-link" href="https://www.epa.gov/sustainability" target="_blank">
                        <i class="fas fa-recycle"></i> EPA: Learn About Sustainability</a>
                    <a class="resource-link" href="https://climate.nasa.gov/" target="_blank">
                        <i class="fas fa-satellite"></i> NASA Climate Data</a>
                    <a class="resource-link" href="https://www.carbontrust.com/resources" target="_blank">
                        <i class="fas fa-flask"></i> Carbon Trust Resource Hub</a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="resource-card">
                    <h3 class="resource-title">🏛️ Government &amp; NGO Initiatives</h3>
                    <a class="resource-link"
                       href="https://www.gov.uk/government/publications/net-zero-strategy" target="_blank">
                        <i class="fas fa-flag"></i> UK Gov: Net Zero Strategy</a>
                    <a class="resource-link" href="https://climate.ec.europa.eu/" target="_blank">
                        <i class="fas fa-globe-europe"></i> EU Climate Action</a>
                    <a class="resource-link" href="https://footprint.wwf.org.uk/" target="_blank">
                        <i class="fas fa-paw"></i> WWF Carbon Footprint Guide</a>
                </div>
            </div>
        </div>
    </div>

    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>