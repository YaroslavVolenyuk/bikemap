import 'leaflet-routing-machine';
import { createControlComponent } from '@react-leaflet/core';
import L from 'leaflet';

const createRoutineMachineLayer = ({ waypoints }) => {
  const waypointLatLngs = waypoints.map(({ lat, lng }) => L.latLng(lat, lng));

  const instance = L.Routing.control({
    waypoints: waypointLatLngs,

    // waypoints.map(({ lat, lng }) => L.latLng(lat, lng)),
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

// const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;
