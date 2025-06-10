import json
import sys
import numpy as np
import joblib
import os
from pathlib import Path

class DiabetesPredictionModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.metadata = None
        self.models_dir = Path(__file__).parent / 'models'
        
    def load_model(self):
        """Load trained model and scaler"""
        try:
            model_path = self.models_dir / 'diabetes_model.joblib'
            scaler_path = self.models_dir / 'scaler.joblib'
            metadata_path = self.models_dir / 'model_metadata.json'
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
            
            return True
            
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            return False
    
    def predict(self, input_data):
        """Make prediction on input data"""
        if not self.load_model():
            raise Exception("Failed to load trained model")
        
        # Expected features in order
        feature_names = [
            'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
            'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
        ]
        
        # Prepare input features
        features = []
        for feature in feature_names:
            # Map frontend field names to model feature names
            if feature == 'Pregnancies':
                value = input_data.get('pregnancies', 0)
            elif feature == 'Glucose':
                value = input_data.get('glucose', 100)
            elif feature == 'BloodPressure':
                value = input_data.get('blood_pressure', 80)
            elif feature == 'SkinThickness':
                value = input_data.get('skin_thickness', 20)
            elif feature == 'Insulin':
                value = input_data.get('insulin', 79)
            elif feature == 'BMI':
                value = input_data.get('bmi', 25)
            elif feature == 'DiabetesPedigreeFunction':
                value = input_data.get('diabetes_pedigree_function', 0.5)
            elif feature == 'Age':
                value = input_data.get('age', 30)
            else:
                value = 0
                
            features.append(float(value))
        
        # Validate input ranges
        if features[1] < 0 or features[1] > 300:  # Glucose
            raise ValueError("Glucose level must be between 0-300 mg/dL")
        if features[2] < 0 or features[2] > 250:  # Blood Pressure
            raise ValueError("Blood pressure must be between 0-250 mmHg")
        if features[5] < 10 or features[5] > 60:  # BMI
            raise ValueError("BMI must be between 10-60")
        if features[7] < 0 or features[7] > 120:  # Age
            raise ValueError("Age must be between 0-120 years")
        
        # Scale features
        features_array = np.array([features])
        features_scaled = self.scaler.transform(features_array)
        
        # Make prediction
        prediction = self.model.predict(features_scaled)[0]
        probability = self.model.predict_proba(features_scaled)[0]
        
        # Get probability for diabetes (class 1)
        diabetes_probability = probability[1]
        
        # Determine risk level
        if diabetes_probability < 0.3:
            risk_level = "Low"
            risk_message = "Low risk of diabetes detected."
        elif diabetes_probability < 0.7:
            risk_level = "Moderate"
            risk_message = "Moderate risk of diabetes detected."
        else:
            risk_level = "High"
            risk_message = "High risk of diabetes detected."
        
        # Calculate confidence
        confidence = max(probability) * 100
        
        return {
            "prediction": int(prediction),
            "probability": float(diabetes_probability),
            "confidence": float(confidence),
            "risk_level": risk_level,
            "message": risk_message,
            "recommendations": self.get_recommendations(risk_level, features),
            "input_features": dict(zip(feature_names, features)),
            "model_info": {
                "accuracy": self.metadata.get('accuracy', 0) if self.metadata else 0,
                "model_type": "Random Forest Classifier"
            }
        }
    
    def get_recommendations(self, risk_level, features):
        """Get personalized recommendations based on risk level and features"""
        recommendations = []
        
        glucose = features[1]
        bmi = features[5]
        age = features[7]
        
        if risk_level == "Low":
            recommendations = [
                "Maintain a balanced diet rich in vegetables and whole grains",
                "Continue regular physical activity (150 minutes per week)",
                "Monitor your weight and maintain healthy BMI",
                "Get annual health check-ups including glucose screening"
            ]
        elif risk_level == "Moderate":
            recommendations = [
                "Consult with healthcare provider for personalized advice",
                "Consider diabetes prevention program",
                "Increase physical activity to 200+ minutes per week",
                "Monitor blood glucose levels every 6 months"
            ]
            
            if bmi > 25:
                recommendations.append("Focus on gradual weight loss (5-10% of body weight)")
            if glucose > 100:
                recommendations.append("Follow a low-glycemic diet")
                
        else:  # High risk
            recommendations = [
                "Schedule immediate appointment with healthcare provider",
                "Get comprehensive diabetes screening (HbA1c, fasting glucose)",
                "Start intensive lifestyle modification program",
                "Consider consultation with endocrinologist"
            ]
            
            if bmi > 30:
                recommendations.append("Urgent weight management program needed")
            if glucose > 140:
                recommendations.append("Monitor blood glucose levels daily")
        
        return recommendations

def main():
    try:
        # Get input from command line argument
        if len(sys.argv) < 2:
            result = {"error": "No input data provided"}
            print(json.dumps(result))
            return
            
        # Parse input JSON
        input_str = sys.argv[1]
        
        try:
            input_data = json.loads(input_str)
        except json.JSONDecodeError as e:
            result = {"error": f"Invalid JSON format: {str(e)}"}
            print(json.dumps(result))
            return
        
        # Create model and make prediction
        model = DiabetesPredictionModel()
        result = model.predict(input_data)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()
