from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
import json
from .predict import PredictionService
import uvicorn
import os
import asyncio
from fastapi.responses import JSONResponse

app = FastAPI(
    title="EquiHome Traffic Light System API",
    description="API for zone predictions and traffic light system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize prediction service
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

class Metrics(BaseModel):
    risk_score: Optional[float]
    growth_rate: Optional[float]
    crime_rate: Optional[float]
    infrastructure_score: Optional[float]
    sentiment: Optional[float]
    interest_rate: Optional[float]
    wages: Optional[float]
    housing_supply: Optional[str]
    immigration: Optional[str]
    ai_insights: Optional[AIInsight]

class PredictionResponse(BaseModel):
    postcode: str
    predicted_score: Optional[float]
    color: str
    metrics: Metrics

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
    """Make predictions for the given data."""
    try:
        # Convert input data to DataFrame
        df = pd.DataFrame(data)
        required_columns = [
            'postcode', 'growth_rate', 'crime_rate', 'infrastructure_score',
            'sentiment', 'interest_rate', 'wages', 'housing_supply_encoded',
            'immigration_encoded'
        ]
        
        # Validate input data
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )

        # Make prediction
        result = await predictor.predict(df)
        
        # Validate response format
        if isinstance(result, list):
            return [PredictionResponse(**pred) for pred in result]
        else:
            return PredictionResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing prediction request: {str(e)}"
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
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

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