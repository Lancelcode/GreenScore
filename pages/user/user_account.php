<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';


if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

$b       = BASE_URL;
$user_id = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($link,
    "SELECT username, email, created_at, status, company_name, contact_person, phone_number
     FROM new_users WHERE id = ?"
);
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

$row      = mysqli_fetch_assoc($result);
$username = htmlspecialchars($row['username']);
$email    = htmlspecialchars($row['email']);
$date     = date('d/m/Y', strtotime($row['created_at']));
$status   = htmlspecialchars($row['status']);
$company  = htmlspecialchars($row['company_name']   ?? '—');
$contact  = htmlspecialchars($row['contact_person'] ?? '—');
$phone    = htmlspecialchars($row['phone_number']   ?? '—');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>My Profile | GreenScore</title>
    <meta name="description" content="Manage your GreenScore profile, certificates and sustainability progress.">
    <style>
        footer { color: #444; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>

<div class="container content-wrapper">
    <h1 class="text-white text-center display-5 mb-5">
        👤 My Profile — Welcome, <span class="text-success"><?= $username ?></span>!
    </h1>

    <div class="row gy-4">
        <div class="col-md-6">
            <div class="card card-bg shadow-sm h-100">
                <div class="card-body">
                    <h5 class="card-title">Account Details</h5>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item"><strong>Username:</strong> <?= $username ?></li>
                        <li class="list-group-item"><strong>User ID:</strong> EC2024/<?= $user_id ?></li>
                        <li class="list-group-item"><strong>Email:</strong> <?= $email ?></li>
                        <li class="list-group-item"><strong>Company:</strong> <?= $company ?></li>
                        <li class="list-group-item"><strong>Contact Person:</strong> <?= $contact ?></li>
                        <li class="list-group-item"><strong>Phone:</strong> <?= $phone ?></li>
                        <li class="list-group-item"><strong>Member Since:</strong> <?= $date ?></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card card-bg shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">Actions</h5>
                    <a href="<?= $b ?>/pages/user/my_impact.php"
                       class="btn btn-success mb-3">📈 View My Impact</a>
                    <a href="<?= $b ?>/pages/calculator/certificate_history.php"
                       class="btn btn-success mb-3">🏅 Certificate History</a>
                    <a href="<?= $b ?>/pages/calculator/green_calculator.php"
                       class="btn btn-success mb-3">🧮 Take Green Calculator</a>
                    <a href="<?= $b ?>/pages/community/community.php"
                       class="btn btn-success mb-3">🌱 Visit Community</a>
                    <?php
                    $btnClass = 'btn-info';
                    if ($status === 'inactive')        $btnClass = 'btn-warning';
                    elseif ($status === 'deactivated') $btnClass = 'btn-dark';
                    ?>
                    <button class="btn <?= $btnClass ?> mt-auto" disabled>
                        🔖 Status: <?= ucfirst($status) ?>
                    </button>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card card-bg shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">💳 Add Credit Card</h5>
                    <form action="<?= $b ?>/pages/user/manage_credit_card.php"
                          method="POST" class="row g-3">
                        <input type="hidden" name="csrf_token"
                               value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                        <input type="hidden" name="action" value="add">

                        <div class="col-12">
                            <p class="small text-muted mb-0">
                                Demo feature: only the last four digits are stored, and the
                                security code is never asked for. Use a test number such as
                                4111 1111 1111 1111.
                            </p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="card_number">Card Number</label>
                            <input type="text" class="form-control" name="card_number" id="card_number"
                                   inputmode="numeric" autocomplete="cc-number" maxlength="23" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="expiry_date">Expiry (month)</label>
                            <input type="month" class="form-control" name="expiry_date" id="expiry_date"
                                   autocomplete="cc-exp" required>
                        </div>
                        <div class="col-12">
                            <label class="form-label" for="card_name">Cardholder Name</label>
                            <input type="text" class="form-control" name="card_name" id="card_name"
                                   autocomplete="cc-name" maxlength="100" required>
                        </div>
                        <div class="col-md-6">
                            <button type="submit" class="btn btn-success w-100">💾 Add Card</button>
                        </div>
                        <div class="col-md-6">
                            <a href="<?= $b ?>/pages/user/view_cards.php"
                               class="btn btn-outline-dark w-100">📄 View Cards</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php
mysqli_free_result($result);
mysqli_close($link);
?>