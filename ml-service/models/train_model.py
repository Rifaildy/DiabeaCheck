import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE
import os

def train_diabetes_model():
    """
    Train diabetes prediction model and save it
    """
    # Load datasets
    pima = pd.read_csv('data/diabetes.csv')
    nhanes = pd.read_csv('data/NHANES_age_prediction.csv')
    
    # Preprocessing Pima dataset
    cols_to_fix = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    pima[cols_to_fix] = pima[cols_to_fix].replace(0, np.nan)
    pima[cols_to_fix] = pima[cols_to_fix].fillna(pima[cols_to_fix].median())
    
    # Preprocessing NHANES dataset
    nhanes_clean = nhanes[['RIDAGEYR', 'BMXBMI', 'LBXGLU', 'LBXIN', 'DIQ010']].copy()
    nhanes_clean = nhanes_clean.rename(columns={
        'RIDAGEYR': 'Age',
        'BMXBMI': 'BMI', 
        'LBXGLU': 'Glucose',
        'LBXIN': 'Insulin',
        'DIQ010': 'Outcome'
    })
    
    # Convert NHANES labels
    nhanes_clean['Outcome'] = nhanes_clean['Outcome'].replace({2: 0, 3: 0})
    
    # Add missing columns to match Pima structure
    nhanes_clean['Pregnancies'] = 0
    nhanes_clean['BloodPressure'] = np.nan
    nhanes_clean['SkinThickness'] = np.nan
    nhanes_clean['DiabetesPedigreeFunction'] = 0.5
    
    # Reorder columns
    column_order = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
                    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age', 'Outcome']
    nhanes_clean = nhanes_clean[column_order]
    
    # Fill missing values
    nhanes_clean[cols_to_fix] = nhanes_clean[cols_to_fix].fillna(nhanes_clean[cols_to_fix].median())
    
    # Combine datasets
    combined_df = pd.concat([pima, nhanes_clean], ignore_index=True)
    
    # Remove outliers using IQR
    def remove_outliers_iqr(df, columns):
        for col in columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower) & (df[col] <= upper)]
        return df
    
    combined_df = remove_outliers_iqr(combined_df, cols_to_fix + ['Age'])
    
    # Separate features and target
    X = combined_df.drop(columns='Outcome')
    y = combined_df['Outcome']
    
    # Feature scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # Hyperparameter tuning
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 15, 20],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    
    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    best_model = grid_search.best_estimator_
    
    # Evaluate model
    y_pred = best_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Save model and scaler
    joblib.dump(best_model, 'models/diabetes_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    # Save feature names
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, 'models/feature_names.pkl')
    
    print("\nModel saved successfully!")
    return best_model, scaler, feature_names

if __name__ == "__main__":
    train_diabetes_model()
