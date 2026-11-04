<?php
declare(strict_types=1);

namespace GreenScore\Tests\Unit;

use GreenScore\Badges;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class BadgesTest extends TestCase
{
    public function testThereAreFourteenBadges(): void
    {
        self::assertCount(14, Badges::LEVELS);
        self::assertCount(14, Badges::all());
    }

    public function testEveryBadgeHasAnIllustration(): void
    {
        foreach (Badges::all() as $badge) {
            self::assertFileExists(
                dirname(__DIR__, 2) . "/assets/images/illustrations/{$badge['slug']}.jpg",
            );
        }
    }

    /** @return iterable<string, array{int, string, int}> */
    public static function levels(): iterable
    {
        yield 'no green answers' => [0,   'green_starter', 1];
        yield 'just below 5'     => [4,   'green_starter', 1];
        yield 'exactly 5'        => [5,   'eco_explorer', 2];
        yield '29'               => [29,  'renewable_rookie', 6];
        yield '30'               => [30,  'sustainability_scout', 7];
        yield '99'               => [99,  'green_warrior', 13];
        yield '100'              => [100, 'champion_of_sustainability', 14];
        yield 'beyond 100'       => [250, 'champion_of_sustainability', 14];
    }

    #[DataProvider('levels')]
    public function testBadgeForGreenCount(int $green, string $slug, int $level): void
    {
        $badge = Badges::forGreenCount($green);
        self::assertSame($slug, $badge['slug']);
        self::assertSame($level, $badge['level']);
        self::assertNotSame('', $badge['text']);
    }

    public function testNegativeCountFallsBackToStarter(): void
    {
        self::assertSame('green_starter', Badges::forGreenCount(-3)['slug']);
    }

    public function testProgressIsClampedToPercentage(): void
    {
        self::assertSame(0, Badges::progressPercent(-1));
        self::assertSame(42, Badges::progressPercent(42));
        self::assertSame(100, Badges::progressPercent(140));
    }
}
