<?php
// ── isActive() ───────────────────────────────────────────────
// Returns 'nav-active' if the current page URL contains $path.
// Used by nav.php to highlight the current section.
// Uses a custom class name to avoid conflicting with Bootstrap's
// own 'active' class which affects dropdown JS behaviour.
function isActive(string $path): string {
    $current = $_SERVER['SCRIPT_NAME'] ?? '';
    return str_contains($current, $path) ? 'nav-active' : '';
}

// ── renderEditButton() ───────────────────────────────────────
// Renders the Edit Details button for a user row in manage_users.php
function renderEditButton(int $id, string $b): string {
    return '<a href="' . htmlspecialchars($b, ENT_QUOTES) . '/pages/admin/edit_user.php?id=' . $id
         . '" class="btn btn-sm btn-outline-secondary">&#9999;&#65039; Edit Details</a>';
}

// ── renderRoleStatusForms() ──────────────────────────────────
// Renders the inline role and status update forms for a user row
// in manage_users.php
function renderRoleStatusForms(array $row): string {
    $csrf = htmlspecialchars($_SESSION['csrf_token'] ?? '');
    $id   = (int) $row['id'];

    $roleSelected = [
        'user'  => $row['role'] === 'user'  ? 'selected' : '',
        'admin' => $row['role'] === 'admin' ? 'selected' : '',
    ];

    $statusSelected = [
        'active'      => $row['status'] === 'active'      ? 'selected' : '',
        'inactive'    => $row['status'] === 'inactive'    ? 'selected' : '',
        'deactivated' => $row['status'] === 'deactivated' ? 'selected' : '',
    ];

    return "
    <form method='post' class='d-inline-block me-2'>
        <input type='hidden' name='csrf_token' value='{$csrf}'>
        <input type='hidden' name='action' value='update_role'>
        <input type='hidden' name='user_id' value='{$id}'>
        <select name='role' class='form-select form-select-sm d-inline-block w-auto'>
            <option value='user'  {$roleSelected['user']}>User</option>
            <option value='admin' {$roleSelected['admin']}>Admin</option>
        </select>
        <button class='btn btn-sm btn-outline-primary' type='submit'>Save</button>
    </form>
    <form method='post' class='d-inline-block'>
        <input type='hidden' name='csrf_token' value='{$csrf}'>
        <input type='hidden' name='action' value='update_status'>
        <input type='hidden' name='user_id' value='{$id}'>
        <select name='status' class='form-select form-select-sm d-inline-block w-auto'>
            <option value='active'      {$statusSelected['active']}>Active</option>
            <option value='inactive'    {$statusSelected['inactive']}>Inactive</option>
            <option value='deactivated' {$statusSelected['deactivated']}>Deactivated</option>
        </select>
        <button class='btn btn-sm btn-outline-primary' type='submit'>Save</button>
    </form>";
}