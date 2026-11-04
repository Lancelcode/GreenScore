<?php
declare(strict_types=1);

namespace GreenScore;

/**
 * Fourteen badge levels earned from the cumulative number of "Green"
 * answers across all of a user's assessments.
 */
final class Badges
{
    /** Minimum green answers => [slug, label, description]. Ordered ascending. */
    public const LEVELS = [
        0   => ['green_starter',              '🌱 Green Starter',              'Great start — keep growing green habits! 🌱'],
        5   => ['eco_explorer',               '🌿 Eco Explorer',               'Exploring the world of sustainability. 🌍'],
        10  => ['climate_cadet',              '🎖 Climate Cadet',              'In training to save the planet! 🎖️'],
        15  => ['forest_friend',              '🌳 Forest Friend',              'Nature thanks you for your dedication! 🌳'],
        20  => ['carbon_cutter',              '✂️ Carbon Cutter',              'Cutting down emissions daily. ✂️'],
        25  => ['renewable_rookie',           '⚡ Renewable Rookie',           'Just getting started with renewables. ⚡'],
        30  => ['sustainability_scout',       '🧭 Sustainability Scout',       'Navigating the path to sustainability. 🧭'],
        40  => ['leaf_leader',                '🍃 Leaf Leader',                'A natural-born leader in the green movement. 🍃'],
        50  => ['green_visionary',            '👁 Green Visionary',            'You envision a cleaner world and act on it! 👁🌱'],
        60  => ['eco_hero',                   '🦸 Eco Hero',                   'Heroic actions, greener future! 🦸'],
        70  => ['planet_paladin',             '🪐 Planet Paladin',             "You've pledged loyalty to the planet! 🌎"],
        80  => ['guardian_of_earth',          '🛡 Guardian of Earth',          'Defending the Earth one choice at a time. 🛡️'],
        90  => ['green_warrior',              '🌟 Green Warrior',              "You're a fierce champion of the environment! 🌿⚔️"],
        100 => ['champion_of_sustainability', '🏆 Champion of Sustainability', "You've reached the highest honour in sustainability! 🌍👑"],
    ];

    /**
     * @return array{slug:string, label:string, text:string, level:int, threshold:int}
     */
    public static function forGreenCount(int $green): array
    {
        $current = null;
        $level   = 0;
        foreach (self::LEVELS as $threshold => [$slug, $label, $text]) {
            if ($green < $threshold) {
                break;
            }
            $level++;
            $current = compact('slug', 'label', 'text', 'level', 'threshold');
        }
        // Threshold 0 always matches, so $current is never null for green >= 0.
        return $current ?? ['slug' => 'green_starter', 'label' => '🌱 Green Starter',
                            'text' => self::LEVELS[0][2], 'level' => 1, 'threshold' => 0];
    }

    /** Progress towards the top badge as a 0–100 percentage. */
    public static function progressPercent(int $green): int
    {
        return max(0, min(100, $green));
    }

    /** @return list<array{slug:string, label:string}> */
    public static function all(): array
    {
        $list = [];
        foreach (self::LEVELS as [$slug, $label]) {
            $list[] = ['slug' => $slug, 'label' => $label];
        }
        return $list;
    }
}
