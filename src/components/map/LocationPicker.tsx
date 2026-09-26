"use client";

import { useEffect, useMemo } from "react";
import type L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { BranchView } from "@/lib/entities";
import type { EntityIcon, EntityType, Priority } from "@/generated/prisma/enums";
import { OSM_TILE, RING_STYLE, branchDivIcon, entityDivIcon } from "./pins";

type Props = {
  branch: BranchView;
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  pin: { icon: EntityIcon; type: EntityType; priority: Priority; isAnchor: boolean };
};

const round = (n: number) => Math.round(n * 1e7) / 1e7;

/** Mini-map: klik peta atau geser pin untuk mengisi koordinat. */
export default function LocationPicker({ branch, value, onChange, pin }: Props) {
  const center: [number, number] = [branch.lat, branch.lng];
  const branchIcon = useMemo(() => branchDivIcon(), []);
  const icon = useMemo(() => entityDivIcon({ ...pin, selected: true }), [pin]);

  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : center}
      zoom={16}
      minZoom={13}
      maxZoom={19}
      className="h-full w-full cursor-crosshair"
    >
      <TileLayer url={OSM_TILE.url} attribution={OSM_TILE.attribution} maxZoom={19} />
      <Circle
        center={center}
        radius={branch.radiusM}
        pathOptions={RING_STYLE}
        interactive={false}
      />
      <Marker position={center} icon={branchIcon} interactive={false} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={icon}
          draggable
          zIndexOffset={1000}
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onChange(round(p.lat), round(p.lng));
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -15]}>
            Geser untuk memindahkan
          </Tooltip>
        </Marker>
      )}
      <ClickToSet onChange={onChange} />
      <FollowValue value={value} />
    </MapContainer>
  );
}

function ClickToSet({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({ click: (e) => onChange(round(e.latlng.lat), round(e.latlng.lng)) });
  return null;
}

/** Bila koordinat diketik manual & keluar layar, geser peta ke sana. */
function FollowValue({ value }: { value: Props["value"] }) {
  const map = useMap();
  useEffect(() => {
    if (value && !map.getBounds().pad(-0.1).contains([value.lat, value.lng])) {
      map.panTo([value.lat, value.lng]);
    }
  }, [value, map]);
  return null;
}
