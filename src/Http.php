<?php
declare(strict_types=1);

namespace GreenScore;

final class Http
{
    /**
     * The visitor's IP address, used for login rate limiting.
     *
     * Behind a reverse proxy (Caddy), REMOTE_ADDR is the proxy's address, so
     * every visitor would share one rate-limit bucket. When the proxy is
     * trusted, use the right-most X-Forwarded-For entry: Caddy appends the
     * address it actually received the connection from, so that entry cannot
     * be forged by the client (anything a client sends sits further left).
     *
     * @param array<string, mixed> $server Usually $_SERVER
     */
    public static function clientIp(array $server, bool $trustProxy): string
    {
        $remote = is_string($server['REMOTE_ADDR'] ?? null) ? $server['REMOTE_ADDR'] : '0.0.0.0';

        if ($trustProxy && is_string($server['HTTP_X_FORWARDED_FOR'] ?? null)) {
            $parts     = array_map('trim', explode(',', $server['HTTP_X_FORWARDED_FOR']));
            $candidate = end($parts);
            if ($candidate !== false && filter_var($candidate, FILTER_VALIDATE_IP) !== false) {
                return $candidate;
            }
        }

        return filter_var($remote, FILTER_VALIDATE_IP) !== false ? $remote : '0.0.0.0';
    }
}
