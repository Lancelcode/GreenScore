<?php
declare(strict_types=1);

namespace GreenScore;

use DateTimeImmutable;

/**
 * Saved payment card helpers.
 *
 * GreenScore never stores a full card number or a security code (CVV): only
 * the last four digits, the expiry month and the cardholder name are kept so
 * a user can recognise a card. A real deployment would hand payment details
 * to a PCI-compliant payment provider instead.
 */
final class Card
{
    public static function digits(string $number): string
    {
        return (string) preg_replace('/\D/', '', $number);
    }

    /** Luhn checksum used by all major card schemes. */
    public static function passesLuhn(string $digits): bool
    {
        if ($digits === '' || !ctype_digit($digits)) {
            return false;
        }
        $sum    = 0;
        $double = false;
        for ($i = strlen($digits) - 1; $i >= 0; $i--) {
            $d = (int) $digits[$i];
            if ($double) {
                $d *= 2;
                if ($d > 9) {
                    $d -= 9;
                }
            }
            $sum   += $d;
            $double = !$double;
        }
        return $sum % 10 === 0;
    }

    public static function lastFour(string $number): string
    {
        return substr(self::digits($number), -4);
    }

    public static function mask(string $lastFour): string
    {
        return '•••• •••• •••• ' . $lastFour;
    }

    /**
     * Parse an expiry given as YYYY-MM (month input) or YYYY-MM-DD (date
     * input). Returns the first day of that month, or null if invalid.
     */
    public static function parseExpiry(string $value): ?DateTimeImmutable
    {
        $value = trim($value);
        if (preg_match('/^(\d{4})-(\d{2})(?:-(\d{2}))?$/', $value, $m) !== 1) {
            return null;
        }
        $year  = (int) $m[1];
        $month = (int) $m[2];
        if ($month < 1 || $month > 12 || $year < 2000 || $year > 2100) {
            return null;
        }
        return new DateTimeImmutable(sprintf('%04d-%02d-01', $year, $month));
    }

    public static function isExpired(DateTimeImmutable $expiry, ?DateTimeImmutable $now = null): bool
    {
        $now ??= new DateTimeImmutable('today');
        // A card is valid until the end of its expiry month.
        return $expiry->format('Y-m') < $now->format('Y-m');
    }

    /**
     * Validate a new card. Returns a list of error messages (empty if valid).
     *
     * @return list<string>
     */
    public static function validateNew(string $number, string $expiry, string $holder,
                                       ?DateTimeImmutable $now = null): array
    {
        $errors = [];
        $digits = self::digits($number);
        if (strlen($digits) < 12 || strlen($digits) > 19 || !self::passesLuhn($digits)) {
            $errors[] = 'Enter a valid card number.';
        }
        return array_merge($errors, self::validateDetails($expiry, $holder, $now));
    }

    /**
     * Validate the editable details of a saved card (expiry and name).
     *
     * @return list<string>
     */
    public static function validateDetails(string $expiry, string $holder,
                                           ?DateTimeImmutable $now = null): array
    {
        $errors = [];
        $date   = self::parseExpiry($expiry);
        if ($date === null) {
            $errors[] = 'Enter a valid expiry date.';
        } elseif (self::isExpired($date, $now)) {
            $errors[] = 'That card has expired.';
        }
        $holder = trim($holder);
        if ($holder === '' || mb_strlen($holder) > 100) {
            $errors[] = 'Enter the cardholder name (up to 100 characters).';
        }
        return $errors;
    }
}
