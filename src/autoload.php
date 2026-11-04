<?php
declare(strict_types=1);

// Minimal PSR-4 autoloader for the GreenScore\ namespace.
// The application itself has no runtime Composer dependencies, so this keeps
// it runnable on a plain PHP + Apache host without `composer install`.
spl_autoload_register(static function (string $class): void {
    $prefix = 'GreenScore\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $file     = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

require_once __DIR__ . '/functions.php';
