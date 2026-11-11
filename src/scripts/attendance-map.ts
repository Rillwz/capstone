// MapLibre wrapper for the attendance pages. Lazy by design: only the pages that render
// a map pay for the ~250 kB library, and the style follows the active theme.
//
// The router swaps the DOM but keeps modules, so every map must be removed on
// `astro:before-swap` — a leaked WebGL context kills the tab after a few navigations.
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { circlePolygon } from "../lib/attendance.ts";
import { currentTheme } from "./theme.ts";

/** Free, key-less vector tiles. One style per theme so the map is not a bright rectangle in dark mode. */
const STYLE_URL: Record<string, string> = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
  paper: "https://tiles.openfreemap.org/styles/positron",
};

const styleForTheme = () => STYLE_URL[currentTheme()] ?? STYLE_URL.light;

const CIRCLE_SOURCE = "attendance-radius";
const CIRCLE_ID = "attendance-radius";

export interface MountOptions {
  latitude: number;
  longitude: number;
  zoom: number;
  /** Draw a fence circle of this many metres. */
  radius?: number;
  /** Marker can be dragged; the callback receives the new point. */
  draggable?: boolean;
  onPick?: (point: { latitude: number; longitude: number }) => void;
  /** A second, differently coloured pin for "where I am now". */
  fix?: { latitude: number; longitude: number } | null;
}

export interface AttendanceMap {
  setCenter(latitude: number, longitude: number, zoom?: number): void;
  setCircle(latitude: number, longitude: number, radius: number): void;
  setFix(latitude: number, longitude: number): void;
  setRadius(radius: number): void;
  destroy(): void;
}

/** Mount a map into `container` and return the handles the page needs. */
export async function mountAttendanceMap(
  container: HTMLElement,
  options: MountOptions,
): Promise<AttendanceMap> {
  const maplibregl = await import("maplibre-gl");
  await import("maplibre-gl/dist/maplibre-gl.css");

  const map: MapLibreMap = new maplibregl.Map({
    container,
    style: styleForTheme(),
    center: [options.longitude, options.latitude],
    zoom: options.zoom,
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  const marker: Marker = new maplibregl.Marker({
    color: "#4f46e5",
    draggable: options.draggable ?? false,
  })
    .setLngLat([options.longitude, options.latitude])
    .addTo(map);

  let fixMarker: Marker | null = null;
  let center = { latitude: options.latitude, longitude: options.longitude };
  let radius = options.radius ?? 0;

  const drawCircle = () => {
    if (!radius) return;
    // Before the style is parsed there is no source container; queue the draw instead of
    // throwing "Style is not done loading".
    if (!map.isStyleLoaded()) {
      map.once("load", drawCircle);
      return;
    }
    const data = circlePolygon(center.latitude, center.longitude, radius);
    const source = map.getSource(CIRCLE_SOURCE) as
      | { setData: (feature: unknown) => void }
      | undefined;
    if (source) {
      source.setData(data);
      return;
    }
    map.addSource(CIRCLE_SOURCE, { type: "geojson", data });
    map.addLayer({
      id: CIRCLE_ID,
      type: "fill",
      source: CIRCLE_SOURCE,
      paint: { "fill-color": "#4f46e5", "fill-opacity": 0.12 },
    });
    map.addLayer({
      id: `${CIRCLE_ID}-line`,
      type: "line",
      source: CIRCLE_SOURCE,
      paint: { "line-color": "#4f46e5", "line-width": 2, "line-dasharray": [3, 2] },
    });
  };

  marker.on("dragend", () => {
    const { lat, lng } = marker.getLngLat();
    center = { latitude: lat, longitude: lng };
    drawCircle();
    options.onPick?.({ latitude: lat, longitude: lng });
  });

  if (options.fix) {
    fixMarker = new maplibregl.Marker({ color: "#10b981" })
      .setLngLat([options.fix.longitude, options.fix.latitude])
      .addTo(map);
  }

  map.on("load", drawCircle);

  return {
    setCenter(latitude, longitude, zoom) {
      center = { latitude, longitude };
      marker.setLngLat([longitude, latitude]);
      map.jumpTo({ center: [longitude, latitude], ...(zoom === undefined ? {} : { zoom }) });
      drawCircle();
    },
    setCircle(latitude, longitude, nextRadius) {
      center = { latitude, longitude };
      radius = nextRadius;
      drawCircle();
    },
    setRadius(nextRadius) {
      radius = nextRadius;
      drawCircle();
    },
    setFix(latitude, longitude) {
      center = { latitude, longitude };
      if (fixMarker) {
        fixMarker.setLngLat([longitude, latitude]);
      } else {
        fixMarker = new maplibregl.Marker({ color: "#10b981" })
          .setLngLat([longitude, latitude])
          .addTo(map);
      }
      map.jumpTo({ center: [longitude, latitude] });
    },
    destroy() {
      map.remove();
    },
  };
}
