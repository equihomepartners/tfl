const fs = require('fs');
const path = require('path');

// Read the original GeoJSON file
const inputPath = path.join(__dirname, '../data/filtered_postcodes.geojson');
const outputPath = path.join(__dirname, '../data/transformed_postcodes.geojson');

// Read and parse the GeoJSON file
const geojson = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Transform the features
const transformedGeojson = {
  type: 'FeatureCollection',
  features: geojson.features.map(feature => ({
    type: 'Feature',
    properties: {
      postcode: feature.properties.POA_CODE21,
      name: feature.properties.POA_NAME21,
      area_sqkm: feature.properties.AREASQKM21
    },
    geometry: feature.geometry
  }))
};

// Write the transformed GeoJSON
fs.writeFileSync(outputPath, JSON.stringify(transformedGeojson, null, 2));
console.log('Transformed GeoJSON file has been created at:', outputPath); 