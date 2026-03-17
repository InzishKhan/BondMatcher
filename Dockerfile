# Use the official Microsoft Playwright Python image — comes with browsers pre-installed
FROM mcr.microsoft.com/playwright/python:v1.58.0-noble

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (chromium only to save space)
RUN playwright install chromium

# Copy the rest of the application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Railway sets $PORT automatically)
EXPOSE 8000

# Start the FastAPI server
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
