<?php
declare(strict_types=1);

namespace GreenScore\Tests\Unit;

use GreenScore\Auth;
use GreenScore\Csrf;
use GreenScore\Env;
use PHPUnit\Framework\TestCase;

final class AuthCsrfEnvTest extends TestCase
{
    /** @return array<string, mixed> */
    private static function user(string $status = 'active'): array
    {
        return [
            'id'       => 2,
            'username' => 'Test User',
            'email'    => 'user@example.com',
            'password' => password_hash('Userpass123', PASSWORD_DEFAULT),
            'role'     => 'user',
            'status'   => $status,
        ];
    }

    protected function tearDown(): void
    {
        $_SESSION = [];
    }

    public function testCorrectPasswordSucceedsAndHashIsNotReturned(): void
    {
        [$ok, $user] = Auth::check(self::user(), 'user@example.com', 'Userpass123');
        self::assertTrue($ok);
        self::assertSame(2, $user['id']);
        self::assertArrayNotHasKey('password', $user);
    }

    public function testWrongPasswordFailsAndIsCaseSensitive(): void
    {
        self::assertSame([false, [Auth::WRONG_PASS]], Auth::check(self::user(), 'user@example.com', 'userpass123'));
    }

    public function testUnknownEmailFails(): void
    {
        self::assertSame([false, [Auth::NOT_FOUND]], Auth::check(null, 'nobody@example.com', 'Whatever123'));
    }

    public function testEmptyFieldsAreReported(): void
    {
        [$ok, $errors] = Auth::check(null, '', '');
        self::assertFalse($ok);
        self::assertSame(['Enter your email address.', 'Enter your password.'], $errors);
    }

    public function testDeactivatedAccountCannotLogIn(): void
    {
        self::assertSame([false, [Auth::DEACTIVATED]], Auth::check(self::user('deactivated'), 'user@example.com', 'Userpass123'));
    }

    public function testDeactivatedStatusIsNotRevealedWithoutThePassword(): void
    {
        self::assertSame([false, [Auth::WRONG_PASS]], Auth::check(self::user('deactivated'), 'user@example.com', 'nope'));
    }

    public function testInactiveAccountCanStillLogIn(): void
    {
        [$ok] = Auth::check(self::user('inactive'), 'user@example.com', 'Userpass123');
        self::assertTrue($ok);
    }

    public function testCsrfTokenIsStableAndVerified(): void
    {
        $_SESSION = [];
        $token = Csrf::token();
        self::assertSame(64, strlen($token));
        self::assertSame($token, Csrf::token());
        self::assertTrue(Csrf::isValid($token));
        self::assertFalse(Csrf::isValid('wrong'));
        self::assertFalse(Csrf::isValid(null));
        self::assertFalse(Csrf::isValid([$token]));
        self::assertStringContainsString($token, Csrf::field());
    }

    public function testCsrfFailsWhenSessionHasNoToken(): void
    {
        $_SESSION = [];
        self::assertFalse(Csrf::isValid(''));
    }

    public function testEnvParsing(): void
    {
        $parsed = Env::parse(<<<'ENV'
            # comment
            DB_HOST=db
            DB_PASSWORD="s3cret value"
            EMPTY=
            QUOTED='single'
            not valid line
            1BAD=x
            WITH_EQUALS=a=b
            ENV);
        self::assertSame([
            'DB_HOST'     => 'db',
            'DB_PASSWORD' => 's3cret value',
            'EMPTY'       => '',
            'QUOTED'      => 'single',
            'WITH_EQUALS' => 'a=b',
        ], $parsed);
    }

    public function testRealEnvironmentWinsOverDefault(): void
    {
        putenv('GREENSCORE_TEST_VAR=from-env');
        self::assertSame('from-env', Env::get('GREENSCORE_TEST_VAR', 'default'));
        putenv('GREENSCORE_TEST_VAR');
        self::assertSame('default', Env::get('GREENSCORE_TEST_VAR', 'default'));
        self::assertTrue(Env::bool('GREENSCORE_UNSET_FLAG', true));
    }
}
