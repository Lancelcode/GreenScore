<?php if (!defined('BASE_URL')) require_once __DIR__ . '/init.php'; ?>
<footer class="site-footer text-white pt-5 pb-3 mt-auto">
    <div class="container">
        <div class="row gy-4">

            <div class="col-12 col-md-3">
                <h4 class="fw-bold mb-2">🌱 GreenScore</h4>
                <p class="small mb-1">Building a Greener Future, Together.</p>
                <small class="d-block">
                    &copy; <?= date('Y') ?>
                    <a href="<?= BASE_URL ?>/pages/info/greenscore_copyright.php"
                       class="text-white text-decoration-underline">GreenScore</a>.
                    All rights reserved.
                </small>
            </div>

            <div class="col-6 col-md-2">
                <h6 class="text-uppercase fw-bold mb-3">Features</h6>
                <ul class="list-unstyled small">
                    <li><a class="text-white" href="<?= BASE_URL ?>/pages/calculator/green_calculator.php">Green Calculator</a></li>
                    <li><a class="text-white" href="<?= BASE_URL ?>/pages/calculator/certificate_preview.php">Certificate</a></li>
                </ul>
            </div>

            <div class="col-6 col-md-2">
                <h6 class="text-uppercase fw-bold mb-3">Resources</h6>
                <ul class="list-unstyled small">
                    <li><a class="text-white" href="<?= BASE_URL ?>/pages/info/green_resources.php">Guides &amp; Tips</a></li>
                    <li><a class="text-white" href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">UN SDGs</a></li>
                </ul>
            </div>

            <div class="col-6 col-md-2">
                <h6 class="text-uppercase fw-bold mb-3">Community</h6>
                <ul class="list-unstyled small">
                    <li><a class="text-white" href="<?= BASE_URL ?>/pages/community/community.php">Community Board</a></li>
                    <li><a class="text-white" href="<?= BASE_URL ?>/pages/user/my_impact.php">My Impact</a></li>
                </ul>
            </div>

            <div class="col-6 col-md-3">
                <h6 class="text-uppercase fw-bold mb-3">Legal</h6>
                <ul class="list-unstyled small">
                    <li><a class="text-white" href="<?= BASE_URL ?>/pages/info/privacy.php">Privacy Policy</a></li>
                    <li><a class="text-white" href="<?= BASE_URL ?>/pages/info/terms.php">Terms of Use</a></li>
                </ul>
            </div>
        </div>

        <hr class="border-white mt-4">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <small class="text-white">Follow us:</small>
            <div>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
                   class="text-white text-decoration-none me-3">
                    <i class="fab fa-facebook-f" aria-hidden="true"></i> Facebook
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"
                   class="text-white text-decoration-none me-3">
                    <i class="fab fa-twitter" aria-hidden="true"></i> Twitter
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"
                   class="text-white text-decoration-none">
                    <i class="fab fa-instagram" aria-hidden="true"></i> Instagram
                </a>
            </div>
        </div>
    </div>
</footer>

<!-- ── Toast container ──────────────────────────────────────── -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999;">
<?php
$toasts = [
    'toast_success' => ['bg' => 'bg-success', 'icon' => '✅'],
    'toast_error'   => ['bg' => 'bg-danger',  'icon' => '❌'],
    'toast_warning' => ['bg' => 'bg-warning', 'icon' => '⚠️'],
    'toast_info'    => ['bg' => 'bg-primary', 'icon' => 'ℹ️'],
];
foreach ($toasts as $key => $config):
    if (!empty($_SESSION[$key])):
        $message = htmlspecialchars($_SESSION[$key]);
        unset($_SESSION[$key]);
?>
    <div class="toast align-items-center <?= $config['bg'] === 'bg-warning' ? 'text-dark' : 'text-white' ?> <?= $config['bg'] ?> border-0 show"
         role="alert" aria-live="assertive" aria-atomic="true"
         data-bs-autohide="true" data-bs-delay="4000">
        <div class="d-flex">
            <div class="toast-body fw-semibold">
                <?= $config['icon'] ?> <?= $message ?>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
<?php
    endif;
endforeach;
?>
</div>

<!-- ── Back to top ──────────────────────────────────────────── -->
<button id="backToTop"
        aria-label="Back to top"
        title="Back to top"
        style="
            position: fixed;
            bottom: 5rem;
            right: 1.5rem;
            z-index: 1000;
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 50%;
            border: none;
            background: #198754;
            color: #fff;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        ">
    ↑
</button>

<script>
(function () {
    // Apply dark mode immediately to prevent flash
    let saved = null;
    try { saved = localStorage.getItem('greenscore-dark'); } catch (e) {}
    if (saved === 'on') {
        document.body.classList.add('dark-mode');
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Dark mode toggle
        const btn = document.getElementById('darkModeToggle');
        if (btn) {
            const isDarkNow = document.body.classList.contains('dark-mode');
            btn.textContent = isDarkNow ? '☀️' : '🌙';
            btn.setAttribute('aria-pressed', isDarkNow ? 'true' : 'false');
            btn.addEventListener('click', function () {
                const isDark = document.body.classList.toggle('dark-mode');
                try { localStorage.setItem('greenscore-dark', isDark ? 'on' : 'off'); } catch (e) {}
                btn.textContent = isDark ? '☀️' : '🌙';
                btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            });
        }

        // Initialise toasts
        document.querySelectorAll('.toast').forEach(function (el) {
            new bootstrap.Toast(el).show();
        });

        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            window.addEventListener('scroll', function () {
                backToTop.style.opacity    = window.scrollY > 400 ? '1' : '0';
                backToTop.style.pointerEvents = window.scrollY > 400 ? 'auto' : 'none';
            });
            backToTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });
})();
</script>