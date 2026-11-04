<?php
declare(strict_types=1);

namespace GreenScore;

/**
 * Reads configuration from environment variables, with an optional `.env`
 * file for local (non-Docker) development. Real environment variables always
 * win over values in the file.
 */
final class Env
{
    /** @var array<string, string> */
    private static array $fileValues = [];

    public static function load(string $path): void
    {
        if (is_file($path) && is_readable($path)) {
            self::$fileValues = self::parse((string) file_get_contents($path));
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = getenv($key);
        if ($value !== false && $value !== '') {
            return $value;
        }
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            return (string) $_ENV[$key];
        }
        return self::$fileValues[$key] ?? $default;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = self::get($key);
        if ($value === null) {
            return $default;
        }
        return in_array(strtolower($value), ['1', 'true', 'yes', 'on'], true);
    }

    /**
     * Parse KEY=VALUE lines. Blank lines and lines starting with # are ignored;
     * matching single or double quotes around a value are stripped.
     *
     * @return array<string, string>
     */
    public static function parse(string $contents): array
    {
        $values = [];
        foreach (preg_split('/\R/', $contents) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = array_map('trim', explode('=', $line, 2));
            if ($key === '' || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $key)) {
                continue;
            }
            if (strlen($value) >= 2
                && ($value[0] === '"' || $value[0] === "'")
                && $value[-1] === $value[0]) {
                $value = substr($value, 1, -1);
            }
            $values[$key] = $value;
        }
        return $values;
    }
}
