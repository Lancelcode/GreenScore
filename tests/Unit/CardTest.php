<?php
declare(strict_types=1);

namespace GreenScore\Tests\Unit;

use DateTimeImmutable;
use GreenScore\Card;
use PHPUnit\Framework\TestCase;

final class CardTest extends TestCase
{
    private static function now(): DateTimeImmutable
    {
        return new DateTimeImmutable('2026-06-15');
    }

    public function testLuhn(): void
    {
        self::assertTrue(Card::passesLuhn('4111111111111111'));
        self::assertTrue(Card::passesLuhn('5555555555554444'));
        self::assertFalse(Card::passesLuhn('4111111111111112'));
        self::assertFalse(Card::passesLuhn(''));
        self::assertFalse(Card::passesLuhn('41x1'));
    }

    public function testOnlyLastFourDigitsAreKept(): void
    {
        self::assertSame('1111', Card::lastFour('4111 1111 1111 1111'));
        self::assertSame('•••• •••• •••• 4444', Card::mask('4444'));
    }

    public function testExpiryParsing(): void
    {
        self::assertSame('2027-03-01', Card::parseExpiry('2027-03')?->format('Y-m-d'));
        self::assertSame('2027-03-01', Card::parseExpiry('2027-03-28')?->format('Y-m-d'));
        self::assertNull(Card::parseExpiry('2027-13'));
        self::assertNull(Card::parseExpiry('03/27'));
    }

    public function testCardIsValidUntilEndOfExpiryMonth(): void
    {
        self::assertFalse(Card::isExpired(new DateTimeImmutable('2026-06-01'), self::now()));
        self::assertTrue(Card::isExpired(new DateTimeImmutable('2026-05-01'), self::now()));
    }

    public function testValidateNew(): void
    {
        self::assertSame([], Card::validateNew('4111 1111 1111 1111', '2027-01', 'Pat Jones', self::now()));

        $errors = Card::validateNew('1234', '2020-01', '', self::now());
        self::assertContains('Enter a valid card number.', $errors);
        self::assertContains('That card has expired.', $errors);
        self::assertContains('Enter the cardholder name (up to 100 characters).', $errors);
    }
}
