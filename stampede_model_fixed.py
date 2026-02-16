# ATLAS-X Crowd Stampede Detection System
# Fixed Version - Production Ready

import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
from catboost import CatBoostClassifier
from sklearn.metrics import make_scorer, f1_score

print("="*70)
print("ATLAS-X CROWD SAFETY AI - REAL PYTHON EXECUTION")
print("="*70)
print("Mission: Stampede Risk Prediction")
print("="*70 + "\n")

# Load dataset
def load_dataset(file_path):
    data = pd.read_csv(file_path)
    return data

# Preprocess dataset
def preprocess_dataset(data):
    # Separate numerical and categorical columns
    numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_cols = data.select_dtypes(include=['object']).columns.tolist()
    
    # Remove target from features
    if 'StampedeRiskLevel' in numerical_cols:
        numerical_cols.remove('StampedeRiskLevel')
    if 'StampedeRiskLevel' in categorical_cols:
        categorical_cols.remove('StampedeRiskLevel')
    
    # Create preprocessing pipeline
    numerical_transformer = SimpleImputer(strategy='mean')
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('encoder', OneHotEncoder(handle_unknown='ignore'))])  # FIXED: Use OneHotEncoder
    
    preprocessing_pipeline = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)])
    
    return preprocessing_pipeline

# Train and compare models
def train_and_compare_models(data, preprocessing_pipeline):
    # Split dataset into features and target
    X = data.drop('StampedeRiskLevel', axis=1)
    y = data['StampedeRiskLevel']
    
    print(f"Data loaded: {len(data)} records")
    print(f"Features: {list(X.columns)}")
    print(f"Target classes: {y.unique()}\n")
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples\n")
    
    # Define models
    models = {
        'XGBoost': XGBClassifier(eval_metric='mlogloss', random_state=42, verbosity=0),
        'RandomForest': RandomForestClassifier(random_state=42, n_estimators=100),
        'CatBoost': CatBoostClassifier(verbose=0, random_state=42)
    }
    
    # Define cross-validation scorer
    scorer = make_scorer(f1_score, average='macro')
    
    # Compare models using cross-validation
    print("="*70)
    print("MODEL TRAINING & CROSS-VALIDATION")
    print("="*70)
    results = {}
    for name, model in models.items():
        print(f"\nTraining {name}...")
        pipeline = Pipeline(steps=[('preprocessing', preprocessing_pipeline), ('model', model)])
        scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring=scorer)
        results[name] = scores.mean()
        print(f"  Cross-validation F1 Score: {scores.mean():.4f} (+/- {scores.std():.4f})")
    
    # Select best model
    best_model_name = max(results, key=results.get)
    best_model = models[best_model_name]
    
    print(f"\n{'='*70}")
    print(f"BEST MODEL SELECTED: {best_model_name}")
    print(f"{'='*70}\n")
    
    # Train best model on entire training set
    best_pipeline = Pipeline(steps=[('preprocessing', preprocessing_pipeline), ('model', best_model)])
    best_pipeline.fit(X_train, y_train)
    
    # Evaluate best model on test set
    y_pred = best_pipeline.predict(X_test)
    
    print("TEST SET EVALUATION:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\n" + "="*70)
    print("MISSION COMPLETE: Model Ready for Deployment")
    print("="*70)
    
    return best_pipeline

# Main function
def main():
    try:
        data = load_dataset('cctv_data.csv')
        preprocessing_pipeline = preprocess_dataset(data)
        best_pipeline = train_and_compare_models(data, preprocessing_pipeline)
        print("\nSUCCESS: AI model trained and validated!")
    except FileNotFoundError:
        print("ERROR: cctv_data.csv not found!")
        print("Please ensure the data file is in the same directory.")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == '__main__':
    main()
