from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import pandas as pd
from .predict import PredictionService
import uvicorn
import os
from datetime import datetime
import asyncio
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EquiHome Traffic Light System API",
    description="API for zone predictions and traffic light system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the prediction service
predictor = PredictionService()

class ZoneData(BaseModel):
    postcode: str
    growth_rate: float
    crime_rate: float
    infrastructure_score: float
    sentiment: float
    interest_rate: float
    wages: float
    housing_supply_encoded: float
    immigration_encoded: float
    
    class Config:
        orm_mode = True

class AIInsight(BaseModel):
    summary: str
    full_analysis: str
    confidence: float
    generated_by: str
    
    class Config:
        orm_mode = True

class PredictionResponse(BaseModel):
    postcode: str
    predicted_score: float
    zone_category: str
    timestamp: str
    ai_insights: AIInsight
    
    class Config:
        orm_mode = True

class ZoneSummary(BaseModel):
    total_zones: int
    zone_distribution: Dict[str, int]
    average_score: float
    timestamp: str
    
    class Config:
        orm_mode = True

@app.post("/predict")
async def predict(data: List[Dict[str, Any]]):
    try:
        # Convert input data to DataFrame
        df = pd.DataFrame(data)
        required_columns = [
            'postcode', 'growth_rate', 'crime_rate', 'infrastructure_score',
            'sentiment', 'interest_rate', 'wages', 'housing_supply_encoded',
            'immigration_encoded'
        ]
        
        # Validate input data
        for col in required_columns:
            if col not in df.columns:
                return JSONResponse(
                    status_code=400,
                    content={
                        'error': f'Missing required column: {col}',
                        'score': None,
                        'color': 'gray',
                        'timestamp': datetime.now().isoformat(),
                        'ai_insights': {
                            'summary': 'No Data Processed',
                            'confidence': 0,
                            'sources': []
                        }
                    }
                )

        # Make prediction
        result = await predictor.predict(df)
        return result

    except Exception as e:
        print(f"Error processing prediction request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                'error': str(e),
                'score': None,
                'color': 'gray',
                'timestamp': datetime.now().isoformat(),
                'ai_insights': {
                    'summary': 'No Data Processed',
                    'confidence': 0,
                    'sources': []
                }
            }
        )

@app.get("/summary", response_model=ZoneSummary)
async def get_summary():
    """
    Get a summary of current zone predictions
    """
    try:
        return predictor.get_zone_summary()
    except Exception as e:
        print(f"Error in get_summary: {str(e)}")
        # Return default summary
        return {
            "total_zones": 0,
            "zone_distribution": {"red": 0, "yellow": 0, "green": 0},
            "average_score": 0.0,
            "timestamp": datetime.now().isoformat()
        }

@app.get("/health")
async def health_check():
    try:
        return {
            "status": "healthy",
            "model_loaded": predictor.model is not None,
            "openai_client": predictor.openai_client is not None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

def main():
    """Run the API server"""
    uvicorn.run(
        app,  # Use the app instance directly
        host="0.0.0.0",
        port=8000,
        reload=True
    )

if __name__ == "__main__":
    main() 