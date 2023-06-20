import 'leaflet-routing-machine';
import { GraphHopper } from '@routingjs/graphhopper';
import L from 'leaflet';
import React, { useEffect, useState } from 'react';

const MapWithGraphHopper = () => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Создание карты
    const map = L.map('map').setView([51.505, -0.09], 13);

    // Добавление тайлового слоя
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    setMap(map);

    return () => {
      // Уничтожение карты при размонтировании компонента
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (map) {
      // Запрос к API GraphHopper
      const apiKey = 'fa98aa5b-16af-4242-af72-7ef45d5a215e';
      const startPoint = [51.508, -0.11]; // Начальная точка
      const endPoint = [51.503, -0.08]; // Конечная точка

      // Формирование URL запроса
      const requestUrl =
        'https://graphhopper.com/api/1/route?point=51.2082,51.3738&point=48.224,3.867&profile=car&locale=de&elevation=true&key=fa98aa5b-16af-4242-af72-7ef45d5a215e';
      // `https://graphhopper.com/api/1/route?point=${startPoint[0]},${startPoint[1]}&point=${endPoint[0]},${endPoint[1]}&key=${apiKey}`;

      // Отправка запроса
      fetch(requestUrl)
        .then((response) => response.json())
        .then((data) => {
          // Опции для слоя маршрута
          const routeOptions = {
            lineOptions: {
              styles: [{ color: '#3388ff', opacity: 0.7, weight: 5 }],
            },
            addWaypoints: false,
          };

          // Создание слоя маршрута
          const routeLayer = L.Routing.graphHopper().addTo(map);
          routeLayer.setWaypoints([L.latLng(startPoint), L.latLng(endPoint)]);

          // Добавление слоя маршрута на карту
          const control = L.Routing.control({
            routeLine: (route) => routeLayer.setRoute(route),
            waypoints: [L.latLng(startPoint), L.latLng(endPoint)],
            ...routeOptions,
          }).addTo(map);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [map]);

  return <div id="map" style={{ height: '400px' }} />;
};

export default MapWithGraphHopper;
