import L from "leaflet";
import { ICON_SVG } from "@/lib/constants";
import type { EntityIcon, EntityType, Priority } from "@/generated/prisma/enums";

export function entityDivIcon(opts: {
  icon: EntityIcon;
  type: EntityType;
  priority: Priority;
  isAnchor: boolean;
  selected?: boolean;
}) {
  const cls = [
    "pin-badge",
    `prio-${opts.priority}`,
    opts.type === "MERCHANT" ? "merchant" : "company",
    opts.isAnchor ? "anchor" : "",
  ].join(" ");
  return L.divIcon({
    className: "",
    html: `<div class="pin-wrap${opts.selected ? " selected" : ""}"><div class="${cls}"><svg viewBox="0 0 24 24">${ICON_SVG[opts.icon]}</svg></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export const branchDivIcon = () =>
  L.divIcon({
    className: "",
    html: '<div class="branch-badge"><svg viewBox="0 0 24 24"><path d="M12 2 C17 2 21 6 21 11 C21 16.5 16.5 20 12 22 C7.5 20 3 16.5 3 11 C3 6 7 2 12 2 Z" fill="#F2A93B"/></svg></div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

export const RINGS_M = [500, 1000, 1500, 2000];

export const RING_STYLE: L.PathOptions = {
  color: "#0F6BC4",
  weight: 2,
  opacity: 0.85,
  dashArray: "6 6",
  fill: false,
};

/** Titik paling utara cincin (untuk label jarak). */
export const ringLabelPos = ([lat, lng]: [number, number], r: number): [number, number] => [
  lat + r / 111_320,
  lng,
];

export const ringLabelIcon = (r: number) =>
  L.divIcon({
    className: "",
    html: `<span class="ring-label">${r < 1000 ? `${r} m` : `${(r / 1000).toLocaleString("id-ID")} km`}</span>`,
    iconSize: [0, 0],
  });

export const OSM_TILE = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export function pulseMarker(marker: L.Marker | undefined) {
  const wrap = marker?.getElement()?.querySelector(".pin-wrap");
  if (!wrap) return;
  wrap.classList.remove("pulse");
  void (wrap as HTMLElement).offsetWidth; // restart animasi
  wrap.classList.add("pulse");
}
