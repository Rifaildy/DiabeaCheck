FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML service files
COPY . .

# Create models directory
RUN mkdir -p models

# Train the model
RUN python train_model.py

EXPOSE 5000

CMD ["python", "app.py"]
