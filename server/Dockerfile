FROM php:8.2-apache


RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost \*:8080>/' /etc/apache2/sites-available/000-default.conf

# Instalar la extensión PDO MySQL necesaria para conectar con Aiven
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite para el manejo de rutas en la API
RUN a2enmod rewrite

# Copiar el código del backend al contenedor
COPY . /var/www/html/


RUN chown -R www-data:www-data /var/www/html

EXPOSE 8080