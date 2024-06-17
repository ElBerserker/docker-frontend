import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuración de iconos por defecto de Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapView = ({ mainRoute = [], secondaryRoutes = [], setStartCoord, setGoalCoord, startCoord, goalCoord, routeDetails, showSecondaryRoutes }) => {
  const center = mainRoute.length > 0 ? mainRoute[0] : [19.99, -99.61];

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!startCoord) {
          setStartCoord([e.latlng.lat, e.latlng.lng]);
        } else if (!goalCoord) {
          setGoalCoord([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  const secondaryRouteColors = ['green', 'purple', 'orange', 'red'];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
      />
      <MapClickHandler />
      {!showSecondaryRoutes && mainRoute.length > 0 && (
        <Polyline positions={mainRoute} color="blue" weight={5} opacity={0.7} />
      )}
      {showSecondaryRoutes &&
        secondaryRoutes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.route}
            color={secondaryRouteColors[index % secondaryRouteColors.length]}
            weight={3}
            opacity={0.7}
          />
        ))}
      {startCoord && <Marker position={startCoord} />}
      {goalCoord && <Marker position={goalCoord} />}

      <div style={{ position: 'absolute', top: 10, right: 10, padding: '10px', background: 'white', zIndex: 1000, width: '250px' }}>
        {!showSecondaryRoutes && routeDetails.main && (
          <div style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ borderBottom: '3px solid blue', paddingBottom: '5px', marginBottom: '10px' }}>
              <h3 style={{ margin: '0', color: 'blue' }}>Ruta Principal</h3>
            </div>
            <p>Distancia total: {routeDetails.main.total_distance_km.toFixed(2)} km</p>
            <p>Tiempo total: {routeDetails.main.total_time_min.toFixed(2)} min</p>
            <p>Velocidad promedio: {routeDetails.main.average_speed_kmh.toFixed(2)} km/h</p>
            <p>Costo de combustible: {routeDetails.main.fuel_cost_pesos.toFixed(2)} pesos</p>
          </div>
        )}
        {showSecondaryRoutes && routeDetails.secondary && routeDetails.secondary.map((route, index) => (
          <div key={index} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ borderBottom: `3px solid ${secondaryRouteColors[index % secondaryRouteColors.length]}`, paddingBottom: '5px', marginBottom: '10px' }}>
              <h3 style={{ margin: '0', color: secondaryRouteColors[index % secondaryRouteColors.length] }}>Ruta Secundaria {index + 1}</h3>
            </div>
            <p>Distancia total: {route.total_distance_km.toFixed(2)} km</p>
            <p>Tiempo total: {route.total_time_min.toFixed(2)} min</p>
            <p>Velocidad promedio: {route.average_speed_kmh.toFixed(2)} km/h</p>
            <p>Costo de combustible: {route.fuel_cost_pesos.toFixed(2)} pesos</p>
          </div>
        ))}
      </div>
    </MapContainer>
  );
};

export default MapView;

