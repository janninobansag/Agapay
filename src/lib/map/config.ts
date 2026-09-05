export const OSM_TILE_URL =
  process.env.NEXT_PUBLIC_OSM_TILE_URL ??
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const PHILIPPINES_CENTER: [number, number] = [120.9842, 14.5995];
export const OSM_MAX_ZOOM = 19;

export const osmRasterStyle = {
  version: 8 as const,
  sources: {
    openStreetMap: {
      type: "raster" as const,
      tiles: [OSM_TILE_URL],
      tileSize: 256,
      maxzoom: OSM_MAX_ZOOM,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    },
  },
  layers: [{ id: "openStreetMap", type: "raster" as const, source: "openStreetMap" }],
};
