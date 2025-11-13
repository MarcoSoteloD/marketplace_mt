// app/(public)/[slug_negocio]/DisplayMap.tsx
"use client";

// Importamos el CSS de Leaflet, ¡muy importante!
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Arreglamos el ícono por defecto de Leaflet (el bug que ya conocemos)
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapDisplayProps {
  lat: number;
  lng: number;
  popupText?: string;
}

export function DisplayMap({ lat, lng, popupText }: MapDisplayProps) {
  const position: [number, number] = [lat, lng];

  return (
    <MapContainer
      center={position}
      zoom={15} // Un zoom más cercano para ver la ubicación
      scrollWheelZoom={false}
      className="h-[250px] w-full rounded-md z-0" // Buena altura para el sidebar
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        {popupText && <Popup>{popupText}</Popup>}
      </Marker>
    </MapContainer>
  );
}