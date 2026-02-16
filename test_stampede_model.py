# Import necessary libraries
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import cross_val_score
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from catboost import CatBoostClassifier
from sklearn.preprocessing import OneHotEncoder

# Load the dataset
def load_dataset(file_path):
    data = pd.read_csv(file_path)
    return data

# Preprocessing
def preprocess_data(data):
    numerical_features = data.select_dtypes(include=['int64', 'float64']).columns
    categorical_features = data.select_dtypes(include=['object']).columns
    
    # Remove target from features
    numerical_features = [f for f in numerical_features if f != 'StampedeRiskLevel']
    categorical_features = [f for f in categorical_features if f != 'StampedeRiskLevel']
    
    numerical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('encoder', OneHotEncoder(handle_unknown='ignore'))])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)])
    
    return preprocessor

# Train and evaluate models
def train_and_evaluate(data, preprocessor):
    X = data.drop('StampedeRiskLevel', axis=1)
    y = data['StampedeRiskLevel']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Define models
    models = {
        'XGBoost': xgb.XGBClassifier(eval_metric='mlogloss', random_state=42),
        'RandomForest': RandomForestClassifier(random_state=42),
        'CatBoost': CatBoostClassifier(verbose=0, random_state=42)
    }
    
    best_model = None
    best_score = 0
    
    print("="*60)
    print("ATLAS-X CROWD SAFETY AI - MODEL TRAINING INITIATED")
    print("="*60)
    print(f"Training data: {len(X_train)} samples")
    print(f"Test data: {len(X_test)} samples")
    print(f"Features: {list(X.columns)}")
    print("="*60)
    
    for name, model in models.items():
        print(f"\n[TRAINING] {name}...")
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])
        scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='accuracy')
        score = scores.mean()
        print(f'✓ Model: {name}')
        print(f'  Cross-validation score: {score:.4f} (±{scores.std():.4f})')
        
        if score > best_score:
            best_score = score
            best_model = name
    
    # Train and evaluate the best model
    print("\n" + "="*60)
    print(f"BEST MODEL SELECTED: {best_model}")
    print("="*60)
    
    best_pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', models[best_model])])
    best_pipeline.fit(X_train, y_train)
    y_pred = best_pipeline.predict(X_test)
    
    print(f'\n[RESULTS]')
    print(f'Test Accuracy: {accuracy_score(y_test, y_pred):.4f}')
    print(f'\nClassification Report:')
    print(classification_report(y_test, y_pred))
    print(f'\nConfusion Matrix:')
    print(confusion_matrix(y_test, y_pred))
    
    print("\n" + "="*60)
    print("MISSION COMPLETE: AI Model Ready for Deployment")
    print("="*60)

# Main function
def main():
    print("\n🛡️ ATLAS-X TACTICAL AI SYSTEM")
    print("Mission: Crowd Safety & Stampede Prevention\n")
    
    data = load_dataset('cctv_data.csv')
    print(f"✓ Data loaded: {len(data)} records")
    print(f"✓ Columns: {list(data.columns)}\n")
    
    preprocessor = preprocess_data(data)
    train_and_evaluate(data, preprocessor)

if __name__ == '__main__':
    main()
