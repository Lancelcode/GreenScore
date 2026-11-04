<?php
require_once __DIR__ . '/../../includes/init.php';

if (!isset($_SESSION['username']) || !isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

require_once ROOT_PATH . '/includes/connect_db.php';
$b      = BASE_URL;
$userId = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($link,
    "SELECT id, card_last4, expiry_date, cardholder_name
     FROM credit_cards
     WHERE user_id = ?"
);
mysqli_stmt_bind_param($stmt, 'i', $userId);
mysqli_stmt_execute($stmt);
$r    = mysqli_stmt_get_result($stmt);
$rows = mysqli_fetch_all($r, MYSQLI_ASSOC);
mysqli_stmt_close($stmt);
mysqli_close($link);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>View Credit Cards | GreenScore</title>
    <meta name="description" content="Manage your saved credit cards on GreenScore.">
    <style>
        footer { background-color: #fff; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-money.jpg'); color: #333;">
<?php include ROOT_PATH . '/includes/nav.php'; ?>

<div class="container content-wrapper">
    <h2 class="text-white text-center mb-4">💳 Your Saved Credit Cards</h2>

    <?php if (!empty($rows)): ?>
        <div class="card card-bg shadow-sm p-4 mb-4">
            <div class="table-responsive">
                <table class="table table-striped align-middle mb-0">
                    <thead class="table-success">
                        <tr>
                            <th>Card Number</th>
                            <th>Expiry</th>
                            <th>Cardholder</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($rows as $row): ?>
                        <tr>
                            <td><?= e(\GreenScore\Card::mask($row['card_last4'])) ?></td>
                            <td><?= date('m/Y', strtotime($row['expiry_date'])) ?></td>
                            <td><?= htmlspecialchars($row['cardholder_name']) ?></td>
                            <td>
                                <button class="btn btn-sm btn-danger"
                                        data-bs-toggle="modal"
                                        data-bs-target="#delModal<?= (int) $row['id'] ?>">
                                    🗑 Delete
                                </button>
                                <button class="btn btn-sm btn-warning ms-1"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editModal<?= (int) $row['id'] ?>">
                                    ✏️ Edit
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php else: ?>
        <div class="card card-bg shadow-sm p-5 text-center">
            <div style="font-size:3rem;">💳</div>
            <h4 class="mt-3 mb-2">No saved cards yet</h4>
            <p class="text-muted mb-4">Add a credit card from your profile to use for contributions.</p>
            <a href="<?= $b ?>/pages/user/user_account.php"
               class="btn btn-success px-4">👤 Go to My Profile</a>
        </div>
    <?php endif; ?>

    <div class="mt-4 text-center">
        <a href="<?= $b ?>/pages/user/user_account.php" class="btn btn-outline-light">
            ⬅ Back to My Profile
        </a>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?>

<?php foreach ($rows as $row): ?>
<!-- Delete Modal — outside table so Bootstrap can position it correctly -->
<div class="modal fade" id="delModal<?= (int) $row['id'] ?>" tabindex="-1"
     aria-labelledby="delModalLabel<?= (int) $row['id'] ?>" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="<?= $b ?>/pages/user/manage_credit_card.php" method="post">
                <input type="hidden" name="csrf_token"
                       value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="card_id" value="<?= (int) $row['id'] ?>">
                <div class="modal-header">
                    <h5 class="modal-title" id="delModalLabel<?= (int) $row['id'] ?>">Confirm Deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete the card ending in
                    <strong><?= e($row['card_last4']) ?></strong>?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"
                            data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Yes, Delete</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal — outside table so Bootstrap can position it correctly -->
<div class="modal fade" id="editModal<?= (int) $row['id'] ?>" tabindex="-1"
     aria-labelledby="editModalLabel<?= (int) $row['id'] ?>" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="<?= $b ?>/pages/user/manage_credit_card.php" method="post">
                <input type="hidden" name="csrf_token"
                       value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="card_id" value="<?= (int) $row['id'] ?>">
                <div class="modal-header">
                    <h5 class="modal-title" id="editModalLabel<?= (int) $row['id'] ?>">Edit Card</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="small text-muted">
                        Card ending <strong><?= e($row['card_last4']) ?></strong>. To change the
                        number, delete this card and add a new one.
                    </p>
                    <div class="mb-3">
                        <label class="form-label" for="expiry<?= (int) $row['id'] ?>">Expiry (month)</label>
                        <input type="month" class="form-control" name="expiry_date" id="expiry<?= (int) $row['id'] ?>"
                               value="<?= e(substr($row['expiry_date'], 0, 7)) ?>"
                               required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="holder<?= (int) $row['id'] ?>">Cardholder Name</label>
                        <input type="text" class="form-control" name="card_name" id="holder<?= (int) $row['id'] ?>"
                               value="<?= e($row['cardholder_name']) ?>"
                               maxlength="100" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"
                            data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">💾 Save Changes</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endforeach; ?>

<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>