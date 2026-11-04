<?php
declare(strict_types=1);

namespace GreenScore\Tests\Unit;

use GreenScore\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class ValidatorTest extends TestCase
{
    /** @return array<string, string> */
    private static function validRegistration(): array
    {
        return [
            'username'       => 'EcoPath Ltd',
            'email'          => 'contact@ecopath.co.uk',
            'company_name'   => 'EcoPath Ltd',
            'contact_person' => 'Pat Jones',
            'phone_number'   => '+44 7700 900123',
            'pass1'          => 'Greener2026',
            'pass2'          => 'Greener2026',
        ];
    }

    public function testValidRegistrationHasNoErrors(): void
    {
        $result = Validator::registration(self::validRegistration());
        self::assertSame([], $result['errors']);
        self::assertSame('contact@ecopath.co.uk', $result['data']['email']);
    }

    public function testRegistrationTrimsTextButNotPassword(): void
    {
        $input          = self::validRegistration();
        $input['email'] = '  contact@ecopath.co.uk  ';
        $input['pass1'] = $input['pass2'] = ' Greener2026 ';
        $result = Validator::registration($input);
        self::assertSame('contact@ecopath.co.uk', $result['data']['email']);
        self::assertSame(' Greener2026 ', $result['data']['password']);
    }

    public function testRegistrationStripsUnexpectedPhoneCharacters(): void
    {
        $input                 = self::validRegistration();
        $input['phone_number'] = '07700<script>900123';
        self::assertSame('07700900123', Validator::registration($input)['data']['phone_number']);
    }

    /** @return iterable<string, array{string, mixed, string}> */
    public static function badFields(): iterable
    {
        yield 'empty name'      => ['username', '', 'Enter your name.'];
        yield 'long name'       => ['username', str_repeat('a', 51), 'Name cannot exceed 50 characters.'];
        yield 'bad email'       => ['email', 'not-an-email', 'Enter a valid email address (e.g. name@example.com).'];
        yield 'no tld'          => ['email', 'user@localhost', 'Enter a valid email address (e.g. name@example.com).'];
        yield 'empty company'   => ['company_name', '', 'Enter your company name.'];
        yield 'empty contact'   => ['contact_person', '', "Enter the contact person's name."];
        yield 'short phone'     => ['phone_number', '12345', 'Phone number must have at least 7 digits.'];
        yield 'long phone'      => ['phone_number', '1234567890123456', 'Phone number cannot exceed 15 digits (international standard).'];
        yield 'array injection' => ['email', ['a@b.com'], 'Enter your email address.'];
    }

    #[DataProvider('badFields')]
    public function testRegistrationRejectsBadField(string $field, mixed $value, string $error): void
    {
        $input         = self::validRegistration();
        $input[$field] = $value;
        self::assertContains($error, Validator::registration($input)['errors']);
    }

    /** @return iterable<string, array{string, string, ?string}> */
    public static function passwords(): iterable
    {
        yield 'valid'          => ['Greener2026', 'Greener2026', null];
        yield 'empty'          => ['', '', 'Enter your password.'];
        yield 'too short'      => ['Ab1', 'Ab1', 'Password must be at least 8 characters.'];
        yield 'too long'       => [str_repeat('Ab1', 25), str_repeat('Ab1', 25), 'Password cannot exceed 72 characters.'];
        yield 'no uppercase'   => ['greener2026', 'greener2026', 'Password must contain at least one uppercase letter.'];
        yield 'no lowercase'   => ['GREENER2026', 'GREENER2026', 'Password must contain at least one lowercase letter.'];
        yield 'no number'      => ['GreenerPlanet', 'GreenerPlanet', 'Password must contain at least one number.'];
        yield 'common'         => ['Password1', 'Password1', 'That password is too common. Please choose a stronger one.'];
        yield 'mismatch'       => ['Greener2026', 'Greener2027', 'Passwords do not match.'];
    }

    #[DataProvider('passwords')]
    public function testPasswordRules(string $password, string $confirm, ?string $expected): void
    {
        self::assertSame($expected, Validator::passwordError($password, $confirm));
    }

    public function testTipMessage(): void
    {
        self::assertSame('Switch to reusable bags.', Validator::tipMessage('  Switch to reusable bags.  '));
        self::assertNull(Validator::tipMessage('   '));
        self::assertNull(Validator::tipMessage(str_repeat('x', 501)));
        self::assertSame(str_repeat('é', 500), Validator::tipMessage(str_repeat('é', 500)), 'Limit counts characters, not bytes');
        self::assertNull(Validator::tipMessage(['array']));
        // Markup is stored as typed and escaped on output, never stripped silently.
        self::assertSame('<b>hi</b>', Validator::tipMessage('<b>hi</b>'));
    }

    public function testPagination(): void
    {
        self::assertSame(1, Validator::pageNumber(null));
        self::assertSame(1, Validator::pageNumber('-4'));
        self::assertSame(1, Validator::pageNumber('abc'));
        self::assertSame(3, Validator::pageNumber('3'));
        self::assertSame(0, Validator::offset(1, 5));
        self::assertSame(10, Validator::offset(3, 5));
        self::assertSame(2, Validator::totalPages(6, 5));
        self::assertSame(1, Validator::totalPages(5, 5));
        self::assertSame(0, Validator::totalPages(0, 5));
    }
}
