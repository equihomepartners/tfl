import asyncio
import pandas as pd
from predict import PredictionService
from train import ZonePredictor
import json

async def test_system():
    print("\n1. Training Model...")
    # Train model with example data
    predictor = ZonePredictor()
    example_data = pd.DataFrame({
        'postcode': ['2000', '2026', '2028'],
        'growth_rate': [0.05, 0.03, 0.04],
        'crime_rate': [0.02, 0.01, 0.015],
        'infrastructure_score': [0.8, 0.7, 0.75],
        'sentiment': [0.6, 0.7, 0.65],
        'interest_rate': [0.045, 0.045, 0.045],
        'wages': [85000, 95000, 90000],
        'housing_supply': ['High', 'Moderate', 'Low'],
        'immigration': ['Increasing', 'Stable', 'Increasing'],
        'risk_score': [85, 70, 82]
    })
    
    prepared_data = predictor.prepare_data(example_data)
    X = prepared_data[predictor.features]
    y = prepared_data['risk_score']
    predictor.train(X, y)
    predictor.save_model('models/zone_predictor.joblib')
    print("✓ Model trained and saved\n")

    print("2. Testing Prediction Service...")
    # Initialize prediction service
    service = PredictionService('models/zone_predictor.joblib')
    
    # Test data
    test_data = pd.DataFrame({
        'postcode': ['2000'],
        'growth_rate': [0.05],
        'crime_rate': [0.02],
        'infrastructure_score': [0.8],
        'sentiment': [0.6],
        'interest_rate': [0.045],
        'wages': [85000],
        'housing_supply_encoded': [1],
        'immigration_encoded': [2]
    })
    
    # Make prediction
    predictions = await service.predict(test_data)
    print("✓ Predictions generated:")
    print(json.dumps(predictions.to_dict('records')[0], indent=2))
    print("\n3. System Test Complete!")
    
    return predictions

if __name__ == "__main__":
    asyncio.run(test_system()) 