<?php
declare(strict_types=1);

namespace GreenScore;

/**
 * Input validation rules shared by the registration form, the community board
 * and anywhere else user input is accepted.
 */
final class Validator
{
    public const COMMON_PASSWORDS = [
        'password', 'password1', '12345678', '123456789', 'qwerty123',
        'iloveyou', 'sunshine', 'princess', 'letmein1', 'welcome1',
        'monkey123', 'dragon12', 'football', 'baseball', 'abc12345',
    ];

    public const TIP_MAX_LENGTH = 500;

    /**
     * Returns the first password rule that fails, or null if the password is
     * acceptable. Passwords are not trimmed: spaces are significant.
     */
    public static function passwordError(string $password, string $confirm): ?string
    {
        return match (true) {
            $password === ''                    => 'Enter your password.',
            strlen($password) < 8               => 'Password must be at least 8 characters.',
            // bcrypt silently truncates at 72 bytes, so reject anything longer
            strlen($password) > 72              => 'Password cannot exceed 72 characters.',
            !preg_match('/[A-Z]/', $password)   => 'Password must contain at least one uppercase letter.',
            !preg_match('/[a-z]/', $password)   => 'Password must contain at least one lowercase letter.',
            !preg_match('/[0-9]/', $password)   => 'Password must contain at least one number.',
            in_array(strtolower($password), self::COMMON_PASSWORDS, true)
                                                => 'That password is too common. Please choose a stronger one.',
            $password !== $confirm              => 'Passwords do not match.',
            default                             => null,
        };
    }

    /**
     * Validate the registration form.
     *
     * @param array<string, mixed> $input Raw $_POST data
     * @return array{errors: list<string>, data: array{username:string, email:string,
     *               company_name:string, contact_person:string, phone_number:string, password:string}}
     */
    public static function registration(array $input): array
    {
        $str = static fn (string $k): string => is_string($input[$k] ?? null) ? trim($input[$k]) : '';

        $data = [
            'username'       => $str('username'),
            'email'          => $str('email'),
            'company_name'   => $str('company_name'),
            'contact_person' => $str('contact_person'),
            'phone_number'   => trim((string) preg_replace('/[^\d+\-\s()]/', '', $str('phone_number'))),
            'password'       => is_string($input['pass1'] ?? null) ? $input['pass1'] : '',
        ];
        $confirm = is_string($input['pass2'] ?? null) ? $input['pass2'] : '';
        $errors  = [];

        // Length limits match the new_users column sizes.
        if ($data['username'] === '') {
            $errors[] = 'Enter your name.';
        } elseif (mb_strlen($data['username']) > 50) {
            $errors[] = 'Name cannot exceed 50 characters.';
        }

        if ($data['email'] === '') {
            $errors[] = 'Enter your email address.';
        } elseif (strlen($data['email']) > 100) {
            $errors[] = 'Email cannot exceed 100 characters.';
        } elseif (!self::isEmail($data['email'])) {
            $errors[] = 'Enter a valid email address (e.g. name@example.com).';
        }

        if ($data['company_name'] === '') {
            $errors[] = 'Enter your company name.';
        } elseif (mb_strlen($data['company_name']) > 100) {
            $errors[] = 'Company name cannot exceed 100 characters.';
        }

        if ($data['contact_person'] === '') {
            $errors[] = "Enter the contact person's name.";
        } elseif (mb_strlen($data['contact_person']) > 100) {
            $errors[] = "Contact person's name cannot exceed 100 characters.";
        }

        $digits = (string) preg_replace('/\D/', '', $data['phone_number']);
        if ($data['phone_number'] === '') {
            $errors[] = 'Enter a phone number.';
        } elseif (strlen($digits) < 7) {
            $errors[] = 'Phone number must have at least 7 digits.';
        } elseif (strlen($digits) > 15) {
            $errors[] = 'Phone number cannot exceed 15 digits (international standard).';
        } elseif (strlen($data['phone_number']) > 20) {
            $errors[] = 'Phone number cannot exceed 20 characters.';
        }

        $passwordError = self::passwordError($data['password'], $confirm);
        if ($passwordError !== null) {
            $errors[] = $passwordError;
        }

        return ['errors' => $errors, 'data' => $data];
    }

    public static function isEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false
            && preg_match('/\.[a-zA-Z]{2,}$/', $email) === 1;
    }

    /**
     * Normalise a community tip. Returns the trimmed message, or null if it is
     * empty or too long.
     */
    public static function tipMessage(mixed $raw): ?string
    {
        if (!is_string($raw)) {
            return null;
        }
        $message = trim($raw);
        if ($message === '' || mb_strlen($message) > self::TIP_MAX_LENGTH) {
            return null;
        }
        return $message;
    }

    /** Page number from a query-string value: always an integer >= 1. */
    public static function pageNumber(mixed $raw): int
    {
        return max(1, is_numeric($raw) ? (int) $raw : 1);
    }

    public static function offset(int $page, int $perPage): int
    {
        return (max(1, $page) - 1) * $perPage;
    }

    public static function totalPages(int $total, int $perPage): int
    {
        return $perPage > 0 ? (int) ceil($total / $perPage) : 0;
    }
}
