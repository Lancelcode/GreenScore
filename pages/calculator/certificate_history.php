<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

$b              = BASE_URL;
$user_id        = (int) $_SESSION['user_id'];
$is_admin       = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
if (isset($_POST['delete_id'])) {
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) die('Invalid CSRF token.');
    $delete_id = (int) $_POST['delete_id'];
    $stmt = mysqli_prepare($link, "DELETE FROM green_calculator_results WHERE id = ? AND user_id = ?");
    mysqli_stmt_bind_param($stmt, 'ii', $delete_id, $user_id);
    mysqli_stmt_execute($stmt); mysqli_stmt_close($stmt);
    $_SESSION['toast_success'] = 'Entry deleted successfully.';
    header('Location: ' . BASE_URL . '/pages/calculator/certificate_history.php');
    exit();
}

if (isset($_POST['clear_all'])) {
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) die('Invalid CSRF token.');
    $stmt = mysqli_prepare($link, "DELETE FROM green_calculator_results WHERE user_id = ?");
    mysqli_stmt_bind_param($stmt, 'i', $user_id);
    mysqli_stmt_execute($stmt); mysqli_stmt_close($stmt);
    $_SESSION['toast_success'] = 'All certificates cleared.';
    header('Location: ' . BASE_URL . '/pages/calculator/certificate_history.php');
    exit();
}

if (isset($_POST['reset_id'])) {
    if (!$is_admin) die('Access denied.');
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) die('Invalid CSRF token.');
    $_SESSION['reset_entry_id'] = (int) $_POST['reset_id'];
    header('Location: ' . BASE_URL . '/pages/calculator/green_calculator.php?reset=1');
    exit();
}

if (isset($_POST['update_id'])) {
    if (!$is_admin) die('Access denied.');
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) die('Invalid CSRF token.');
    $update_id    = (int) $_POST['update_id'];
    $new_award    = trim($_POST['award_level']      ?? '');
    $new_feedback = trim($_POST['feedback_message'] ?? '');
    $stmt = mysqli_prepare($link,
        "UPDATE green_calculator_results SET award_level = ?, feedback_message = ? WHERE id = ? AND user_id = ?"
    );
    mysqli_stmt_bind_param($stmt, 'ssii', $new_award, $new_feedback, $update_id, $user_id);
    mysqli_stmt_execute($stmt); mysqli_stmt_close($stmt);
    $_SESSION['toast_success'] = 'Entry updated successfully.';
    header('Location: ' . BASE_URL . '/pages/calculator/certificate_history.php');
    exit();
}

$levels_stmt = mysqli_prepare($link,
    "SELECT DISTINCT award_level FROM green_calculator_results WHERE user_id = ?"
);
mysqli_stmt_bind_param($levels_stmt, 'i', $user_id);
mysqli_stmt_execute($levels_stmt);
$levels_result = mysqli_stmt_get_result($levels_stmt);
$award_levels  = [];
while ($lvl = mysqli_fetch_assoc($levels_result)) $award_levels[] = $lvl['award_level'];
mysqli_stmt_close($levels_stmt);

$entries_per_page = 8;
$page         = isset($_GET['page']) ? max(1, (int) $_GET['page']) : 1;
$offset       = ($page - 1) * $entries_per_page;
$order        = (isset($_GET['sort']) && $_GET['sort'] === 'oldest') ? 'ASC' : 'DESC';
$level_filter = (isset($_GET['level']) && in_array($_GET['level'], $award_levels, true)) ? $_GET['level'] : '';

if ($level_filter !== '') {
    $count_stmt = mysqli_prepare($link,
        "SELECT COUNT(*) AS total FROM green_calculator_results WHERE user_id = ? AND award_level = ?"
    );
    mysqli_stmt_bind_param($count_stmt, 'is', $user_id, $level_filter);
} else {
    $count_stmt = mysqli_prepare($link,
        "SELECT COUNT(*) AS total FROM green_calculator_results WHERE user_id = ?"
    );
    mysqli_stmt_bind_param($count_stmt, 'i', $user_id);
}
mysqli_stmt_execute($count_stmt);
$total_entries = (int) mysqli_fetch_assoc(mysqli_stmt_get_result($count_stmt))['total'];
$total_pages   = (int) ceil($total_entries / $entries_per_page);
mysqli_stmt_close($count_stmt);

