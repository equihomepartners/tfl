import pandas as pd
import numpy as np
from joblib import load
import os
from datetime import datetime
import json

class PredictionService:
    def __init__(self, model_path='models/zone_predictor.joblib'):
        """Initialize the prediction service with a trained model."""
        self.model_path = model_path
        self.model = self._load_model()
        self.predictions_dir = 'data/predictions'
        os.makedirs(self.predictions_dir, exist_ok=True)

    def _load_model(self):
        """Load the trained model from disk."""
        try:
            return load(self.model_path)
        except FileNotFoundError:
            raise Exception(f"Model not found at {self.model_path}. Please train the model first.")

    def prepare_features(self, data):
        """Prepare features for prediction in the same format as training."""
        required_features = [
            'growth_rate', 'crime_rate', 'infrastructure_score',
            'sentiment', 'interest_rate', 'wages',
            'housing_supply_encoded', 'immigration_encoded'
        ]
        
        # Ensure all required features are present
        missing_features = set(required_features) - set(data.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
        
        return data[required_features]

    def predict(self, input_data):
        """Make predictions using the trained model."""
        try:
            # Prepare features
            features = self.prepare_features(input_data)
            
            # Make predictions
            predictions = self.model.predict(features)
            
            # Add predictions to input data
            result = input_data.copy()
            result['predicted_score'] = predictions
            
            # Add traffic light categories
            result['zone_category'] = pd.cut(
                result['predicted_score'],
                bins=[-np.inf, 0.33, 0.66, np.inf],
                labels=['red', 'yellow', 'green']
            )
            
            # Save predictions
            self._save_predictions(result)
            
            return result
        
        except Exception as e:
            print(f"Error making predictions: {str(e)}")
            raise

    def _save_predictions(self, predictions):
        """Save predictions to disk with timestamp."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = os.path.join(self.predictions_dir, f'predictions_{timestamp}.csv')
        predictions.to_csv(output_path, index=False)
        
        # Also save a current version for the API
        current_predictions = os.path.join(self.predictions_dir, 'current_predictions.csv')
        predictions.to_csv(current_predictions, index=False)

    def get_zone_summary(self):
        """Get a summary of current zone predictions."""
        try:
            current_predictions = pd.read_csv(
                os.path.join(self.predictions_dir, 'current_predictions.csv')
            )
            
            summary = {
                'total_zones': len(current_predictions),
                'zone_distribution': current_predictions['zone_category'].value_counts().to_dict(),
                'average_score': float(current_predictions['predicted_score'].mean()),
                'timestamp': datetime.now().isoformat()
            }
            
            return summary
            
        except FileNotFoundError:
            return {
                'error': 'No current predictions found',
                'timestamp': datetime.now().isoformat()
            }

def main():
    # Example usage
    predictor = PredictionService()
    
    # Create some example data
    example_data = pd.DataFrame({
        'postcode': ['2000', '2026', '2028'],
        'growth_rate': [0.05, 0.03, 0.04],
        'crime_rate': [0.02, 0.01, 0.015],
        'infrastructure_score': [0.8, 0.7, 0.75],
        'sentiment': [0.6, 0.7, 0.65],
        'interest_rate': [0.045, 0.045, 0.045],
        'wages': [85000, 95000, 90000],
        'housing_supply_encoded': [1, 2, 1],
        'immigration_encoded': [2, 1, 2]
    })
    
    # Make predictions
    predictions = predictor.predict(example_data)
    print("\nPredictions made:")
    print(predictions[['postcode', 'predicted_score', 'zone_category']])
    
    # Get summary
    summary = predictor.get_zone_summary()
    print("\nZone Summary:")
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main() 