import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ResellerResult, LatLng } from "@localizador/shared";
import { useMemo } from "react";

// Fix para ícones padrão do Leaflet não aparecerem no react-leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapProps {
  origin: LatLng | null;
  results: ResellerResult[];
}

function MapBounds({ origin, results }: MapProps) {
  const map = useMap();

  useMemo(() => {
    if (!origin) return;

    const bounds = L.latLngBounds([origin.latitude, origin.longitude]);

    results.forEach((reseller) => {
      bounds.extend([
        reseller.location.latitude,
        reseller.location.longitude,
      ]);
    });

    if (results.length > 0) {
      map.fitBounds(bounds.pad(0.1));
    } else {
      map.setView([origin.latitude, origin.longitude], 13);
    }
  }, [origin, results, map]);

  return null;
}

export function MapContent({ origin, results }: MapProps) {
  if (!origin) return null;

  const originIcon = L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const resellerIcon = L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <MapContainer
      center={[origin.latitude, origin.longitude]}
      zoom={13}
      style={{ width: "100%", height: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds origin={origin} results={results} />

      <Marker position={[origin.latitude, origin.longitude]} icon={originIcon}>
        <Popup>Sua localização</Popup>
      </Marker>

      {results.map((reseller) => (
        <Marker
          key={reseller.id}
          position={[reseller.location.latitude, reseller.location.longitude]}
          icon={resellerIcon}
        >
          <Popup>
            <b>{reseller.name}</b>
            <br />
            {reseller.address}
            <br />
            {reseller.distanceKm.toFixed(2)} km
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
