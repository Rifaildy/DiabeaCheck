import joblib
import numpy as np
import pandas as pd
from typing import Dict, List

class DiabetesPredictor:
    def __init__(self, model_path='models/diabetes_model.pkl', 
                 scaler_path='models/scaler.pkl',
                 feature_names_path='models/feature_names.pkl'):
        """
        Initialize the diabetes predictor
        """
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_names = joblib.load(feature_names_path)
    
    def predict(self, input_data: Dict) -> Dict:
        """
        Predict diabetes probability
        
        Args:
            input_data: Dictionary containing patient data
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Create DataFrame with input data
            df = pd.DataFrame([input_data])
            
            # Ensure all required features are present
            for feature in self.feature_names:
                if feature not in df.columns:
                    df[feature] = 0  # Default value for missing features
            
            # Reorder columns to match training data
            df = df[self.feature_names]
            
            # Scale the features
            X_scaled = self.scaler.transform(df)
            
            # Make prediction
            prediction = self.model.predict(X_scaled)[0]
            probability = self.model.predict_proba(X_scaled)[0]
            
            # Get feature importance for explanation
            feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
            
            return {
                'prediction': int(prediction),
                'probability': {
                    'no_diabetes': float(probability[0]),
                    'diabetes': float(probability[1])
                },
                'risk_level': self._get_risk_level(probability[1]),
                'feature_importance': feature_importance,
                'recommendations': self._get_recommendations(input_data, prediction)
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _get_risk_level(self, diabetes_prob: float) -> str:
        """
        Determine risk level based on probability
        """
        if diabetes_prob < 0.3:
            return 'Low'
        elif diabetes_prob < 0.7:
            return 'Medium'
        else:
            return 'High'
    
    def _get_recommendations(self, input_data: Dict, prediction: int) -> List[str]:
        """
        Generate health recommendations based on input data and prediction
        """
        recommendations = []
        
        # BMI recommendations
        bmi = input_data.get('BMI', 0)
        if bmi > 30:
            recommendations.append("Consider weight management through diet and exercise")
        elif bmi > 25:
            recommendations.append("Maintain healthy weight through balanced diet")
        
        # Glucose recommendations
        glucose = input_data.get('Glucose', 0)
        if glucose > 140:
            recommendations.append("Monitor blood glucose levels regularly")
        elif glucose > 100:
            recommendations.append("Consider reducing sugar intake")
        
        # Age recommendations
        age = input_data.get('Age', 0)
        if age > 45:
            recommendations.append("Regular health checkups recommended")
        
        # General recommendations
        if prediction == 1:
            recommendations.extend([
                "Consult with healthcare provider immediately",
                "Follow a diabetes-friendly diet",
                "Regular physical activity is essential"
            ])
        else:
            recommendations.extend([
                "Maintain healthy lifestyle",
                "Regular exercise and balanced diet",
                "Annual health screenings"
            ])
        
        return recommendations

# Example usage
if __name__ == "__main__":
    predictor = DiabetesPredictor()
    
    # Test prediction
    test_data = {
        'Pregnancies': 2,
        'Glucose': 120,
        'BloodPressure': 80,
        'SkinThickness': 25,
        'Insulin': 100,
        'BMI': 28.5,
        'DiabetesPedigreeFunction': 0.5,
        'Age': 35
    }
    
    result = predictor.predict(test_data)
    print(result)