if ($level_filter !== '') {
    $data_stmt = mysqli_prepare($link,
        "SELECT id, submitted_at, award_level, total_score,
                green_count, amber_count, red_count, feedback_message
         FROM green_calculator_results
         WHERE user_id = ? AND award_level = ?
         ORDER BY submitted_at $order LIMIT ? OFFSET ?"
    );
    mysqli_stmt_bind_param($data_stmt, 'isii', $user_id, $level_filter, $entries_per_page, $offset);
} else {
    $data_stmt = mysqli_prepare($link,
        "SELECT id, submitted_at, award_level, total_score,
                green_count, amber_count, red_count, feedback_message
         FROM green_calculator_results
         WHERE user_id = ?
         ORDER BY submitted_at $order LIMIT ? OFFSET ?"
    );
    // FIX: was missing this bind_param — caused empty results on unfiltered view
    mysqli_stmt_bind_param($data_stmt, 'iii', $user_id, $entries_per_page, $offset);
}
mysqli_stmt_execute($data_stmt);
$results = mysqli_stmt_get_result($data_stmt);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Certificate History | GreenScore</title>
    <style>
        .award-gold   { border-left: 5px solid #d4a017; }
        .award-silver { border-left: 5px solid #8a9ba8; }
        .award-bronze { border-left: 5px solid #a0522d; }
        .award-other  { border-left: 5px solid #4CAF50; }

        .badge-gold   { background: #fff8e1; color: #6d4c00; border: 1px solid #d4a017; }
        .badge-silver { background: #eceff1; color: #546e7a; border: 1px solid #8a9ba8; }
        .badge-bronze { background: #fbe9e7; color: #6d4c41; border: 1px solid #a0522d; }
        .badge-other  { background: #e8f5e9; color: #1b5e20; border: 1px solid #4CAF50; }

        .cert-card {
            background: rgba(255,255,255,0.96);
            border-radius: 0.75rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            overflow: hidden;
        }
        .cert-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        }
        .cert-score-bar  { height: 6px; border-radius: 3px; background: #e9ecef; }
        .cert-score-fill { height: 100%; border-radius: 3px; background: #4CAF50; }
        .cert-ref { font-family: monospace; font-size: 0.75rem; color: #595959; }
        .pill {
            display: inline-block;
            padding: 0.2rem 0.65rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: 600;
        }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper d-flex flex-column min-vh-100">
<main id="main" tabindex="-1">
    <div class="container content-wrapper">
        <h1 class="text-white text-center mb-4">📜 Certificate History</h1>

        <!-- Filters + Clear All -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <form class="d-flex gap-2 flex-wrap" method="get">
                <label for="sortSelect" class="visually-hidden">Sort order</label>
                <select name="sort" id="sortSelect" class="form-select form-select-sm" style="width:auto;"
                        onchange="this.form.submit()">
                    <option value="newest" <?= (($_GET['sort'] ?? 'newest') === 'newest') ? 'selected' : '' ?>>
                        Newest First
                    </option>
                    <option value="oldest" <?= (($_GET['sort'] ?? '') === 'oldest') ? 'selected' : '' ?>>
                        Oldest First
                    </option>
                </select>
                <label for="levelSelect" class="visually-hidden">Filter by award</label>
                <select name="level" id="levelSelect" class="form-select form-select-sm" style="width:auto;"
                        onchange="this.form.submit()">
                    <option value="">All Awards</option>
                    <?php foreach ($award_levels as $level): ?>
                        <option value="<?= htmlspecialchars($level) ?>"
                            <?= (($_GET['level'] ?? '') === $level) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($level) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </form>

            <form method="post"
                  onsubmit="return confirm('Clear all certificates? This cannot be undone.')">
                <input type="hidden" name="csrf_token"
                       value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                <button type="submit" name="clear_all" class="btn btn-sm btn-outline-danger">
                    🧹 Clear All
                </button>
            </form>
        </div>

        <?php if (mysqli_num_rows($results) > 0): ?>
            <div class="row gy-4">
            <?php while ($row = mysqli_fetch_assoc($results)):
                $cert_ref  = 'GS-' . date('Y', strtotime($row['submitted_at']))
                           . '-' . str_pad($row['id'], 6, '0', STR_PAD_LEFT);
                $score_pct = min(100, (int) $row['total_score']);

                $award_class = 'award-other';
                $badge_class = 'badge-other';
                if (str_contains($row['award_level'], 'Gold'))   { $award_class = 'award-gold';   $badge_class = 'badge-gold'; }
                if (str_contains($row['award_level'], 'Silver')) { $award_class = 'award-silver'; $badge_class = 'badge-silver'; }
                if (str_contains($row['award_level'], 'Bronze')) { $award_class = 'award-bronze'; $badge_class = 'badge-bronze'; }
            ?>
                <div class="col-md-6 col-xl-4">
                    <div class="cert-card <?= $award_class ?> h-100 d-flex flex-column">
                        <div class="p-3 d-flex flex-column h-100">

                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="cert-ref"><?= $cert_ref ?></span>
                                <small class="text-muted">
                                    <?= date('d M Y', strtotime($row['submitted_at'])) ?>
                                </small>
                            </div>

                            <div class="mb-3">
                                <span class="pill <?= $badge_class ?>">
                                    <?= htmlspecialchars($row['award_level']) ?>
                                </span>
                            </div>

                            <div class="mb-1 d-flex justify-content-between">
                                <small class="text-muted">Score</small>
                                <small class="fw-semibold"><?= $score_pct ?> / 100</small>
                            </div>
                            <div class="cert-score-bar mb-3">
                                <div class="cert-score-fill" style="width:<?= $score_pct ?>%"></div>
                            </div>

                            <div class="d-flex gap-2 mb-3">
                                <span class="pill" style="background:#e8f5e9;color:#1b5e20;border:1px solid #4CAF50;">
                                    🟢 <?= (int) $row['green_count'] ?>
                                </span>
                                <span class="pill" style="background:#fff8e1;color:#8a3a00;border:1px solid #ffa000;">
                                    🟠 <?= (int) $row['amber_count'] ?>
                                </span>
                                <span class="pill" style="background:#fce4ec;color:#a31515;border:1px solid #e53935;">
                                    🔴 <?= (int) $row['red_count'] ?>
                                </span>
                            </div>

                            <?php if ($is_admin): ?>
                                <form method="POST" class="mb-3">
                                    <input type="hidden" name="csrf_token"
                                           value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                                    <input type="hidden" name="update_id" value="<?= (int) $row['id'] ?>">
                                    <input type="text" name="award_level"
                                           value="<?= htmlspecialchars($row['award_level']) ?>"
                                           class="form-control form-control-sm mb-1"
                                           placeholder="Award level" aria-label="Award level for <?= e($cert_ref) ?>" required>
                                    <input type="text" name="feedback_message"
                                           value="<?= htmlspecialchars($row['feedback_message'] ?? '') ?>"
                                           class="form-control form-control-sm mb-2"
                                           placeholder="Feedback message" aria-label="Feedback message for <?= e($cert_ref) ?>" required>
                                    <button type="submit" class="btn btn-sm btn-primary w-100">💾 Save</button>
                                </form>
                            <?php else: ?>
                                <?php if (!empty($row['feedback_message'])): ?>
                                    <p class="small text-muted mb-3 fst-italic">
                                        "<?= htmlspecialchars($row['feedback_message']) ?>"
                                    </p>
                                <?php endif; ?>
                            <?php endif; ?>

                            <div class="d-flex gap-2 mt-auto pt-2">
                                <a href="<?= $b ?>/pages/calculator/certificate_preview.php?id=<?= (int) $row['id'] ?>"
                                   class="btn btn-sm btn-success flex-grow-1"
                                   aria-label="View certificate <?= e($cert_ref) ?>">
                                    📄 View
                                </a>

                                <?php if ($is_admin): ?>
                                    <form method="POST" class="d-inline"
                                          onsubmit="return confirm('Reset this entry?')">
                                        <input type="hidden" name="csrf_token"
                                               value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                                        <input type="hidden" name="reset_id" value="<?= (int) $row['id'] ?>">
                                        <button type="submit" class="btn btn-sm btn-warning"
                                                title="Reset" aria-label="Reset <?= e($cert_ref) ?>" style="width:36px;">🔁</button>
                                    </form>
                                <?php endif; ?>

                                <form method="POST" class="d-inline"
                                      onsubmit="return confirm('Delete this entry?')">
                                    <input type="hidden" name="csrf_token"
                                           value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                                    <input type="hidden" name="delete_id" value="<?= (int) $row['id'] ?>">
                                    <button type="submit" class="btn btn-sm btn-outline-danger"
                                            title="Delete" aria-label="Delete <?= e($cert_ref) ?>" style="width:36px;">🗑️</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
            </div>

            <?php if ($total_pages > 1): ?>
                <nav class="mt-4">
                    <ul class="pagination justify-content-center">
                        <?php
                        $query_params = $_GET;
                        for ($i = 1; $i <= $total_pages; $i++) {
                            $query_params['page'] = $i;
                            $url    = $b . '/pages/calculator/certificate_history.php?'
                                    . http_build_query($query_params);
                            $active = ($i === $page) ? 'active' : '';
                            echo "<li class='page-item $active'>
                                    <a class='page-link' href='" . htmlspecialchars($url) . "'>$i</a>
                                  </li>";
                        }
                        ?>
                    </ul>
                </nav>
            <?php endif; ?>

        <?php else: ?>
            <div class="card card-bg shadow-sm p-5 text-center">
                <div style="font-size:3rem;">📭</div>
                <h4 class="mt-3 mb-2">No certificates yet</h4>
                <p class="text-muted mb-4">
                    Complete the Green Calculator to earn your first certificate.
                </p>
                <a href="<?= $b ?>/pages/calculator/green_calculator.php"
                   class="btn btn-success px-4">
                    🧮 Take the Green Calculator
                </a>
            </div>
        <?php endif; ?>

        <div class="text-center mt-4">
            <a href="<?= $b ?>/pages/calculator/green_calculator.php"
               class="btn btn-outline-light">
                🧮 Take the Calculator Again
            </a>
        </div>
    </div>

    </main>
    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php
mysqli_stmt_close($data_stmt);
mysqli_close($link);
?>