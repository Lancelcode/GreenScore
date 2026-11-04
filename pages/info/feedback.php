<?php
require_once __DIR__ . '/../../includes/init.php';
require_once ROOT_PATH . '/includes/connect_db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/auth/login.php');
    exit();
}

$b          = BASE_URL;
$user_id    = $_SESSION['user_id'];
$user_name  = $_SESSION['username'];
$user_email = $_SESSION['email'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    \GreenScore\Csrf::requireValid();
    $message = is_string($_POST['message'] ?? null) ? trim($_POST['message']) : '';
    if (empty($message)) {
        $_SESSION['toast_warning'] = 'Please enter your feedback before submitting.';
    } else {
        $stmt = mysqli_prepare($link,
            "INSERT INTO feedback (user_id, name, email, message) VALUES (?, ?, ?, ?)"
        );
        mysqli_stmt_bind_param($stmt, 'isss', $user_id, $user_name, $user_email, $message);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        $_SESSION['toast_success'] = 'Thank you! Your feedback has been submitted and will be answered by one of our admins.';
    }
    header('Location: ' . BASE_URL . '/pages/info/feedback.php');
    exit();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include ROOT_PATH . '/includes/head.php'; ?>
    <title>Feedback | GreenScore</title>
    <style>
        footer { background-color: #fff; margin-top: auto; }
    </style>
</head>
<body class="bg-page overlay-50"
      style="background-image: url('<?= $b ?>/assets/images/forest-hero.jpg');">
<?php include ROOT_PATH . '/includes/nav.php'; ?>
<div class="page-wrapper">
<main id="main" tabindex="-1">
    <div class="container content-wrapper">
        <h1 class="h2 text-white text-center mb-4">💬 We Value Your Feedback</h1>

        <form method="POST" class="card card-bg p-4 shadow-sm mb-5">
            <input type="hidden" name="csrf_token"
                   value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
            <div class="form-group mb-3">
                <label for="fbName" class="form-label">Your Name:</label>
                <input type="text" id="fbName" class="form-control"
                       value="<?= htmlspecialchars($user_name) ?>" disabled>
            </div>
            <div class="form-group mb-3">
                <label for="fbEmail" class="form-label">Your Email:</label>
                <input type="email" id="fbEmail" class="form-control"
                       value="<?= htmlspecialchars($user_email) ?>" disabled>
            </div>
            <div class="form-group mb-3">
                <label for="fbMessage" class="form-label">Your Feedback:</label>
                <textarea class="form-control" name="message" id="fbMessage" rows="4" required maxlength="2000"></textarea>
            </div>
            <button type="submit" class="btn btn-success w-100">✅ Submit Feedback</button>
        </form>

        <h2 class="h4 text-white mb-4">🗃 Public Feedback</h2>

        <?php
        $sql = "SELECT name, created_at, message,
                       admin_response, admin_username, admin_response_at
                FROM feedback
                WHERE visible_to_public = 1
                ORDER BY created_at DESC";
        $res = mysqli_query($link, $sql);

        if (mysqli_num_rows($res) > 0):
            while ($row = mysqli_fetch_assoc($res)): ?>
                <div class="card card-bg card-body mb-4 shadow-sm">
                    <p class="mb-1">
                        <strong><?= htmlspecialchars($row['name']) ?></strong>
                    </p>
                    <small class="text-muted">
                        Asked <?= date('F j, Y, g:i a', strtotime($row['created_at'])) ?>
                    </small>
                    <p class="mt-2"><?= nl2br(htmlspecialchars($row['message'])) ?></p>

                    <?php if (!empty($row['admin_response'])): ?>
                        <hr>
                        <p class="mb-1">
                            <strong>Answered by <?= htmlspecialchars($row['admin_username']) ?></strong>
                            <small class="text-muted">
                                <?= date('F j, Y, g:i a', strtotime($row['admin_response_at'])) ?>
                            </small>
                        </p>
                        <div class="alert alert-secondary mb-0">
                            <?= nl2br(htmlspecialchars($row['admin_response'])) ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endwhile;
        else: ?>
            <div class="card card-bg p-5 text-center">
                <div style="font-size:3rem;">💬</div>
                <h5 class="mt-3 mb-2">No public feedback yet</h5>
                <p class="text-muted mb-0">Be the first to submit feedback above.</p>
            </div>
        <?php endif;
        mysqli_close($link);
        ?>
    </div>

    </main>
    <?php include ROOT_PATH . '/includes/footer.php'; ?>
</div>
<script src="<?= BASE_URL ?>/assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>
</html>