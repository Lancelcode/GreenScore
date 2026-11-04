<?php
declare(strict_types=1);

namespace GreenScore;

/**
 * The Green Calculator rules: ten measures, each rated Green (10 points),
 * Amber (5) or Red (0), giving a score out of 100 and an award level.
 */
final class Scoring
{
    public const MEASURES = [
        'Waste Reduction',
        'Renewable Energy Usage',
        'Water Conservation',
        'Sustainable Supply Chain',
        'Eco-friendly Products/Services',
        'Energy-Efficient Infrastructure',
        'Transportation Sustainability',
        'Community Engagement',
        'Carbon Offsetting',
        'Transparency and Reporting',
    ];

    public const GREEN = 10;
    public const AMBER = 5;
    public const RED   = 0;

    public const MAX_SCORE      = 100;
    public const COST_PER_POINT = 10; // £ per missing point

    public const GOLD_THRESHOLD   = 80;
    public const SILVER_THRESHOLD = 65;
    public const BRONZE_THRESHOLD = 51;

    /**
     * Read one answer per measure from submitted form data (keys measure_0 …
     * measure_9). Returns the list of points, or null if any answer is
     * missing or not one of the allowed values.
     *
     * @param array<string, mixed> $input
     * @return list<int>|null
     */
    public static function parseAnswers(array $input, int $count = 10): ?array
    {
        $allowed = [(string) self::GREEN, (string) self::AMBER, (string) self::RED];
        $points  = [];
        for ($i = 0; $i < $count; $i++) {
            $raw = $input["measure_$i"] ?? null;
            if (!is_string($raw) && !is_int($raw)) {
                return null;
            }
            $raw = trim((string) $raw);
            if (!in_array($raw, $allowed, true)) {
                return null;
            }
            $points[] = (int) $raw;
        }
        return $points;
    }

    /**
     * @param list<int> $points
     * @return array{total:int, green:int, amber:int, red:int}
     */
    public static function tally(array $points): array
    {
        $result = ['total' => 0, 'green' => 0, 'amber' => 0, 'red' => 0];
        foreach ($points as $p) {
            match ($p) {
                self::GREEN => $result['green']++,
                self::AMBER => $result['amber']++,
                self::RED   => $result['red']++,
                default     => throw new \InvalidArgumentException("Invalid points value: $p"),
            };
            $result['total'] += $p;
        }
        return $result;
    }

    /**
     * @return array{award:string, emoji:string, message:string}
     */
    public static function award(int $total): array
    {
        if ($total >= self::GOLD_THRESHOLD) {
            return ['award' => 'Certificate of Gold 🥇', 'emoji' => '🥇',
                    'message' => "Outstanding! You're leading the way in sustainability."];
        }
        if ($total >= self::SILVER_THRESHOLD) {
            return ['award' => 'Certificate of Silver 🥈', 'emoji' => '🥈',
                    'message' => "Great job! You're making a positive environmental impact."];
        }
        if ($total >= self::BRONZE_THRESHOLD) {
            return ['award' => 'Certificate of Bronze 🥉', 'emoji' => '🥉',
                    'message' => 'Nice effort! Keep building sustainable habits.'];
        }

        $award = 'Certificate of Participation 👏';
        if ($total >= 41) {
            return ['award' => $award, 'emoji' => '🌟',
                    'message' => "You're almost there! Just a few more changes will go a long way."];
        }
        if ($total >= 26) {
            return ['award' => $award, 'emoji' => '💪',
                    'message' => "You're making progress. Small steps matter — keep going!"];
        }
        return ['award' => $award, 'emoji' => '🌱',
                'message' => "Every journey starts somewhere — you've taken that first step!"];
    }

    /** Points missing from a perfect score, clamped to 0–100. */
    public static function shortfall(int $total): int
    {
        return self::clampShortfall(self::MAX_SCORE - $total);
    }

    public static function clampShortfall(int $shortfall): int
    {
        return max(0, min(self::MAX_SCORE, $shortfall));
    }

    /** Suggested contribution in pounds to close a shortfall. */
    public static function donationCost(int $shortfall): int
    {
        return self::clampShortfall($shortfall) * self::COST_PER_POINT;
    }

    /**
     * Full result for a set of answers, ready to store and display.
     *
     * @param list<int> $points
     * @return array{total:int, green:int, amber:int, red:int, award:string,
     *               emoji:string, message:string, shortfall:int, cost:int}
     */
    public static function evaluate(array $points): array
    {
        $tally     = self::tally($points);
        $shortfall = self::shortfall($tally['total']);
        return $tally + self::award($tally['total']) + [
            'shortfall' => $shortfall,
            'cost'      => self::donationCost($shortfall),
        ];
    }
}
