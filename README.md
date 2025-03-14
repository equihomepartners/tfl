# EquiHome Traffic Light System

A data-driven real estate investment analysis system using machine learning to provide traffic light zoning (green, yellow, red) for Sydney suburbs. The system combines real-time market data, historical trends, and predictive analytics to assist in investment decisions.

## System Architecture

### Frontend (React + TypeScript + Vite)
- Interactive map visualization with Mapbox GL JS
- Real-time zone updates and metrics dashboard
- Material UI components for modern UX
- Chart.js for data visualization

### Backend (Node.js + Express)
- RESTful API endpoints for zone data and metrics
- Real-time data processing pipeline
- Integration with ML service
- Data validation and transformation

### ML Service (Python)
- XGBoost model for zone predictions
- Real-time data ingestion from multiple sources
- Feature engineering pipeline
- Model performance monitoring

### Data Pipeline
- ABS data integration
- Market metrics collection
- Sentiment analysis
- Infrastructure scoring

## Development Setup

1. Install dependencies:
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

2. Configure environment:
```bash
# Copy example env files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Add your Mapbox token to frontend/.env
echo "VITE_MAPBOX_TOKEN=your_token_here" >> frontend/.env
```

3. Start development servers:
```bash
# Start both frontend and backend in development mode
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

## Development Scripts

```bash
# Start development environment
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Run ML model training
python src/ml/train.py

# Run data ingestion
python src/ml/ingest_data.py

# Kill running servers
npm run kill:ports

# Restart entire application
npm run restart
```

## Project Structure

```
equihome-tfl/
├── src/
│   ├── server.ts              # Express backend server
│   ├── ml/
│   │   ├── train.py          # ML model training
│   │   ├── predict.py        # Real-time predictions
│   │   └── ingest_data.py    # Data pipeline
│   └── types/                # TypeScript types
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   └── services/         # API services
│   └── public/
├── data/
│   ├── raw/                  # Raw data files
│   └── processed/            # Processed datasets
└── models/                   # Trained ML models
```

## Data Sources

Currently using mock data for development, will integrate with:
- ABS (Australian Bureau of Statistics)
- Property market data
- Infrastructure development data
- Economic indicators
- Social sentiment data

## ML Pipeline (In Development)

1. Data Ingestion
   - Real-time market data collection
   - ABS data integration
   - Infrastructure metrics

2. Feature Engineering
   - Growth rate calculations
   - Risk metrics
   - Sentiment analysis
   - Infrastructure scoring

3. Model Training
   - XGBoost model
   - Hyperparameter optimization
   - Cross-validation
   - Performance metrics

4. Prediction Service
   - Real-time zone predictions
   - Confidence scoring
   - Trend analysis
   - Risk assessment

## Current Status

- ✅ Basic frontend map visualization
- ✅ Mock data integration
- ✅ Zone coloring system
- ⏳ ML model development
- ⏳ Real-time data pipeline
- ⏳ Automated predictions

## Next Steps

### Phase 1: Data Pipeline & ETL
1. Set up data lake structure:
   - Raw data storage for each source
   - Processed data organization
   - Metadata management
   - Version control for datasets

2. Implement API integrations:
   - ABS API for demographic data
   - Domain/REA Group API for property data
   - RBA API for economic indicators
   - NSW Government APIs for infrastructure/crime data
   - News and social media APIs

3. Create ETL pipelines:
   - Data validation and cleaning
   - Automated updates scheduling
   - Error handling and monitoring
   - Data quality checks
   - Transformation pipelines

### Phase 2: ML Model Enhancement
1. Feature engineering:
   - Time series feature creation
   - Geographic feature extraction
   - Sentiment analysis pipeline
   - Interaction features

2. Model improvements:
   - Cross-validation implementation
   - Hyperparameter optimization
   - Model performance metrics
   - Confidence scoring
   - A/B testing framework

### Phase 3: API Layer Development
1. Backend API endpoints:
   - Real-time prediction endpoints
   - Data update triggers
   - Model retraining endpoints
   - Performance monitoring endpoints

2. API documentation:
   - OpenAPI/Swagger specs
   - Rate limiting
   - Authentication
   - Error handling

### Phase 4: Frontend Visualization
1. Model performance dashboards:
   - Feature importance plots
   - Prediction vs actual comparisons
   - Cross-validation results
   - Error analysis

2. Data quality monitoring:
   - Data freshness indicators
   - Source reliability metrics
   - Update frequency tracking
   - Error rate monitoring

### Phase 5: Production Readiness
1. Infrastructure setup:
   - Automated deployment pipeline
   - Monitoring and alerting
   - Backup and recovery
   - Performance optimization

2. Documentation:
   - System architecture
   - API documentation
   - Maintenance guides
   - User guides

## License

Proprietary - All rights reserved

## Metrics & Data Sources

### Zone Metrics
Each zone (suburb) is evaluated using the following metrics:

1. **Growth Indicators**
   - Growth Rate (0-10): Annual property value growth
   - Employment Rate (0-100): Local employment percentage
   - Wages (0-10): Average wage growth indicator

2. **Risk Factors**
   - Crime Rate (0-10): Area safety indicator
   - Infrastructure Score (0-10): Quality of local infrastructure
   - School Rating (0-10): Educational facilities rating

3. **Market Conditions**
   - Housing Supply ('High', 'Moderate', 'Low'): Current market inventory
   - Immigration ('Increasing', 'Stable', 'Decreasing'): Population movement trends
   - Interest Rate: Current lending rates
   - Sentiment (0-1): Market sentiment score

4. **Composite Scores**
   - Risk Score (0-100): Overall investment risk assessment
   - Color Rating: Green (Low Risk), Yellow (Moderate Risk), Red (High Risk)
   - Trend: Current movement pattern (e.g., 'Stable Yellow')

### Data Integration Sources

1. **Property Market Data**
   - Domain API: Property listings and sales data
   - REA Group API: Market analytics and trends
   - CoreLogic: Historical property data

2. **Government Data**
   - ABS (Australian Bureau of Statistics):
     - Population demographics
     - Employment statistics
     - Income data
   - RBA (Reserve Bank of Australia):
     - Interest rates
     - Economic indicators
   - NSW Government:
     - Crime statistics
     - Infrastructure projects
     - School ratings

3. **Alternative Data**
   - Social Media Sentiment
   - News API
   - Development Applications
   - Council Planning Data

### AGBoost Model Features

The AGBoost (Advanced Gradient Boosting) model uses the following feature set:
- Primary Features: growth_rate, crime_rate, infrastructure_score, school_rating
- Economic Indicators: employment_rate, wages, interest_rate
- Market Conditions: housing_supply, immigration
- Sentiment Analysis: sentiment score
- Historical Trends: Previous risk scores and color ratings

### Real-time Updates
- Market metrics: Daily updates
- Economic indicators: Monthly updates
- Government statistics: Quarterly updates
- Sentiment analysis: Real-time processing
- Risk scores: Recalculated daily

## Development Status

Current Implementation:
- ✅ Basic metrics collection
- ✅ AGBoost model integration
- ✅ Real-time risk score calculation
- ✅ Zone coloring system
- ✅ Trend analysis

Next Phase:
- ⏳ API integrations for live data
- ⏳ Advanced feature engineering
- ⏳ Model performance optimization
- ⏳ Historical data analysis
- ⏳ Automated data pipeline 