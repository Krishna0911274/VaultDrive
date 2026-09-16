# Start with a lightweight Python 3.14 environment.
FROM python:3.14-slim

# Inside the container, our working directory becomes:
WORKDIR /app

COPY requirements.txt .

# Installs FastAPI, SQLAlchemy, etc.
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic.ini .
COPY alembic ./alembic

# Our FastAPI application uses port 8000.
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]