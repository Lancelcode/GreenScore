<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

$logged_in_user = $_SESSION['user_id'] ?? null;
$b              = BASE_URL;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_tip'])) {
    \GreenScore\Csrf::requireValid();
    if (isset($_POST['delete_id']) && ctype_digit((string) $_POST['delete_id'])) {
        $deleteId = (int) $_POST['delete_id'];
        $stmt = mysqli_prepare($link,
            "DELETE FROM community_tips WHERE id = ? AND user_id = ? LIMIT 1"
        );
        mysqli_stmt_bind_param($stmt, 'ii', $deleteId, $logged_in_user);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])) exit();
    header('Location: ' . $b . '/pages/community/community.php');
    exit();
}


$limit  = 5;
$page   = \GreenScore\Validator::pageNumber($_GET['page'] ?? null);
$offset = \GreenScore\Validator::offset($page, $limit);
$search = is_string($_GET['search'] ?? null) ? mb_substr(trim($_GET['search']), 0, 100) : '';

if ($search !== '') {
    $like = '%' . $search . '%';
    $count_stmt = mysqli_prepare($link,
        "SELECT COUNT(*) AS total FROM community_tips WHERE message LIKE ?"
    );
    mysqli_stmt_bind_param($count_stmt, 's', $like);
    mysqli_stmt_execute($count_stmt);
    $total = (int) mysqli_fetch_assoc(mysqli_stmt_get_result($count_stmt))['total'];
    mysqli_stmt_close($count_stmt);

    $stmt = mysqli_prepare($link,
        "SELECT ct.id, ct.user_id, ct.message, ct.created_at, u.username
         FROM community_tips ct
         JOIN new_users u ON ct.user_id = u.id
         WHERE ct.message LIKE ?
         ORDER BY ct.created_at DESC
         LIMIT ? OFFSET ?"
    );
    mysqli_stmt_bind_param($stmt, 'sii', $like, $limit, $offset);
} else {
    $count_result = mysqli_query($link, "SELECT COUNT(*) AS total FROM community_tips");
    $total        = (int) mysqli_fetch_assoc($count_result)['total'];

    $stmt = mysqli_prepare($link,
        "SELECT ct.id, ct.user_id, ct.message, ct.created_at, u.username
         FROM community_tips ct
         JOIN new_users u ON ct.user_id = u.id
         ORDER BY ct.created_at DESC
         LIMIT ? OFFSET ?"
    );
    mysqli_stmt_bind_param($stmt, 'ii', $limit, $offset);
}

