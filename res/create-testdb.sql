
DROP DATABASE IF EXISTS testdb;
CREATE DATABASE testdb;

DROP USER IF EXISTS 'testuser'@'localhost';
CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'testpassword';
GRANT ALL PRIVILEGES on testdb.* to 'testuser'@'localhost';
ALTER USER 'testuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'testpassword';
FLUSH PRIVILEGES;
