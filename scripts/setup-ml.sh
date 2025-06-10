#!/bin/bash

echo "Setting up ML service for DiabeaCheck..."

# Create ML service directory
mkdir -p ml-service/data
mkdir -p ml-service/models

# Copy data files
cp NHANES_age_prediction.csv ml-service/data/
cp diabetes.csv ml-service/data/

# Create Python virtual environment
cd ml-service
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Train the model
python train_model.py

echo "ML service setup complete!"
echo "Model trained and saved to models/ directory"