$total_pages = \GreenScore\Validator::totalPages($total, $limit);
mysqli_stmt_execute($stmt);
$results = mysqli_stmt_get_result($stmt);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Community Board | GreenScore</title>
    <style>
        footer { background-color: #fff; color: #444; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper">
<main id="main" tabindex="-1">
    <div class="container content-wrapper">
        <h1 class="text-white text-center mb-4">📝 Sustainability Community Board</h1>
        <p class="lead text-center text-white mb-4">Share your eco-friendly tips 💚</p>

        <!-- Search bar -->
        <form method="GET" class="mb-4" role="search" aria-label="Search community tips">
            <div class="input-group">
                <label for="tipSearch" class="visually-hidden">Search tips</label>
                <input type="search" name="search" id="tipSearch" class="form-control"
                       placeholder="🔍 Search tips..."
                       value="<?= htmlspecialchars($search) ?>"
                       maxlength="100">
                <button class="btn btn-success" type="submit">Search</button>
                <?php if ($search !== ''): ?>
                    <a href="<?= $b ?>/pages/community/community.php"
                       class="btn btn-outline-light">✕ Clear search</a>
                <?php endif; ?>
            </div>
            <?php if ($search !== ''): ?>
                <small class="text-white mt-1 d-block" role="status">
                    <?= $total ?> result<?= $total !== 1 ? 's' : '' ?> for
                    "<strong><?= htmlspecialchars($search) ?></strong>"
                </small>
            <?php endif; ?>
        </form>

        <div class="card card-bg shadow-sm mb-4">
            <div class="card-body">
                <form action="<?= $b ?>/pages/community/post_tip.php" method="POST"
                      aria-label="Post a new sustainability tip">
                    <input type="hidden" name="csrf_token"
                           value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
                    <label for="tipMessage" class="form-label fw-semibold">Share a tip:</label>
                    <textarea name="message" id="tipMessage" rows="3" class="form-control"
                              placeholder="E.g. I switched to bamboo toothbrushes!"
                              maxlength="500" required
                              aria-describedby="tipCounter"></textarea>
                    <div class="d-flex justify-content-between align-items-center mt-1 mb-2">
                        <small id="tipCounter" class="text-muted" aria-live="polite">0 / 500</small>
                        <small class="text-muted fst-italic">Keep it concise and helpful 🌱</small>
                    </div>
                    <button type="submit" class="btn btn-success">✅ Post Tip</button>
                </form>
                <div class="mt-3">
                    <form method="POST" action="<?= $b ?>/pages/community/clear_tips.php"
                          onsubmit="return confirm('⚠️ Clear all your tips? This cannot be undone.')">
                        <input type="hidden" name="csrf_token"
                               value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
                        <button type="submit" class="btn btn-danger">🧹 Clear My Tips</button>
                    </form>
                </div>
                <div class="mt-3">
                    <a href="<?= $b ?>/pages/user/user_account.php" class="btn btn-outline-dark">
                        👤 Back to My Profile
                    </a>
                </div>
            </div>
        </div>

        <div class="card card-bg shadow-sm mb-4">
            <div class="card-body">
                <h2 class="h4 mb-4">💬 Latest Tips</h2>

                <?php if (mysqli_num_rows($results) > 0): ?>
                    <?php while ($row = mysqli_fetch_assoc($results)): ?>
                        <div class="mb-4 border-bottom pb-3" id="tip-<?= (int) $row['id'] ?>">
                            <p class="mb-1">🟢 <?= htmlspecialchars($row['message']) ?></p>
                            <small class="text-muted">
                                By <?= htmlspecialchars($row['username']) ?>
                                • <?= date('F j, Y, g:i a', strtotime($row['created_at'])) ?>
                            </small>

                            <?php if ($logged_in_user !== null && (int) $logged_in_user === (int) $row['user_id']): ?>
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-outline-primary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editModal"
                                            data-id="<?= (int) $row['id'] ?>"
                                            data-message="<?= htmlspecialchars($row['message'], ENT_QUOTES) ?>">
                                        ✏️ Edit
                                    </button>
                                    <form method="POST"
                                          onsubmit="return deleteTip(this, <?= (int) $row['id'] ?>);"
                                          class="d-inline">
                                        <input type="hidden" name="csrf_token"
                                               value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
                                        <input type="hidden" name="delete_id" value="<?= (int) $row['id'] ?>">
                                        <button type="submit" name="delete_tip"
                                                class="btn btn-sm btn-outline-danger">🗑 Delete</button>
                                    </form>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p class="text-muted text-center py-3">No tips shared yet. Be the first! 🌱</p>
                <?php endif; ?>
            </div>
        </div>

        <?php if ($total_pages > 1): ?>
            <nav class="mt-4" aria-label="Community tips pagination">
                <ul class="pagination justify-content-center">
                    <?php for ($p = 1; $p <= $total_pages; $p++):
                        $params = ['page' => $p];
                        if ($search !== '') $params['search'] = $search;
                    ?>
                        <li class="page-item <?= ($p === $page) ? 'active' : '' ?>">
                            <a class="page-link"
                               href="?<?= http_build_query($params) ?>"
                               aria-label="Page <?= $p ?>"<?= ($p === $page) ? ' aria-current="page"' : '' ?>><?= $p ?></a>
                        </li>
                    <?php endfor; ?>
                </ul>
            </nav>
        <?php endif; ?>
    </div>

    </main>
    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>

<div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalTitle">
    <div class="modal-dialog">
        <form class="modal-content" action="<?= $b ?>/pages/community/edit_tip.php" method="POST">
            <input type="hidden" name="csrf_token"
                   value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
            <div class="modal-header">
                <h2 class="modal-title h5" id="editModalTitle">Edit Tip</h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" name="tip_id" id="editTipId">
                <label for="editTipMessage" class="form-label">Your tip</label>
                <textarea class="form-control" name="message"
                          id="editTipMessage" rows="4"
                          maxlength="500" required aria-describedby="editTipCounter"></textarea>
                <small id="editTipCounter" class="text-muted" aria-live="polite">0 / 500</small>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-success">💾 Save Changes</button>
            </div>
        </form>
    </div>
</div>

<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
<script>
const editModal = document.getElementById('editModal');
editModal.addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    const msg    = button.getAttribute('data-message');
    document.getElementById('editTipId').value      = button.getAttribute('data-id');
    document.getElementById('editTipMessage').value = msg;
    document.getElementById('editTipCounter').textContent = msg.length + ' / 500';
});

// Character counters
function wireCounter(textareaId, counterId) {
    const ta      = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    if (!ta || !counter) return;
    ta.addEventListener('input', function () {
        const len = ta.value.length;
        const max = parseInt(ta.getAttribute('maxlength')) || 500;
        counter.textContent = len + ' / ' + max;
        counter.style.color = len >= max * 0.9 ? '#dc3545' : '#6c757d';
    });
}

wireCounter('tipMessage',    'tipCounter');
wireCounter('editTipMessage','editTipCounter');

function deleteTip(form, id) {
    const data = new FormData(form);
    // FormData(form) omits the clicked button, so add the flag the server checks for.
    data.append('delete_tip', '1');
    fetch(window.location.href, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: data
    }).then((response) => {
        if (!response.ok) { form.submit(); return; }
        const card = document.getElementById('tip-' + id);
        card.classList.add('fade-out');
        setTimeout(() => card.remove(), 600);
    });
    return false;
}
</script>
</body>
</html>
<?php
mysqli_stmt_close($stmt);
mysqli_close($link);
?>