import React, { useState } from 'react';
import axios from 'axios';
import MapView from './MapView';
import './App.css';

const RouteFinder = () => {
  const [startCoord, setStartCoord] = useState(null);
  const [goalCoord, setGoalCoord] = useState(null);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [optimizeFuel, setOptimizeFuel] = useState(false);
  const [mainRoute, setMainRoute] = useState([]);
  const [secondaryRoutes, setSecondaryRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [routeDetails, setRouteDetails] = useState({});
  const [showSecondaryRoutes, setShowSecondaryRoutes] = useState(false);

  const [startQuery, setStartQuery] = useState('');
  const [goalQuery, setGoalQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [goalSuggestions, setGoalSuggestions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startCoord || !goalCoord) {
      setError('Por favor selecciona tanto el inicio como el destino en el mapa.');
      return;
    }

    try {
      const response = await axios.get('https://docker-backend-0o7z.onrender.com/route', {
        params: {
          start_lat: startCoord[0],
          start_lon: startCoord[1],
          goal_lat: goalCoord[0],
          goal_lon: goalCoord[1],
          avoid_tolls: avoidTolls,
          optimize_fuel: optimizeFuel,
        },
      });

      const mainRouteData = response.data.main_route.route;
      const secondaryRoutesData = response.data.secondary_routes.filter(route =>
        !areRoutesEqual(mainRouteData, route.route)
      );

      setMainRoute(mainRouteData);
      setSecondaryRoutes(secondaryRoutesData);
      setRouteDetails({
        main: response.data.main_route,
        secondary: secondaryRoutesData,
      });
      setError(null);
    } catch (err) {
      setMainRoute([]);
      setSecondaryRoutes([]);
      setRouteDetails({});
      setError(err.response ? err.response.data.error : 'Error conectando con la API');
    }
  };

  const handleReset = () => {
    setStartCoord(null);
    setGoalCoord(null);
    setMainRoute([]);
    setSecondaryRoutes([]);
    setError(null);
    setAvoidTolls(false);
    setOptimizeFuel(false);
    setRouteDetails({});
    setShowSecondaryRoutes(false);
    setStartQuery('');
    setGoalQuery('');
    setStartSuggestions([]);
    setGoalSuggestions([]);
  };

  const toggleRoutes = () => {
    setShowSecondaryRoutes(!showSecondaryRoutes);
  };

  const areRoutesEqual = (route1, route2) => {
    if (route1.length !== route2.length) return false;
    for (let i = 0; i < route1.length; i++) {
      if (route1[i][0] !== route2[i][0] || route1[i][1] !== route2[i][1]) return false;
    }
    return true;
  };

  const handleInputChange = async (e, setQuery, setSuggestions) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: value,
            format: 'json',
            addressdetails: 1,
            limit: 5
          }
        });
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion, setCoord, setQuery) => {
    setCoord([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setStartSuggestions([]);
    setGoalSuggestions([]);
    setQuery(suggestion.display_name);
  };

  const fetchAddress = async (lat, lon, setQuery) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json'
        }
      });
      setQuery(response.data.display_name);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const updateStartCoord = (coord) => {
    setStartCoord(coord);
    fetchAddress(coord[0], coord[1], setStartQuery);
  };

  const updateGoalCoord = (coord) => {
    setGoalCoord(coord);
    fetchAddress(coord[0], coord[1], setGoalQuery);
  };

  return (
    <div className="route-finder">
      <div className="left-column">
        <form onSubmit={handleSubmit}>
          <div className="search-box">
            <label>Ubicación de inicio:</label>
            <input
              type="text"
              value={startQuery}
              onChange={(e) => handleInputChange(e, setStartQuery, setStartSuggestions)}
              placeholder="Introduce la ubicación de inicio..."
            />
            <ul>
              {startSuggestions.map((suggestion) => (
                <li key={suggestion.place_id} onClick={() => handleSuggestionClick(suggestion, setStartCoord, setStartQuery)}>
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          </div>
          <div className="search-box">
            <label>Ubicación de destino:</label>
            <input
              type="text"
              value={goalQuery}
              onChange={(e) => handleInputChange(e, setGoalQuery, setGoalSuggestions)}
              placeholder="Introduce la ubicación de destino..."
            />
            <ul>
              {goalSuggestions.map((suggestion) => (
                <li key={suggestion.place_id} onClick={() => handleSuggestionClick(suggestion, setGoalCoord, setGoalQuery)}>
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          </div>
          <label>
            <input type="checkbox" checked={avoidTolls} onChange={(e) => setAvoidTolls(e.target.checked)} />
            Evitar Peajes
          </label>
          <label>
            <input type="checkbox" checked={optimizeFuel} onChange={(e) => setOptimizeFuel(e.target.checked)} />
            Optimizar Combustible
          </label>
          <button type="submit">Encontrar Ruta</button>
          <button type="button" onClick={handleReset}>Reiniciar</button>
          {mainRoute.length > 0 && (
            <button type="button" className="toggle-routes-button" onClick={toggleRoutes}>
              {showSecondaryRoutes ? 'Mostrar Ruta Principal' : 'Mostrar Rutas Secundarias'}
            </button>
          )}
          {error && <div className="error">{error}</div>}
        </form>
      </div>
      <MapView
        startCoord={startCoord}
        goalCoord={goalCoord}
        setStartCoord={updateStartCoord}
        setGoalCoord={updateGoalCoord}
        mainRoute={mainRoute}
        secondaryRoutes={secondaryRoutes}
        routeDetails={routeDetails}
        showSecondaryRoutes={showSecondaryRoutes}
      />
    </div>
  );
};

export default RouteFinder;

