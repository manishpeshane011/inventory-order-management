FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


version: '3.9'

services:

  db:
    image: mysql:8.0
    container_name: inventory_db
    restart: always

    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: inventory_db

    ports:
      - "3307:3306"

    volumes:
      - mysql_data:/var/lib/mysql

    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-proot"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    build: .
    container_name: inventory_backend
    restart: always

    depends_on:
      db:
        condition: service_healthy

    ports:
      - "8000:8000"

    env_file:
      - .env

    volumes:
      - .:/app

volumes:
  mysql_data:


    [alembic]
script_location = alembic

sqlalchemy.url = mysql+pymysql://root:root@db:3306/inventory_db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s