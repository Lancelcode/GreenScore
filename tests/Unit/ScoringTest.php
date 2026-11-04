<?php
declare(strict_types=1);

namespace GreenScore\Tests\Unit;

use GreenScore\Scoring;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class ScoringTest extends TestCase
{
    /** @return array<string, mixed> */
    private static function answers(int ...$points): array
    {
        $input = [];
        foreach ($points as $i => $p) {
            $input["measure_$i"] = (string) $p;
        }
        return $input;
    }

    public function testThereAreTenMeasuresWorthOneHundredPoints(): void
    {
        self::assertCount(10, Scoring::MEASURES);
        self::assertSame(Scoring::MAX_SCORE, count(Scoring::MEASURES) * Scoring::GREEN);
    }

    public function testParseAnswersAcceptsValidForm(): void
    {
        $input = self::answers(10, 5, 0, 10, 10, 5, 0, 0, 10, 5);
        self::assertSame([10, 5, 0, 10, 10, 5, 0, 0, 10, 5], Scoring::parseAnswers($input));
    }

    public function testParseAnswersRejectsMissingAnswer(): void
    {
        $input = self::answers(10, 10, 10, 10, 10, 10, 10, 10, 10);
        self::assertNull(Scoring::parseAnswers($input));
    }

    /** @return iterable<string, array{mixed}> */
    public static function invalidValues(): iterable
    {
        yield 'out-of-range number' => ['7'];
        yield 'too large'           => ['100'];
        yield 'negative'            => ['-10'];
        yield 'empty'               => [''];
        yield 'text'                => ['green'];
        yield 'array'               => [['10']];
        yield 'float string'        => ['10.0'];
    }

    #[DataProvider('invalidValues')]
    public function testParseAnswersRejectsTamperedValues(mixed $bad): void
    {
        $input = self::answers(10, 10, 10, 10, 10, 10, 10, 10, 10, 10);
        $input['measure_4'] = $bad;
        self::assertNull(Scoring::parseAnswers($input));
    }

    public function testTallyCountsEachColour(): void
    {
        $tally = Scoring::tally([10, 10, 10, 10, 10, 5, 5, 5, 0, 0]);
        self::assertSame(['total' => 65, 'green' => 5, 'amber' => 3, 'red' => 2], $tally);
    }

    public function testTallyRejectsUnknownPoints(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Scoring::tally([10, 3]);
    }

    /** @return iterable<string, array{int, string}> */
    public static function awardBoundaries(): iterable
    {
        yield '100 gold'          => [100, 'Certificate of Gold 🥇'];
        yield '80 gold'           => [80,  'Certificate of Gold 🥇'];
        yield '79 silver'         => [79,  'Certificate of Silver 🥈'];
        yield '65 silver'         => [65,  'Certificate of Silver 🥈'];
        yield '64 bronze'         => [64,  'Certificate of Bronze 🥉'];
        yield '51 bronze'         => [51,  'Certificate of Bronze 🥉'];
        yield '50 participation'  => [50,  'Certificate of Participation 👏'];
        yield '0 participation'   => [0,   'Certificate of Participation 👏'];
    }

    #[DataProvider('awardBoundaries')]
    public function testAwardThresholds(int $total, string $expected): void
    {
        self::assertSame($expected, Scoring::award($total)['award']);
    }

    /** @return iterable<string, array{int, string}> */
    public static function participationTiers(): iterable
    {
        yield '50 almost there' => [50, '🌟'];
        yield '41 almost there' => [41, '🌟'];
        yield '40 progress'     => [40, '💪'];
        yield '26 progress'     => [26, '💪'];
        yield '25 first step'   => [25, '🌱'];
        yield '0 first step'    => [0,  '🌱'];
    }

    #[DataProvider('participationTiers')]
    public function testParticipationEncouragementTiers(int $total, string $emoji): void
    {
        self::assertSame($emoji, Scoring::award($total)['emoji']);
    }

    public function testShortfallAndCost(): void
    {
        self::assertSame(35, Scoring::shortfall(65));
        self::assertSame(0, Scoring::shortfall(100));
        self::assertSame(100, Scoring::shortfall(0));
        self::assertSame(350, Scoring::donationCost(35));
        self::assertSame(0, Scoring::donationCost(0));
        self::assertSame(1000, Scoring::donationCost(100));
    }

    public function testShortfallIsClamped(): void
    {
        self::assertSame(100, Scoring::clampShortfall(150));
        self::assertSame(0, Scoring::clampShortfall(-20));
        self::assertSame(45, Scoring::clampShortfall(45));
        // A tampered shortfall can never produce a cost above £1,000.
        self::assertSame(1000, Scoring::donationCost(999));
        self::assertSame(0, Scoring::donationCost(-5));
    }

    public function testEvaluateCombinesEverything(): void
    {
        $result = Scoring::evaluate([10, 10, 10, 10, 10, 10, 10, 5, 5, 0]);
        self::assertSame(80, $result['total']);
        self::assertSame(7, $result['green']);
        self::assertSame(2, $result['amber']);
        self::assertSame(1, $result['red']);
        self::assertSame('Certificate of Gold 🥇', $result['award']);
        self::assertSame(20, $result['shortfall']);
        self::assertSame(200, $result['cost']);
    }

    public function testPerfectScoreHasNoShortfall(): void
    {
        $result = Scoring::evaluate(array_fill(0, 10, Scoring::GREEN));
        self::assertSame(100, $result['total']);
        self::assertSame(0, $result['shortfall']);
        self::assertSame(0, $result['cost']);
    }
}
