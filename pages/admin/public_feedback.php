<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo "<div class='container mt-5'>
            <div class='alert alert-danger'>Access denied. Admins only.</div>
          </div>";
    include ROOT_PATH . '/includes/footer.php';
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_feedback'])) {
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) {
        die('Invalid CSRF token.');
    }
    if (isset($_POST['delete_id']) && ctype_digit((string) $_POST['delete_id'])) {
        $deleteId = (int) $_POST['delete_id'];
        $stmt = mysqli_prepare($link, "DELETE FROM feedback WHERE id = ? LIMIT 1");
        mysqli_stmt_bind_param($stmt, 'i', $deleteId);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])) exit();
    header('Location: ' . BASE_URL . '/pages/admin/public_feedback.php');
    exit();
}

$b      = BASE_URL;
$result = mysqli_query($link,
    "SELECT id, name, email, message, created_at,
            admin_response, admin_username, admin_response_at
     FROM feedback
     WHERE visible_to_public = 1
     ORDER BY created_at DESC"
);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Community Feedback | GreenScore</title>
    <style>
        .feedback-card {
            background: rgba(255, 255, 255, 0.95);
            color: #212529;
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.12);
        }
        .feedback-card .feedback-meta    { color: #555; font-size: 0.85rem; }
        .feedback-card .feedback-message { color: #212529; }
        .feedback-card .admin-response {
            background: #f0f7f0;
            border-left: 4px solid #198754;
            border-radius: 0.25rem;
            padding: 0.75rem 1rem;
            color: #212529;
            margin-top: 0.75rem;
        }
        .feedback-card .admin-meta { color: #555; font-size: 0.8rem; }

        /* Dark mode overrides — explicit colours so nothing inherits badly */
        body.dark-mode .feedback-card {
            background: rgba(35, 35, 35, 0.97);
            color: #e0e0e0;
            border: 1px solid #444;
        }
        body.dark-mode .feedback-card .feedback-meta  { color: #aaa; }
        body.dark-mode .feedback-card .feedback-message { color: #e0e0e0; }
        body.dark-mode .feedback-card .admin-response {
            background: rgba(25, 135, 84, 0.15);
            border-left-color: #4ade80;
            color: #d4edda;
        }
        body.dark-mode .feedback-card .admin-meta { color: #aaa; }
        body.dark-mode .feedback-card hr { border-color: #444; }
    </style>
</head>
<body class="bg-page overlay-60 d-flex flex-column min-vh-100"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>

<div class="container content-wrapper flex-grow-1">
    <h2 class="text-white text-center mb-5">💬 Community Feedback</h2>
    <div id="feedback-list">
        <?php while ($row = mysqli_fetch_assoc($result)): ?>
            <div class="feedback-card" id="feedback-<?= (int) $row['id'] ?>">

                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <strong class="feedback-message">
                            <?= htmlspecialchars($row['name']) ?>
                        </strong>
                        <span class="feedback-meta ms-1">
                            (<?= htmlspecialchars($row['email']) ?>)
                        </span>
                    </div>
                    <form method="POST"
                          onsubmit="return deleteFeedback(this, <?= (int) $row['id'] ?>);"
                          class="d-inline ms-2 flex-shrink-0">
                        <input type="hidden" name="csrf_token"
                               value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                        <input type="hidden" name="delete_id" value="<?= (int) $row['id'] ?>">
                        <button type="submit" name="delete_feedback"
                                class="btn btn-sm btn-outline-danger">🗑</button>
                    </form>
                </div>

                <div class="feedback-meta mb-2">
                    <?= date('F j, Y, g:i a', strtotime($row['created_at'])) ?>
                </div>

                <p class="feedback-message mb-0">
                    <?= nl2br(htmlspecialchars($row['message'])) ?>
                </p>

                <?php if (!empty($row['admin_response'])): ?>
                    <hr>
                    <div class="admin-response">
                        <div class="admin-meta mb-1">
                            <strong>Answered by <?= htmlspecialchars($row['admin_username']) ?></strong>
                            · <?= date('F j, Y, g:i a', strtotime($row['admin_response_at'])) ?>
                        </div>
                        <?= nl2br(htmlspecialchars($row['admin_response'])) ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endwhile; ?>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
function deleteFeedback(form, id) {
    fetch(window.location.href, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(form)
    }).then(() => {
        const card = document.getElementById('feedback-' + id);
        card.classList.add('fade-out');
        setTimeout(() => card.remove(), 600);
    });
    return false;
}
</script>
</body>
</html>
<?php mysqli_close($link); ?>