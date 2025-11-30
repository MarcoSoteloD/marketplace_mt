"use client";

import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)["_getIconUrl"];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Este componente hijo escucha los clics en el mapa
function MapEvents({ onPositionChange }: { onPositionChange: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng); // Llama a la función del padre con la nueva posición
    },
  });
  return null; // No renderiza nada
}

interface MapSelectorProps {
  defaultLat?: number | null;
  defaultLng?: number | null;
}

export function MapSelector({ defaultLat, defaultLng }: MapSelectorProps) {
  const defaultPosition: [number, number] = [
    Number(defaultLat) || 19.4096792, 
    Number(defaultLng) || -103.5490783
  ];
  
  const [position, setPosition] = useState<[number, number]>(defaultPosition);

  const handlePositionChange = (latlng: L.LatLng) => {
    setPosition([latlng.lat, latlng.lng]);
  };

  return (
    <div className="space-y-4">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="h-[400px] w-full rounded-md z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Mueve el marcador haciendo clic en el mapa.
          </Popup>
        </Marker>
        <MapEvents onPositionChange={handlePositionChange} />
      </MapContainer>
      
      {/* --- LOS INPUTS OCULTOS --- */}
      <input 
        type="hidden" 
        name="latitud" 
        value={position[0]} 
      />
      <input 
        type="hidden" 
        name="longitud" 
        value={position[1]} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label>Latitud (Automático)</Label>
          <Input value={position[0].toFixed(6)} disabled />
        </div>
        <div className="grid gap-2">
          <Label>Longitud (Automático)</Label>
          <Input value={position[1].toFixed(6)} disabled />
        </div>
      </div>
    </div>
  );
}