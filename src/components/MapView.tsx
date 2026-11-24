"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

export type MapPin = { id: string; lat: number; lng: number; label: string; sub?: string; tone?: "brand" | "muted" };

const icon = (tone: "brand" | "muted" | "you") =>
  L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    html:
      tone === "you"
        ? `<div style="width:18px;height:18px;margin:4px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb55"></div>`
        : `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 2C8 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3-7-7-7Z" fill="${tone === "brand" ? "#c41a33" : "#9b8d90"}" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>`,
  });

function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom ?? map.getZoom());
  }, [lat, lng, zoom, map]);
  return null;
}

function ClickToSet({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapView({
  center,
  zoom = 11,
  pins = [],
  you,
  radiusKm,
  editable,
  onPick,
  className = "h-72",
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  pins?: MapPin[];
  you?: { lat: number; lng: number } | null;
  radiusKm?: number;
  editable?: boolean;
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className={`w-full overflow-hidden rounded-2xl ${className}`}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={center.lat} lng={center.lng} zoom={zoom} />
      {you && radiusKm && <Circle center={[you.lat, you.lng]} radius={radiusKm * 1000} pathOptions={{ color: "#c41a33", weight: 1, fillOpacity: 0.05 }} />}
      {you && (
        <Marker
          position={[you.lat, you.lng]}
          icon={icon(editable ? "brand" : "you")}
          draggable={editable}
          eventHandlers={editable && onPick ? { dragend: (e) => { const p = (e.target as L.Marker).getLatLng(); onPick(p.lat, p.lng); } } : undefined}
        />
      )}
      {editable && onPick && <ClickToSet onPick={onPick} />}
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icon(p.tone ?? "brand")}>
          <Popup>
            <strong>{p.label}</strong>
            {p.sub && <div>{p.sub}</div>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
