import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
import joblib
import os

class ZonePredictor:
    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5
        )
        self.features = [
            'growth_rate',
            'crime_rate',
            'infrastructure_score',
            'sentiment',
            'interest_rate',
            'wages',
            'housing_supply_encoded',
            'immigration_encoded'
        ]
    
    def prepare_data(self, data):
        # Encode categorical variables
        data['housing_supply_encoded'] = data['housing_supply'].map({
            'High': 1.0, 'Moderate': 0.5, 'Low': 0.0
        })
        data['immigration_encoded'] = data['immigration'].map({
            'Increasing': 1.0, 'Stable': 0.5, 'Decreasing': 0.0
        })
        return data

    def train(self, X, y):
        print("Training model...")
        self.model.fit(X, y)
        
    def save_model(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)
        print(f"Model saved to {path}")

    def load_model(self, path):
        self.model = joblib.load(path)
        print(f"Model loaded from {path}")

def main():
    # Mock training data - will be replaced with real data pipeline
    mock_data = pd.DataFrame({
        'growth_rate': [6.2, 4.8, 5.5],
        'crime_rate': [10, 30, 15],
        'infrastructure_score': [75, 65, 80],
        'sentiment': [0.7, 0.6, 0.8],
        'interest_rate': [4.5, 4.5, 4.5],
        'wages': [3.2, 3.5, 4.0],
        'housing_supply': ['High', 'Moderate', 'Low'],
        'immigration': ['Increasing', 'Stable', 'Increasing'],
        'risk_score': [85, 70, 82]
    })

    predictor = ZonePredictor()
    prepared_data = predictor.prepare_data(mock_data)
    
    X = prepared_data[predictor.features]
    y = prepared_data['risk_score']

    predictor.train(X, y)
    predictor.save_model('models/zone_predictor.joblib')

if __name__ == "__main__":
    main() 