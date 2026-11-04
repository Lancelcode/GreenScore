<?php
declare(strict_types=1);

namespace GreenScore;

/**
 * Credential checks, independent of the database so they can be unit tested.
 */
final class Auth
{
    public const NOT_FOUND   = 'Email address and password not found.';
    public const WRONG_PASS  = 'Incorrect password.';
    // Hash of a random throwaway string, used only to equalise timing.
    private const DUMMY_HASH = '$2y$10$CbW1KJnEJ72vsZzBGZodm.PdssHTyMWPzigNPg0Ru0dlpedDMpSgW';

    public const DEACTIVATED = 'This account has been deactivated. Please contact an administrator.';

    /**
     * Check a submitted password against the user row loaded by email.
     *
     * @param array<string, mixed>|null $user Row with at least `password` and `status`, or null if no such email
     * @return array{0: bool, 1: array<string, mixed>|list<string>} [true, user] or [false, errors]
     */
    public static function check(?array $user, string $email, string $password): array
    {
        $errors = [];
        if ($email === '') {
            $errors[] = 'Enter your email address.';
        }
        if ($password === '') {
            $errors[] = 'Enter your password.';
        }
        if ($errors !== []) {
            return [false, $errors];
        }

        if ($user === null) {
            // Still run a hash check so response time does not reveal whether the email exists.
            password_verify($password, self::DUMMY_HASH);
            return [false, [self::NOT_FOUND]];
        }

        if (!password_verify($password, (string) ($user['password'] ?? ''))) {
            return [false, [self::WRONG_PASS]];
        }

        if (($user['status'] ?? 'active') === 'deactivated') {
            return [false, [self::DEACTIVATED]];
        }

        unset($user['password']);
        return [true, $user];
    }
}
