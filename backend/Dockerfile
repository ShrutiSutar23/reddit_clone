# ── Stage 1: Base Python image ────────────────────────────────────────────
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# ── System dependencies ────────────────────────────────────────────────────
# libpq-dev needed for psycopg2 (PostgreSQL driver)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ── Install Python dependencies ────────────────────────────────────────────
# Copy requirements first so Docker caches this layer
# Only re-runs pip install when requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy application code ──────────────────────────────────────────────────
COPY . .

# ── Environment ───────────────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1   \
    PYTHONUNBUFFERED=1           \
    PORT=8000

# ── Expose port ───────────────────────────────────────────────────────────
EXPOSE 8000

# ── Start command ─────────────────────────────────────────────────────────
# Uses uvicorn directly (more production-appropriate than run.py)
# --host 0.0.0.0 makes it accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
