<?php
require_once __DIR__ . '/../../includes/init.php';

if (isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/index.php');
    exit();
}

$b      = BASE_URL;
$errors = $_SESSION['register_errors'] ?? [];
$old    = $_SESSION['register_old']    ?? [];
unset($_SESSION['register_errors'], $_SESSION['register_old']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Register | GreenScore</title>
    <meta name="description" content="Create a GreenScore account to start measuring your organisation's sustainability impact.">
    <style>
        .auth-wrapper { max-width: 500px; margin: 0 auto; }
        .form-label   { color: #222; font-weight: 500; }
        footer        { position: relative; z-index: 1; background-color: #fff;
                        padding: 2rem 0; width: 100%; }

        /* Strength bar */
        .strength-bar-wrap {
            height: 5px;
            background: #e9ecef;
            border-radius: 3px;
            margin-top: 6px;
            overflow: hidden;
        }
        .strength-bar {
            height: 100%;
            width: 0;
            border-radius: 3px;
            transition: width 0.3s ease, background 0.3s ease;
        }
        .strength-label {
            font-size: 0.78rem;
            margin-top: 3px;
            font-weight: 600;
        }

        /* Confirm match indicator */
        .match-indicator {
            font-size: 0.78rem;
            margin-top: 4px;
            font-weight: 600;
            min-height: 1.1em;
        }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<main id="main" tabindex="-1">

<div class="container content-wrapper">
    <div class="auth-wrapper">
        <div class="auth-card">
            <h1 class="h2 text-success text-center mb-4">Create Your Account</h1>

            <?php if (!empty($errors)): ?>
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        <?php foreach ($errors as $err): ?>
                            <li><?= htmlspecialchars($err) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <form action="<?= $b ?>/pages/auth/register_action.php" method="POST"
                  autocomplete="on">
                <input type="hidden" name="csrf_token"
                       value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

                <div class="mb-3">
                    <label for="username" class="form-label">Name:</label>
                    <input type="text" name="username" id="username" class="form-control"
                           value="<?= htmlspecialchars($old['username'] ?? '') ?>"
                           required maxlength="50"
                           autocomplete="name">
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email address:</label>
                    <input type="email" name="email" id="email" class="form-control"
                           value="<?= htmlspecialchars($old['email'] ?? '') ?>"
                           required maxlength="100"
                           autocomplete="email">
                </div>
                <div class="mb-3">
                    <label for="company_name" class="form-label">Company Name:</label>
                    <input type="text" name="company_name" id="company_name" class="form-control"
                           value="<?= htmlspecialchars($old['company_name'] ?? '') ?>"
                           required maxlength="100"
                           autocomplete="organization">
                </div>
                <div class="mb-3">
                    <label for="contact_person" class="form-label">Contact Person:</label>
                    <input type="text" name="contact_person" id="contact_person" class="form-control"
                           value="<?= htmlspecialchars($old['contact_person'] ?? '') ?>"
                           required maxlength="100"
                           autocomplete="off">
                </div>
                <div class="mb-3">
                    <label for="phone_number" class="form-label">Phone Number:</label>
                    <input type="tel" name="phone_number" id="phone_number" class="form-control"
                           value="<?= htmlspecialchars($old['phone_number'] ?? '') ?>"
                           required maxlength="20"
                           placeholder="e.g. +44 7911 123456"
                           autocomplete="tel">
                </div>

                <!-- Password with strength indicator -->
                <div class="mb-3">
                    <label for="pass1" class="form-label">Password:</label>
                    <input type="password" name="pass1" id="pass1"
                           class="form-control" required minlength="8" maxlength="72"
                           autocomplete="new-password">
                    <div class="strength-bar-wrap">
                        <div class="strength-bar" id="strengthBar"></div>
                    </div>
                    <div class="strength-label" id="strengthLabel" style="color:#595959;" aria-live="polite">
                        Min 8 chars · uppercase · lowercase · number
                    </div>
                </div>

                <!-- Confirm password with match indicator -->
                <div class="mb-3">
                    <label for="pass2" class="form-label">Confirm Password:</label>
                    <input type="password" name="pass2" id="pass2"
                           class="form-control" required minlength="8" maxlength="72"
                           autocomplete="new-password">
                    <div class="match-indicator" id="matchIndicator"></div>
                </div>

                <button type="submit" class="btn btn-success w-100 py-2">
                    Create account
                </button>
            </form>
            <div class="text-center mt-3">
                <a href="<?= $b ?>/pages/auth/login.php" class="text-muted">
                    Already have an account? Login
                </a>
            </div>
        </div>
    </div>
</div>

</main>
<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
<script>
(function () {
    const pass1     = document.getElementById('pass1');
    const pass2     = document.getElementById('pass2');
    const bar       = document.getElementById('strengthBar');
    const label     = document.getElementById('strengthLabel');
    const matchEl   = document.getElementById('matchIndicator');

    const common = [
        'password','password1','12345678','123456789','qwerty123',
        'iloveyou','sunshine','princess','letmein1','welcome1',
        'monkey123','dragon12','football','baseball','abc12345'
    ];

    function scorePassword(pwd) {
        if (pwd.length === 0) return 0;
        let score = 0;
        if (pwd.length >= 8)  score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (common.includes(pwd.toLowerCase())) score = 1;
        return score;
    }

    function updateStrength() {
        const pwd   = pass1.value;
        const score = scorePassword(pwd);

        const levels = [
            { min: 0, max: 0, label: 'Min 8 chars · uppercase · lowercase · number', color: '#999',    text: '#595959', width: '0%'   },
            { min: 1, max: 2, label: 'Weak',     color: '#dc3545', text: '#b02a37', width: '25%'  },
            { min: 3, max: 3, label: 'Fair',     color: '#fd7e14', text: '#9a4a00', width: '50%'  },
            { min: 4, max: 4, label: 'Good',     color: '#ffc107', text: '#6d5200', width: '75%'  },
            { min: 5, max: 6, label: 'Strong ✅', color: '#198754', text: '#146c43', width: '100%' },
        ];

        const level = levels.find(l => score >= l.min && score <= l.max) || levels[0];
        bar.style.width      = pwd.length === 0 ? '0%' : level.width;
        bar.style.background = level.color;
        label.textContent    = level.label;
        label.style.color    = level.text;

        updateMatch();
    }

    function updateMatch() {
        if (pass2.value.length === 0) {
            matchEl.textContent  = '';
            return;
        }
        const match = pass1.value === pass2.value;
        matchEl.textContent  = match ? '✅ Passwords match' : '❌ Passwords do not match';
        matchEl.style.color  = match ? '#146c43' : '#b02a37';
    }

    pass1.addEventListener('input', updateStrength);
    pass2.addEventListener('input', updateMatch);
})();
</script>
</body>
</html>