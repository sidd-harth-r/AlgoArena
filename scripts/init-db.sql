-- Create judge0 database and user for Judge0 service
CREATE USER judge0 WITH PASSWORD 'judge0secret';
CREATE DATABASE judge0 OWNER judge0;
GRANT ALL PRIVILEGES ON DATABASE judge0 TO judge0;
