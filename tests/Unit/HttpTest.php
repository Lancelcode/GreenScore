<?php
declare(strict_types=1);

namespace GreenScore\Tests\Unit;

use GreenScore\Http;
use PHPUnit\Framework\TestCase;

final class HttpTest extends TestCase
{
    public function testUsesRemoteAddrWithoutProxy(): void
    {
        $server = ['REMOTE_ADDR' => '203.0.113.7', 'HTTP_X_FORWARDED_FOR' => '198.51.100.1'];
        self::assertSame('203.0.113.7', Http::clientIp($server, false));
    }

    public function testUsesRightMostForwardedAddressBehindTrustedProxy(): void
    {
        // A client tries to spoof its address; the proxy appends the real one.
        $server = ['REMOTE_ADDR' => '172.18.0.4', 'HTTP_X_FORWARDED_FOR' => '1.2.3.4, 100.101.102.103'];
        self::assertSame('100.101.102.103', Http::clientIp($server, true));
    }

    public function testFallsBackWhenHeaderIsMissingOrInvalid(): void
    {
        self::assertSame('172.18.0.4', Http::clientIp(['REMOTE_ADDR' => '172.18.0.4'], true));
        self::assertSame('172.18.0.4', Http::clientIp(['REMOTE_ADDR' => '172.18.0.4', 'HTTP_X_FORWARDED_FOR' => 'not-an-ip'], true));
        self::assertSame('0.0.0.0', Http::clientIp([], false));
    }

    public function testAcceptsIpv6(): void
    {
        self::assertSame('fd7a:115c:a1e0::1', Http::clientIp(['REMOTE_ADDR' => '172.18.0.4', 'HTTP_X_FORWARDED_FOR' => 'fd7a:115c:a1e0::1'], true));
    }
}
