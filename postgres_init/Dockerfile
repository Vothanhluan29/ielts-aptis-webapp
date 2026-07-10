FROM postgres:alpine

# Copy the initialization script so it runs automatically when a new volume is created
COPY init.sql /docker-entrypoint-initdb.d/init.sql
