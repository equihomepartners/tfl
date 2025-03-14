# Traffic Light Map System Guide

## System Overview
The traffic light map system consists of three main components:
1. GeoJSON boundary data
2. Backend server (TypeScript/Node.js)
3. Frontend map visualization (React/TypeScript)

## Setup Instructions

### 1. Prerequisites
- Node.js and npm installed
- Mapbox account and access token
- GDAL tools installed (`brew install gdal` on macOS)

### 2. Environment Setup
Create a `.env` file in the frontend directory with your Mapbox token:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### 3. Directory Structure
```
equihome-tfl/
├── data/
│   ├── POA_2021_AUST_GDA94.shp    # Original Shapefile
│   ├── transformed_postcodes.geojson # Transformed GeoJSON
│   └── filtered_postcodes.geojson   # Filtered GeoJSON
├── src/
│   └── server.ts                    # Backend server
└── frontend/
    └── src/
        └── components/
            └── TrafficLightMap.tsx   # Map component
```

## Working with Boundary Data

### Converting Shapefiles to GeoJSON
1. Convert Shapefile to GeoJSON with specific postcodes:
```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 data/filtered_postcodes.geojson data/POA_2021_AUST_GDA94.shp -where "POA_CODE21 IN ('2000', '2026', '2028')"
```

### Adding New Zones
1. Identify the postcode you want to add
2. Update the Shapefile filter command with new postcode:
```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 data/filtered_postcodes.geojson data/POA_2021_AUST_GDA94.shp -where "POA_CODE21 IN ('2000', '2026', '2028', 'NEW_POSTCODE')"
```

## Backend Configuration

### Zone Metrics Configuration
In `src/server.ts`, zones are configured with metrics:

```typescript
const zoneMetrics = {
  '2000': {
    color: 'green',
    metrics: {
      growth_rate: 8.5,
      crime_rate: 15,
      infrastructure_score: 90,
      sentiment: 0.85,
      interest_rate: 4.5,
      wages: 8.5,
      housing_supply: 'High',
      immigration: 'Increasing',
      description: 'Sydney CBD - Major business district...'
    }
  },
  // Add new zones here
};
```

### Adding a New Zone
1. Add the zone metrics to the `zoneMetrics` object
2. Include metrics for:
   - growth_rate (number)
   - crime_rate (number)
   - infrastructure_score (number)
   - sentiment (number, 0-1)
   - interest_rate (number)
   - wages (number)
   - housing_supply (string: 'High'|'Moderate'|'Low')
   - immigration (string: 'Increasing'|'Stable'|'Decreasing')
   - description (string)

### Risk Score Calculation
Risk scores are automatically calculated based on metrics:
```typescript
function calculateRiskScore(metrics) {
  const score = (
    metrics.growth_rate * 0.25 +
    (100 - metrics.crime_rate) * 0.2 +
    metrics.infrastructure_score * 0.15 +
    metrics.sentiment * 100 * 0.15 +
    metrics.wages * 0.15 +
    (metrics.housing_supply === 'High' ? 90 : metrics.housing_supply === 'Moderate' ? 70 : 50) * 0.1
  );
  return Math.round(score);
}
```

## Frontend Configuration

### Suburb Names
Add new suburbs to the `suburbNames` object in `TrafficLightMap.tsx`:
```typescript
const suburbNames: { [key: string]: string } = {
  '2000': 'Sydney CBD',
  '2026': 'Bondi',
  '2028': 'Double Bay',
  // Add new suburbs here
};
```

### Map Styling
Layer styles are configured in `layerStyle`:
```typescript
const layerStyle: FillLayer = {
  paint: {
    'fill-color': [
      'match',
      ['get', 'postcode'],
      '2000', zones['2000']?.color === 'green' ? '#4CAF50' : '#FFC107',
      // Add new zones here
      '#e0e0e0'  // default color
    ],
    'fill-opacity': [
      'case',
      ['==', ['get', 'postcode'], selectedZone || ''], 0.9,
      ['in', ['get', 'postcode'], ['literal', ['2000', '2026', '2028']]], 0.8,
      0.6
    ]
  }
};
```

### Customizing Colors
- Green zones: #4CAF50
- Yellow zones: #FFC107
- Red zones: #F44336
- Default: #e0e0e0

## Running the System

1. Start the backend:
```bash
npm run dev:backend
```

2. Start the frontend:
```bash
cd frontend && npm run dev
```

3. Access the application at `http://localhost:3001`

## Common Modifications

### Changing Zone Colors
1. Update the `color` property in the zone metrics:
```typescript
'2000': {
  color: 'green', // or 'yellow' or 'red'
  metrics: { ... }
}
```

### Updating Zone Metrics
1. Modify the metrics in the `zoneMetrics` object
2. The risk score and color will automatically update based on the new metrics

### Adjusting Map Display
- Change zoom level: Modify `initialViewState` in `TrafficLightMap.tsx`
- Adjust opacity: Modify `fill-opacity` values in `layerStyle`
- Change boundary thickness: Modify `line-width` in `outlineLayer`

### Adding New Metrics
1. Update the `ZoneMetrics` interface in `TrafficLightMap.tsx`
2. Add the new metric to the zone data in `server.ts`
3. Update the `calculateRiskScore` function if the new metric should affect the risk score

## Troubleshooting

### Map Not Displaying
1. Check Mapbox token in `.env`
2. Verify GeoJSON file exists and is valid
3. Check browser console for errors
4. Verify backend is running and accessible

### Zones Not Coloring
1. Verify postcode exists in GeoJSON
2. Check zone metrics in backend
3. Verify color calculation in frontend
4. Check browser console for data loading

### Performance Issues
1. Optimize GeoJSON file size
2. Reduce boundary precision
3. Implement data caching
4. Consider lazy loading for large datasets 