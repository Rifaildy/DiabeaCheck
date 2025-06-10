import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import json

def create_diabetes_dataset():
    """Create a comprehensive diabetes dataset based on medical research"""
    np.random.seed(42)
    n_samples = 2000
    
    # Generate realistic medical data
    data = []
    
    for i in range(n_samples):
        # Age distribution (20-80 years, higher diabetes risk with age)
        age = np.random.normal(45, 15)
        age = max(20, min(80, age))
        
        # BMI distribution (15-50, higher diabetes risk with higher BMI)
        bmi = np.random.normal(26, 6)
        bmi = max(15, min(50, bmi))
        
        # Glucose levels (70-200 mg/dL)
        # Higher glucose indicates diabetes
        if np.random.random() < 0.3:  # 30% diabetic cases
            glucose = np.random.normal(160, 30)  # Diabetic range
            is_diabetic = 1
        else:
            glucose = np.random.normal(95, 15)   # Normal range
            is_diabetic = 0
            
        glucose = max(70, min(200, glucose))
        
        # Blood pressure (systolic, 80-180 mmHg)
        bp_base = 120 + (age - 40) * 0.5 + (bmi - 25) * 0.8
        blood_pressure = np.random.normal(bp_base, 15)
        blood_pressure = max(80, min(180, blood_pressure))
        
        # Skin thickness (10-50 mm)
        skin_thickness = np.random.normal(25, 8)
        skin_thickness = max(10, min(50, skin_thickness))
        
        # Insulin levels (0-300 mu U/ml)
        if is_diabetic:
            insulin = np.random.normal(150, 50)  # Higher insulin in diabetics
        else:
            insulin = np.random.normal(80, 30)   # Normal insulin
        insulin = max(0, min(300, insulin))
        
        # Diabetes Pedigree Function (0.0-2.5)
        # Higher values indicate stronger genetic predisposition
        dpf = np.random.exponential(0.5)
        dpf = min(2.5, dpf)
        
        # Pregnancies (0-15, only for females, affects diabetes risk)
        pregnancies = 0
        if np.random.random() < 0.5:  # 50% female
            pregnancies = np.random.poisson(2)
            pregnancies = min(15, pregnancies)
            
        # Adjust diabetes probability based on risk factors
        risk_score = 0
        
        # Age risk
        if age > 45: risk_score += 0.2
        if age > 65: risk_score += 0.1
        
        # BMI risk
        if bmi > 25: risk_score += 0.15
        if bmi > 30: risk_score += 0.2
        
        # Blood pressure risk
        if blood_pressure > 140: risk_score += 0.15
        
        # Genetic risk
        if dpf > 0.5: risk_score += 0.1
        
        # Pregnancy risk
        if pregnancies > 3: risk_score += 0.1
        
        # Final diabetes determination
        if glucose > 140:  # Primary indicator
            is_diabetic = 1
        elif glucose < 100 and risk_score < 0.3:
            is_diabetic = 0
        else:
            # Use risk score for borderline cases
            is_diabetic = 1 if np.random.random() < risk_score else 0
        
        data.append([
            pregnancies,
            round(glucose, 1),
            round(blood_pressure, 1),
            round(skin_thickness, 1),
            round(insulin, 1),
            round(bmi, 1),
            round(dpf, 3),
            round(age, 0),
            is_diabetic
        ])
    
    # Create DataFrame
    columns = [
        'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
        'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age', 'Outcome'
    ]
    
    df = pd.DataFrame(data, columns=columns)
    return df

def train_diabetes_model():
    """Train a diabetes prediction model"""
    print("Creating diabetes dataset...")
    
    # Create dataset
    df = create_diabetes_dataset()
    
    # Save dataset
    dataset_path = os.path.join(os.path.dirname(__file__), 'data', 'diabetes_generated.csv')
    os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
    df.to_csv(dataset_path, index=False)
    print(f"Dataset saved to: {dataset_path}")
    
    # Print dataset info
    print(f"\nDataset shape: {df.shape}")
    print(f"Diabetes cases: {df['Outcome'].sum()} ({df['Outcome'].mean()*100:.1f}%)")
    print(f"Non-diabetes cases: {len(df) - df['Outcome'].sum()} ({(1-df['Outcome'].mean())*100:.1f}%)")
    
    # Prepare features and target
    X = df.drop('Outcome', axis=1)
    y = df['Outcome']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Scale features
    print("\nScaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    print("\nEvaluating model...")
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    print(feature_importance)
    
    # Save model and scaler
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'diabetes_model.joblib')
    scaler_path = os.path.join(models_dir, 'scaler.joblib')
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\nModel saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    
    # Save model metadata
    metadata = {
        'model_type': 'RandomForestClassifier',
        'features': list(X.columns),
        'accuracy': float(accuracy),
        'n_samples': len(df),
        'n_features': len(X.columns),
        'diabetes_rate': float(df['Outcome'].mean()),
        'feature_importance': feature_importance.to_dict('records')
    }
    
    metadata_path = os.path.join(models_dir, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Metadata saved to: {metadata_path}")
    print("\nModel training completed successfully!")
    
    return model, scaler, metadata

if __name__ == "__main__":
    train_diabetes_model()
