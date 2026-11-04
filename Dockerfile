# GreenScore — PHP 8.3 + Apache
FROM php:8.3-apache

RUN docker-php-ext-install mysqli \
    && a2enmod rewrite headers \
    # Let the project's .htaccess rules take effect
    && sed -ri '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' \
        /etc/apache2/apache2.conf \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-greenscore.ini"
COPY docker/apache.conf /etc/apache2/conf-enabled/zz-greenscore.conf

WORKDIR /var/www/html
COPY --chown=www-data:www-data . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost/health.php || exit 1
