"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default Leaflet marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function HospitalMap({ 
  lat, 
  lon, 
  name, 
  address,
  userLat,
  userLon
}: { 
  lat: number, 
  lon: number, 
  name: string, 
  address: string,
  userLat?: number,
  userLon?: number
}) {
  const position: [number, number] = [lat, lon];
  const userPosition: [number, number] | null = userLat && userLon ? [userLat, userLon] : null;

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="h-[200px] w-full rounded-xl overflow-hidden shadow-inner border border-white/10 z-0">
      <MapContainer 
        center={position} 
        zoom={userPosition ? 12 : 15} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-sm">
              <span className="font-bold">{name}</span>
              <br />
              {address}
            </div>
          </Popup>
        </Marker>

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>
              <div className="text-sm font-bold text-emerald-600">Your Location</div>
            </Popup>
          </Marker>
        )}
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
}
