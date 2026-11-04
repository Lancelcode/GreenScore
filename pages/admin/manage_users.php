<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';
require_once ROOT_PATH . '/includes/helpers.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    die("<div class='container mt-5'>
           <div class='alert alert-danger'>Access denied. Admins only.</div>
         </div>");
}

$b       = BASE_URL;
$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    \GreenScore\Csrf::requireValid();
    $delete_id = (int)($_POST['user_id'] ?? 0);
    if ($delete_id === (int)$_SESSION['user_id']) {
        $error = 'You cannot delete your own account.';
    } else {
        $stmt = mysqli_prepare($link, 'DELETE FROM new_users WHERE id = ?');
        mysqli_stmt_bind_param($stmt, 'i', $delete_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        $success = 'User deleted.';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'update_role') {
    \GreenScore\Csrf::requireValid();
    $uid     = (int)($_POST['user_id'] ?? 0);
    $newRole = (($_POST['role'] ?? '') === 'admin') ? 'admin' : 'user';
    if ($uid !== (int)$_SESSION['user_id']) {
        $stmt = mysqli_prepare($link, 'UPDATE new_users SET role = ? WHERE id = ?');
        mysqli_stmt_bind_param($stmt, 'si', $newRole, $uid);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        $success = 'Role updated.';
    } else {
        $error = 'Cannot change your own role.';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'update_status') {
    \GreenScore\Csrf::requireValid();
    $uid       = (int)($_POST['user_id'] ?? 0);
    $allowed   = ['active', 'inactive', 'deactivated'];
    $newStatus = in_array($_POST['status'] ?? '', $allowed, true) ? $_POST['status'] : 'active';
    if ($uid === (int) $_SESSION['user_id']) {
        $error = 'Cannot change your own status.';
    } else {
        $stmt = mysqli_prepare($link, 'UPDATE new_users SET status = ? WHERE id = ?');
        mysqli_stmt_bind_param($stmt, 'si', $newStatus, $uid);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        $success = 'Status updated.';
    }
}

$result = mysqli_query($link,
    'SELECT id, username, email, created_at, role, status FROM new_users ORDER BY username'
);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Manage Users | GreenScore</title>
    <style>
        .auth-wrapper { max-width: 1000px; margin: 0 auto; }

        .section-title {
            color: #198754;
            font-weight: 600;
            font-size: 1.1rem;
            margin: 1.5rem 0 0.75rem;
        }

        /* Table sits inside the white card */
        .table { margin-bottom: 0; }
        .table thead th { font-weight: 600; font-size: 0.85rem; letter-spacing: 0.03em; }
        .table td { vertical-align: middle; font-size: 0.9rem; }

        /* Dark mode table text */
        body.dark-mode .table       { color: #e0e0e0; }
        body.dark-mode .table-hover tbody tr:hover > * { background-color: rgba(255,255,255,0.04); }
        body.dark-mode .bg-white    { background: rgba(30,30,30,0.97) !important; }
        body.dark-mode .admin-title { color: #4ade80; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>

<div class="container content-wrapper">
    <div class="auth-wrapper">
        <div class="auth-card">
            <h2 class="text-success text-center mb-4">👥 Manage Users</h2>

            <?php if ($error): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
            <?php elseif ($success): ?>
                <div class="alert alert-success fade-out"><?= htmlspecialchars($success) ?></div>
            <?php endif; ?>

            <?php
            $sections = [
                ['label' => '✅ Active Users',              'status' => 'active',      'head' => 'table-success', 'delete' => false],
                ['label' => '🕓 Inactive Users',            'status' => 'inactive',    'head' => 'table-warning', 'delete' => false],
                ['label' => '🗑️ Users Marked for Deletion', 'status' => 'deactivated', 'head' => 'table-danger',  'delete' => true ],
            ];

            foreach ($sections as $section):
                mysqli_data_seek($result, 0);

                // Count rows in this section
                $section_count = 0;
                while ($r = mysqli_fetch_assoc($result)) {
                    if ($r['status'] === $section['status']) $section_count++;
                }
                mysqli_data_seek($result, 0);
            ?>
            <div class="section-title"><?= $section['label'] ?>
                <span class="badge bg-secondary fw-normal ms-1"><?= $section_count ?></span>
            </div>

            <?php if ($section_count === 0): ?>
                <p class="text-muted small mb-3">No users in this category.</p>
            <?php else: ?>
            <div class="table-responsive mb-3">
                <table class="table table-hover align-middle bg-white rounded shadow-sm">
                    <thead class="<?= $section['head'] ?>">
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Registered</th>
                            <th>Role &amp; Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php while ($row = mysqli_fetch_assoc($result)):
                        if ($row['status'] !== $section['status']) continue; ?>
                        <tr id="user-row-<?= (int) $row['id'] ?>">
                            <td><strong><?= htmlspecialchars($row['username']) ?></strong></td>
                            <td class="text-muted"><?= htmlspecialchars($row['email']) ?></td>
                            <td class="text-muted"><?= date('d/m/Y', strtotime($row['created_at'])) ?></td>
                            <td><?= renderRoleStatusForms($row) ?></td>
                            <td>
                                <?= renderEditButton((int) $row['id'], $b) ?>
                                <?php if ($section['delete']): ?>
                                <form method="post" class="d-inline ms-2"
                                      onsubmit="return deleteUser(this, <?= (int) $row['id'] ?>);">
                                    <input type="hidden" name="csrf_token"
                                           value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="user_id" value="<?= (int) $row['id'] ?>">
                                    <button class="btn btn-sm btn-danger" type="submit">🗑 Delete</button>
                                </form>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
            <?php endif; ?>
            <?php endforeach; ?>

        </div>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
<script>
function deleteUser(form, id) {
    if (!confirm('Permanently delete this user?')) return false;
    fetch(window.location.href, { method: 'POST', body: new FormData(form) })
        .then(() => {
            const row = document.getElementById('user-row-' + id);
            row.classList.add('fade-out');
            setTimeout(() => row.remove(), 1000);
        });
    return false;
}
</script>
</body>
</html>