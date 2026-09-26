"use client";

import { useEffect, useMemo, useRef } from "react";
import type L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { BranchView, EntityView } from "@/lib/entities";
import { OSM_TILE, RINGS_M, RING_STYLE, branchDivIcon, entityDivIcon, pulseMarker, ringLabelIcon, ringLabelPos } from "./pins";

export type Focus = { id: string; n: number } | null;

type Props = {
  branch: BranchView;
  entities: EntityView[];
  selectedId: string | null;
  focus: Focus;
  onSelect: (id: string) => void;
};

export default function DashboardMap({ branch, entities, selectedId, focus, onSelect }: Props) {
  const markers = useRef(new Map<string, L.Marker>());
  const center: [number, number] = [branch.lat, branch.lng];
  const branchIcon = useMemo(() => branchDivIcon(), []);

  return (
    <MapContainer center={center} zoom={15} minZoom={13} maxZoom={19} className="h-full w-full" scrollWheelZoom>
      <TileLayer url={OSM_TILE.url} attribution={OSM_TILE.attribution} maxZoom={19} />
      {RINGS_M.map((r) => (
        <Circle
          key={r}
          center={center}
          radius={r}
          pathOptions={RING_STYLE}
          interactive={false}
        />
      ))}
      {RINGS_M.map((r) => (
        <Marker key={`lbl-${r}`} position={ringLabelPos(center, r)} icon={ringLabelIcon(r)} interactive={false} keyboard={false} />
      ))}
      <Marker position={center} icon={branchIcon} zIndexOffset={1000}>
        <Tooltip direction="top" offset={[0, -20]}>
          {branch.name}
        </Tooltip>
      </Marker>
      {entities.map((e) => (
        <EntityMarker
          key={e.id}
          entity={e}
          selected={e.id === selectedId}
          onSelect={onSelect}
          register={(m) => {
            if (m) markers.current.set(e.id, m);
            else markers.current.delete(e.id);
          }}
        />
      ))}
      <FocusController focus={focus} markers={markers} />
    </MapContainer>
  );
}

function EntityMarker({
  entity: e,
  selected,
  onSelect,
  register,
}: {
  entity: EntityView;
  selected: boolean;
  onSelect: (id: string) => void;
  register: (m: L.Marker | null) => void;
}) {
  const icon = useMemo(
    () => entityDivIcon({ icon: e.icon, type: e.type, priority: e.priority, isAnchor: e.isAnchor, selected }),
    [e.icon, e.type, e.priority, e.isAnchor, selected],
  );
  return (
    <Marker
      ref={register}
      position={[e.lat, e.lng]}
      icon={icon}
      zIndexOffset={selected ? 500 : 0}
      eventHandlers={{ click: () => onSelect(e.id) }}
      keyboard
      title={e.name}
    >
      <Tooltip direction="top" offset={[0, -15]}>
        {e.name}
      </Tooltip>
    </Marker>
  );
}

function FocusController({
  focus,
  markers,
}: {
  focus: Focus;
  markers: React.RefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const m = markers.current.get(focus.id);
    if (!m) return;
    map.panTo(m.getLatLng(), { animate: true });
    // Tunggu icon "selected" terpasang sebelum memicu animasi pulse.
    const raf = requestAnimationFrame(() => pulseMarker(m));
    return () => cancelAnimationFrame(raf);
  }, [focus, map, markers]);
  return null;
}
