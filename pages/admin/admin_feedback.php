<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    include ROOT_PATH . '/403.php';
    exit();
}

$b = BASE_URL;

if (isset($_GET['updated'])) {
    $_SESSION['toast_success'] = 'Feedback changes saved successfully.';
}

$result = mysqli_query($link,
    "SELECT id, name, email, message, created_at, visible_to_public, admin_response
     FROM feedback
     ORDER BY created_at DESC"
);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Admin Feedback Panel | GreenScore</title>
    <style>
        .auth-wrapper { max-width: 860px; margin: 0 auto; }
        .feedback-item {
            border-bottom: 1px solid rgba(0,0,0,0.08);
            padding-bottom: 1.25rem;
            margin-bottom: 1.25rem;
        }
        .feedback-item:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        body.dark-mode .feedback-item { border-color: #444; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<main id="main" tabindex="-1">

<div class="container content-wrapper">
    <div class="auth-wrapper">
        <div class="auth-card">
            <h1 class="h2 text-success text-center mb-4">🛠 Admin Feedback Panel</h1>

            <?php if (mysqli_num_rows($result) > 0): ?>
                <form action="<?= $b ?>/pages/admin/process_feedback_admin.php" method="POST">
                    <input type="hidden" name="csrf_token"
                           value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

                    <?php while ($row = mysqli_fetch_assoc($result)): ?>
                        <div class="feedback-item">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <strong><?= htmlspecialchars($row['name']) ?></strong>
                                <small class="text-muted"><?= e($row['created_at']) ?></small>
                            </div>
                            <small class="text-muted"><?= htmlspecialchars($row['email']) ?></small>
                            <p class="mt-2 mb-2"><?= nl2br(htmlspecialchars($row['message'])) ?></p>

                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" role="switch"
                                       name="visible_to_public[<?= (int) $row['id'] ?>]"
                                       id="vis<?= (int) $row['id'] ?>"
                                    <?= $row['visible_to_public'] ? 'checked' : '' ?>>
                                <label class="form-check-label fw-semibold" for="vis<?= (int) $row['id'] ?>">
                                    Publicly Visible
                                </label>
                            </div>

                            <label for="resp<?= (int) $row['id'] ?>" class="form-label small fw-semibold">
                                ✍️ Admin Response
                            </label>
                            <textarea class="form-control form-control-sm"
                                      name="admin_response[<?= (int) $row['id'] ?>]"
                                      id="resp<?= (int) $row['id'] ?>"
                                      rows="2"><?= htmlspecialchars($row['admin_response'] ?? '') ?></textarea>
                        </div>
                    <?php endwhile; ?>

                    <div class="text-end mt-3">
                        <button type="submit" class="btn btn-success px-4 fw-bold">
                            <i class="fas fa-save me-2"></i> Save All Changes
                        </button>
                    </div>
                </form>
            <?php else: ?>
                <div class="text-center py-4">
                    <div style="font-size:3rem;">💬</div>
                    <h5 class="mt-3 mb-1">No feedback yet</h5>
                    <p class="text-muted">Feedback submitted by users will appear here.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

</main>
<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php mysqli_close($link); ?>