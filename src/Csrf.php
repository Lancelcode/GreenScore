<?php
declare(strict_types=1);

namespace GreenScore;

/**
 * Per-session CSRF token (synchroniser token pattern).
 */
final class Csrf
{
    public const KEY = 'csrf_token';

    public static function token(): string
    {
        if (empty($_SESSION[self::KEY]) || !is_string($_SESSION[self::KEY])) {
            $_SESSION[self::KEY] = bin2hex(random_bytes(32));
        }
        return $_SESSION[self::KEY];
    }

    public static function isValid(mixed $submitted): bool
    {
        $expected = $_SESSION[self::KEY] ?? '';
        return is_string($expected) && $expected !== ''
            && is_string($submitted) && hash_equals($expected, $submitted);
    }

    /** Hidden form field carrying the token. */
    public static function field(): string
    {
        return '<input type="hidden" name="' . self::KEY . '" value="' . e(self::token()) . '">';
    }

    /** Stop the request with HTTP 403 if the submitted token is wrong. */
    public static function requireValid(): void
    {
        if (!self::isValid($_POST[self::KEY] ?? null)) {
            http_response_code(403);
            exit('Your session has expired or the form was invalid. Please go back, refresh the page and try again.');
        }
    }
}
