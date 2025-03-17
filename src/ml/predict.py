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
            # Initialize OpenAI client if API key is available
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key:
                self.openai_client = AsyncOpenAI(api_key=api_key)
                print("OpenAI client initialized successfully")
            else:
                print("Warning: No OpenAI API key found")
        except Exception as e:
            print(f"OpenAI client initialization failed: {str(e)}")
            self.openai_client = None

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
            # Calculate scores
            growth_score = min(100, zone_data.get('growth_rate', 0) * 100)
            crime_penalty = max(0, zone_data.get('crime_rate', 0) * 100)
            infra_score = zone_data.get('infrastructure_score', 0) * 10
            sentiment_score = zone_data.get('sentiment', 0) * 100
            
            # Calculate overall score
            total_score = (
                growth_score * 0.3 +
                (100 - crime_penalty) * 0.2 +
                infra_score * 10 * 0.3 +
                sentiment_score * 0.2
            )
            
            # Generate analysis
            summary = f"Zone shows {'high' if total_score > 75 else 'moderate' if total_score > 50 else 'low'} investment potential with a score of {total_score:.1f}/100."
            
            analysis = f"""
            Detailed Analysis:
            - Growth Potential: {'Strong' if growth_score > 75 else 'Moderate' if growth_score > 50 else 'Limited'} ({growth_score:.1f}%)
            - Safety Rating: {'Low Risk' if crime_penalty < 25 else 'Moderate Risk' if crime_penalty < 50 else 'High Risk'} ({crime_penalty:.1f}%)
            - Infrastructure: {'Well Developed' if infra_score > 7 else 'Adequate' if infra_score > 5 else 'Needs Improvement'} ({infra_score:.1f}/10)
            - Market Sentiment: {'Positive' if sentiment_score > 75 else 'Neutral' if sentiment_score > 50 else 'Negative'} ({sentiment_score:.1f}%)
            
            Overall Assessment:
            This zone demonstrates {total_score:.1f}% alignment with optimal investment criteria.
            """
            
            return {
                "summary": summary,
                "full_analysis": analysis,
                "confidence": 70.0,  # Lower confidence for rule-based
                "generated_by": "rule-based"
            }
            
        except Exception as e:
            print(f"Error generating rule-based insights: {str(e)}")
            return {
                "summary": "Unable to generate insights due to insufficient data",
                "full_analysis": "Error analyzing zone metrics",
                "confidence": 0.0,
                "generated_by": "error-handler"
            }

    async def generate_ai_insights(self, zone_data: Dict, predicted_score: float) -> Dict:
        """Generate AI insights using OpenAI for a specific zone."""
        if not self.openai_client:
            return self._generate_rule_based_insights(zone_data)

        try:
            # Format metrics for analysis
            metrics = {
                'growth_rate': f"{zone_data.get('growth_rate', 0) * 100:.1f}%",
                'crime_rate': f"{zone_data.get('crime_rate', 0) * 100:.1f}%",
                'infrastructure_score': f"{zone_data.get('infrastructure_score', 0)}/10",
                'sentiment': f"{zone_data.get('sentiment', 0) * 100:.1f}%",
                'interest_rate': f"{zone_data.get('interest_rate', 0):.1f}%",
                'wages': f"${zone_data.get('wages', 0):,.2f}",
                'housing_supply': zone_data.get('housing_supply', 'Unknown'),
                'immigration': zone_data.get('immigration', 'Unknown')
            }
            
            # Prepare context for OpenAI
            context = f"""
            Analyze this real estate zone data and provide investment insights:
            
            Predicted Risk Score: {predicted_score:.1f}/100
            
            Key Metrics:
            - Growth Rate: {metrics['growth_rate']}
            - Crime Rate: {metrics['crime_rate']}
            - Infrastructure Score: {metrics['infrastructure_score']}
            - Market Sentiment: {metrics['sentiment']}
            - Interest Rate: {metrics['interest_rate']}
            - Average Wages: {metrics['wages']}
            - Housing Supply: {metrics['housing_supply']}
            - Immigration Trend: {metrics['immigration']}
            
            Provide:
            1. A brief summary (1-2 sentences)
            2. Detailed analysis of investment potential
            3. Key risk factors and opportunities
            """

            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{
                    "role": "system",
                    "content": "You are a real estate investment analysis AI. Provide concise, data-driven insights."
                }, {
                    "role": "user",
                    "content": context
                }],
                temperature=0.7,
                max_tokens=500
            )

            analysis = response.choices[0].message.content
            
            # Split analysis into summary and full analysis
            lines = analysis.split('\n')
            summary = lines[0].strip()
            full_analysis = '\n'.join(lines[1:]).strip()

            return {
                "summary": summary,
                "full_analysis": full_analysis,
                "confidence": 90.0,  # High confidence with GPT-4
                "generated_by": "gpt-4"
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
                    # Extract postcode
                    postcode = str(int(row['postcode']))
                    
                    # Create feature array
                    features = row[['growth_rate', 'crime_rate', 'infrastructure_score',
                                  'sentiment', 'interest_rate', 'wages',
                                  'housing_supply_encoded', 'immigration_encoded']].values.reshape(1, -1)
                    
                    # Get prediction
                    score = float(self.model.predict(features)[0]) if self.model else 65.0
                    
                    # Generate insights
                    insights = await self.generate_ai_insights(row.to_dict(), score)
                    
                    # Determine color based on score
                    if score >= 75:
                        color = "green"
                    elif score >= 50:
                        color = "yellow"
                    else:
                        color = "red"
                    
                    predictions.append({
                        "postcode": postcode,
                        "predicted_score": score,
                        "color": color,
                        "metrics": {
                            "risk_score": score,
                            "growth_rate": float(row['growth_rate']),
                            "crime_rate": float(row['crime_rate']),
                            "infrastructure_score": float(row['infrastructure_score']),
                            "sentiment": float(row['sentiment']),
                            "interest_rate": float(row['interest_rate']),
                            "wages": float(row['wages']),
                            "housing_supply": row['housing_supply_encoded'],
                            "immigration": row['immigration_encoded'],
                            "ai_insights": insights
                        }
                    })
                except Exception as e:
                    print(f"Error processing row: {e}")
                    predictions.append({
                        "postcode": str(int(row['postcode'])),
                        "predicted_score": 65.0,
                        "color": "yellow",
                        "metrics": {
                            "risk_score": 65.0,
                            "growth_rate": 0.0,
                            "crime_rate": 0.0,
                            "infrastructure_score": 5.0,
                            "sentiment": 0.5,
                            "interest_rate": 5.0,
                            "wages": 50000.0,
                            "housing_supply": "moderate",
                            "immigration": "stable",
                            "ai_insights": {
                                "summary": "Insufficient data for detailed analysis",
                                "full_analysis": "Unable to generate insights due to data processing error",
                                "confidence": 0.0,
                                "generated_by": "error-handler"
                            }
                        }
                    })
            
            return predictions[0] if len(predictions) == 1 else predictions

        except Exception as e:
            print(f"Error during prediction: {e}")
            return {
                "postcode": "0000",
                "predicted_score": None,
                "color": "gray",
                "metrics": {
                    "risk_score": None,
                    "growth_rate": None,
                    "crime_rate": None,
                    "infrastructure_score": None,
                    "sentiment": None,
                    "interest_rate": None,
                    "wages": None,
                    "housing_supply": None,
                    "immigration": None,
                    "ai_insights": None
                }
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