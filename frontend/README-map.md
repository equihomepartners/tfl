# Map Implementation Guide

## Setup and Dependencies

1. Install required packages:
```bash
npm install react-map-gl mapbox-gl @types/mapbox-gl chroma-js
```

2. Create a `.env` file in the frontend directory:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## Map Component Implementation

### 1. Basic Map Setup

```tsx
import Map, { Source, Layer, FillLayer, LineLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TrafficLightMap = () => {
  return (
    <Map
      initialViewState={{
        longitude: 151.2093,  // Sydney coordinates
        latitude: -33.8688,
        zoom: 13
      }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
```

### 2. Adding GeoJSON Data

The map uses GeoJSON data for Sydney postal areas. Create state variables for boundaries and zones:

```tsx
const [boundaries, setBoundaries] = useState<any>(null);
const [zones, setZones] = useState<Zones>({});

// Fetch data from backend
useEffect(() => {
  const fetchData = async () => {
    try {
      const [boundariesRes, zonesRes] = await Promise.all([
        fetch('http://localhost:3000/boundaries'),
        fetch('http://localhost:3000/zones')
      ]);

      const boundariesData = await boundariesRes.json();
      const zonesData = await zonesRes.json();

      setBoundaries(boundariesData);
      setZones(zonesData.zones);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  fetchData();
}, []);
```

### 3. Styling Zones

Define layer styles for filling zones and their outlines:

```tsx
const layerStyle: FillLayer = {
  id: 'zone-boundaries',
  type: 'fill',
  source: 'zones',
  paint: {
    'fill-color': [
      'match',
      ['get', 'POA_CODE21'],
      '2000', zones['2000'] ? chroma(zones['2000'].color).alpha(0.7).css() : '#ccc',
      '2001', zones['2001'] ? chroma(zones['2001'].color).alpha(0.7).brighten(0.2).css() : '#ccc',
      '2006', zones['2006'] ? chroma(zones['2006'].color).alpha(0.7).brighten(0.2).css() : '#ccc',
      '#ccc',
    ],
    'fill-outline-color': '#fff',
    'fill-opacity': 0.7,
    'fill-opacity-transition': { duration: 1000, delay: 0 },
  },
};

const outlineStyle: LineLayer = {
  id: 'zone-outline',
  type: 'line',
  source: 'zones',
  paint: {
    'line-color': '#fff',
    'line-width': 2,
  },
};
```

### 4. Adding Layers to Map

Add the GeoJSON source and layers to the map:

```tsx
<Map /* ... map props ... */>
  <Source id="zones" type="geojson" data={boundaries}>
    <Layer {...layerStyle} />
    <Layer {...outlineStyle} />
  </Source>
</Map>
```

### 5. Handling Zone Selection

Add click interaction to select zones:

```tsx
const [selectedZone, setSelectedZone] = useState<string | null>(null);

const onClick = (event: any) => {
  const feature = event.features && event.features[0];
  if (feature) {
    setSelectedZone(feature.properties.POA_CODE21);
  }
};

<Map
  onClick={onClick}
  interactiveLayerIds={['zone-boundaries']}
  /* ... other props ... */
>
```

### 6. Zone Color Logic

Zones are colored based on their investment potential:
- Green: High potential (Score > 75)
- Yellow: Moderate potential (Score 50-75)
- Red: Low potential (Score < 50)

The color data comes from the backend in the following format:

```typescript
interface Zone {
  color: string;  // 'green' | 'yellow' | 'red'
  metrics: {
    risk_score: number;
    // ... other metrics
  };
}

interface Zones {
  [key: string]: Zone;
}
```

### 7. Legend Implementation

Add a legend to explain zone colors:

```tsx
<Paper className="legend">
  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
    Investment Potential
  </Typography>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Box className="legend-item">
      <Box className="legend-color" sx={{ bgcolor: 'rgba(52, 199, 89, 0.8)' }} />
      <Typography variant="caption">High (Score &gt; 75)</Typography>
    </Box>
    <Box className="legend-item">
      <Box className="legend-color" sx={{ bgcolor: 'rgba(255, 204, 0, 0.8)' }} />
      <Typography variant="caption">Moderate (Score 50-75)</Typography>
    </Box>
    <Box className="legend-item">
      <Box className="legend-color" sx={{ bgcolor: 'rgba(255, 59, 48, 0.8)' }} />
      <Typography variant="caption">Low (Score &lt; 50)</Typography>
    </Box>
  </Box>
</Paper>
```

### 8. Error Handling

Add error handling for map loading and token validation:

```tsx
const [error, setError] = useState<string | null>(null);

<Map
  onError={(e) => {
    console.error('Map error:', e);
    setError(`Map error: ${e.error.message || 'Failed to load map'}`);
  }}
  transformRequest={(url, resourceType) => {
    if (resourceType === 'Source' && url.startsWith('http://localhost')) {
      return {
        url,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
    return { url };
  }}
>
```

## CSS Styling

Add these styles to your CSS file:

```css
.map-container {
  position: relative;
  flex: 1;
  background: #ffffff;
}

.legend {
  position: absolute;
  bottom: 32px;
  right: 32px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
}
```

## Backend Requirements

The backend should provide two endpoints:

1. `/boundaries` - Returns GeoJSON data for Sydney postal areas
2. `/zones` - Returns zone data with colors and metrics

Example zone data structure:

```json
{
  "zones": {
    "2000": {
      "color": "green",
      "metrics": {
        "risk_score": 85,
        "growth_rate": 5.2,
        // ... other metrics
      }
    }
    // ... other zones
  }
}
```

## Troubleshooting

1. If the map fails to load, check:
   - Mapbox token validity
   - Network connectivity
   - CORS settings

2. If zones don't appear:
   - Verify GeoJSON data format
   - Check if zone IDs match between boundaries and zone data
   - Ensure color values are valid 