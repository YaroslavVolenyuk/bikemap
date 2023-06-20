import 'leaflet-routing-machine';
import './leaflet-routing-machine.css';
import { createControlComponent } from '@react-leaflet/core';
import L from 'leaflet';
import React from 'react';

const createRoutineMachineLayer = ({ waypoints }) => {
  const waypointLatLngs = waypoints.map(({ lat, lng }) => L.latLng(lat, lng));

  const instance = L.Routing.control({
    waypoints: waypointLatLngs,

    lineOptions: {
      styles: [{ color: '#6FA1EC', weight: 4 }],
      extendToWaypoints: true,
      missingRouteTolerance: 0,
    },

    show: false,
    addWaypoints: true,
    routeWhileDragging: true,
    draggableWaypoints: true,
    // fitSelectedRoutes: true,
    showAlternatives: false,
  });

  return instance;
};

const RoutingMachine = ({ waypoints }) => {
  const RoutineMachine = createControlComponent(createRoutineMachineLayer);
  return <RoutineMachine waypoints={waypoints} />;
};

export default RoutingMachine;
