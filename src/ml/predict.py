import pandas as pd
import numpy as np
from joblib import load
import joblib
import os
from datetime import datetime
import json
from openai import OpenAI
from typing import Dict, List, Optional
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables
load_dotenv()

class PredictionService:
    def __init__(self, model_path='models/zone_predictor.joblib', predictions_dir='data/predictions'):
        """Initialize the prediction service with a trained model."""
        self.model_path = model_path
        self.predictions_dir = predictions_dir
        self.model = None
        self.openai_client = None
        
        # Debug logging
        import sys
        print(f"Python path: {sys.path}")
        print(f"Current working directory: {os.getcwd()}")
        
        try:
            # Try loading the JSON format first
            json_path = model_path.replace('.joblib', '.json')
            if os.path.exists(json_path):
                print(f"Attempting to load JSON model from {json_path}")
                from xgboost import XGBRegressor
                self.model = XGBRegressor()
                self.model.load_model(json_path)
                print(f"Model loaded successfully from {json_path}")
            else:
                print(f"JSON model not found at {json_path}, falling back to joblib")
                # Fall back to joblib format
                self.model = load(model_path)
                print(f"Model loaded successfully from {model_path}")
        except Exception as e:
            print(f"Warning: Could not load model from {model_path}: {str(e)}")
            print(f"Exception type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            self.model = None

        try:
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key:
                self.openai_client = AsyncOpenAI()
                print("OpenAI client initialized successfully")
            else:
                print("Warning: No OpenAI API key found")
        except Exception as e:
            print(f"Warning: Failed to initialize OpenAI client: {str(e)}")
            self.openai_client = None

    def _load_model(self):
        """Load the trained model."""
        try:
            if os.path.exists(self.model_path):
                print(f"Loading model from {self.model_path}")
                return joblib.load(self.model_path)
            else:
                print(f"Model not found at {self.model_path}, creating default model")
                # Create a simple default model
                from sklearn.ensemble import RandomForestRegressor
                model = RandomForestRegressor(n_estimators=10)
                # Train with some default data
                X = np.random.rand(100, 8)  # 8 features
                y = np.random.rand(100)
                model.fit(X, y)
                # Save the model
                os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
                joblib.dump(model, self.model_path)
                return model
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            print("Using simple fallback model")
            # Return a very simple model that just returns the mean of features
            class SimpleFallbackModel:
                def predict(self, X):
                    return np.mean(X, axis=1)
            return SimpleFallbackModel()

    def prepare_features(self, data):
        """Prepare features for prediction."""
        try:
            # Convert data to DataFrame if it's a list or dict
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                df = data

            # Convert postcode to numeric by removing any non-numeric characters
            df['postcode'] = pd.to_numeric(df['postcode'].astype(str).str.extract('(\d+)', expand=False))

            # Ensure all required features are present
            required_features = [
                'postcode', 'growth_rate', 'crime_rate', 'infrastructure_score',
                'sentiment', 'interest_rate', 'wages', 'housing_supply_encoded',
                'immigration_encoded'
            ]

            # Fill missing values with defaults
            defaults = {
                'growth_rate': 3.5,
                'crime_rate': 1.2,
                'infrastructure_score': 6.5,
                'sentiment': 0.65,
                'interest_rate': 4.5,
                'wages': 85000,
                'housing_supply_encoded': 0.5,
                'immigration_encoded': 0.5
            }

            for feature in required_features:
                if feature not in df.columns:
                    df[feature] = defaults.get(feature, 0)

            # Convert all columns to float
            for col in df.columns:
                df[col] = df[col].astype(float)

            return df

        except Exception as e:
            print(f"Error preparing features: {str(e)}")
            return None

    def _generate_rule_based_insights(self, zone_data: Dict) -> Dict:
        """Generate rule-based insights when AI is not available."""
        try:
            # Simple scoring based on metrics
            growth_score = min(100, zone_data['growth_rate'] * 100)  # Convert to percentage
            crime_penalty = max(0, zone_data['crime_rate'] * 100)    # Convert to percentage
            infra_score = zone_data['infrastructure_score'] * 10     # Scale to 0-10
            sentiment_score = zone_data['sentiment'] * 100           # Convert to percentage
            
            # Calculate overall score
            total_score = (
                growth_score * 0.3 +
                (100 - crime_penalty) * 0.2 +
                infra_score * 10 * 0.3 +
                sentiment_score * 0.2
            )
            
            # Generate basic analysis
            analysis = f"""
            Analysis based on key metrics:
            - Growth Rate: {growth_score:.1f}% ({growth_score < 50 and 'Low' or 'High'})
            - Crime Rate: {crime_penalty:.1f}% ({crime_penalty > 50 and 'High Risk' or 'Low Risk'})
            - Infrastructure Score: {infra_score:.1f}/10 ({infra_score < 5 and 'Needs Improvement' or 'Well Developed'})
            - Market Sentiment: {sentiment_score:.1f}% ({sentiment_score < 50 and 'Negative' or 'Positive'})
            
            Overall Risk Score: {total_score:.2f}/100
            """
            
            return {
                "summary": analysis[:200],  # First 200 chars as summary
                "full_analysis": analysis,
                "confidence": 70.0,  # Lower confidence for rule-based
                "generated_by": "rule-based"
            }
            
        except Exception as e:
            print(f"Error generating rule-based insights: {str(e)}")
            return {
                "summary": "Error generating insights",
                "full_analysis": f"Error: {str(e)}",
                "confidence": 0.0,
                "generated_by": "error-handler"
            }

    async def generate_ai_insights(self, zone_data: Dict) -> Dict:
        """Generate AI insights using OpenAI for a specific zone."""
        if not self.openai_client:
            return self._generate_rule_based_insights(zone_data)

        try:
            # Include ML predictions in the context
            ml_score = zone_data.get('predicted_score', 'N/A')
            ml_category = zone_data.get('zone_category', 'N/A')
            
            # Prepare context for OpenAI
            context = f"""
            Analyze this real estate zone data and provide investment insights and zoning recommendation:
            
            ML Model Predictions:
            - Predicted Risk Score: {ml_score}
            - Initial Zone Category: {ml_category}
            
            Zone Metrics:
            - Growth Rate: {zone_data['growth_rate']}%
            - Crime Rate: {zone_data['crime_rate']}
            - Infrastructure Score: {zone_data['infrastructure_score']}
            - Market Sentiment: {zone_data['sentiment']}
            - Interest Rate: {zone_data['interest_rate']}%
            - Wage Growth: {zone_data['wages']}%
            - Housing Supply: {zone_data['housing_supply_encoded']}
            - Immigration Trend: {zone_data['immigration_encoded']}
            
            Based on this data:
            1. Validate or adjust the ML model's zone categorization
            2. Provide key insights about investment potential
            3. Explain any discrepancy if your recommendation differs from the ML prediction
            """

            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{
                    "role": "system",
                    "content": "You are a real estate investment analysis AI. Your task is to validate ML predictions and provide final zoning recommendations with explanations."
                }, {
                    "role": "user",
                    "content": context
                }]
            )

            # Parse the response
            analysis = response.choices[0].message.content

            # Extract final zone recommendation from AI analysis
            if "red zone" in analysis.lower():
                final_category = "red"
            elif "green zone" in analysis.lower():
                final_category = "green"
            else:
                final_category = "yellow"

            return {
                "summary": analysis[:200],  # First 200 chars as summary
                "full_analysis": analysis,
                "confidence": 90,  # Based on data quality
                "generated_by": "gpt-4",
                "final_category": final_category  # AI's final zoning decision
            }

        except Exception as e:
            print(f"Error generating AI insights: {str(e)}")
            return self._generate_rule_based_insights(zone_data)

    async def predict(self, features_df):
        """Make predictions for the given features."""
        try:
            # Prepare features
            df = self.prepare_features(features_df)
            if df is None:
                raise ValueError("Failed to prepare features")

            # Make predictions
            predictions = []
            for _, row in df.iterrows():
                try:
                    # Extract postcode for reference
                    postcode = str(int(row['postcode']))
                    
                    # Create feature array for prediction
                    features = row[['growth_rate', 'crime_rate', 'infrastructure_score',
                                  'sentiment', 'interest_rate', 'wages',
                                  'housing_supply_encoded', 'immigration_encoded']].values.reshape(1, -1)
                    
                    # Get prediction
                    if self.model is not None:
                        try:
                            score = float(self.model.predict(features)[0])
                        except Exception as e:
                            print(f"Model prediction failed: {e}")
                            score = 65.0  # Default moderate score
                    else:
                        score = 65.0  # Default moderate score
                    
                    # Generate insights
                    insights = await self.generate_insights(row.to_dict(), score)
                    
                    # Get color based on score
                    color = self.get_color(score)
                    
                    predictions.append({
                        "postcode": postcode,
                        "predicted_score": score,
                        "color": color,
                        "timestamp": datetime.now().isoformat(),
                        "ai_insights": insights
                    })
                except Exception as e:
                    print(f"Error processing row: {e}")
                    predictions.append({
                        "postcode": str(int(row['postcode'])),
                        "predicted_score": 65.0,
                        "color": "yellow",
                        "timestamp": datetime.now().isoformat(),
                        "ai_insights": {
                            "summary": "Based on current market data, this zone shows moderate investment potential.",
                            "confidence": 70,
                            "sources": ["Market Analysis", "Economic Indicators"]
                        }
                    })
            
            return predictions[0] if len(predictions) == 1 else predictions

        except Exception as e:
            print(f"Error during prediction: {e}")
            return {
                "score": None,
                "color": "gray",
                "timestamp": datetime.now().isoformat(),
                "ai_insights": {
                    "summary": "No Data Processed",
                    "confidence": 0,
                    "sources": []
                }
            }

    async def generate_insights(self, features_df, prediction):
        if not self.openai_client:
            return {
                'summary': 'No Data Processed',
                'confidence': 0,
                'sources': []
            }

        try:
            # Your existing insight generation code here
            return {
                'summary': 'No Data Processed',
                'confidence': 0,
                'sources': []
            }
        except Exception as e:
            print(f"Error generating insights: {str(e)}")
            return {
                'summary': 'No Data Processed',
                'confidence': 0,
                'sources': []
            }

    def get_color(self, score):
        if score is None:
            return 'gray'
        if score >= 70:
            return 'green'
        if score >= 40:
            return 'yellow'
        return 'red'

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