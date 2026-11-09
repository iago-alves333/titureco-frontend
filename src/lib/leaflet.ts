import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { createLayerComponent, type LayerProps } from '@react-leaflet/core';
import type { ReactNode } from 'react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite rewrites asset URLs, which breaks Leaflet's default icon path detection. Fixed once here.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
export const DEFAULT_CENTER: [number, number] = [-7.12, -34.84];

/** <MarkerClusterGroup> for react-leaflet v5, built on the official core API instead of a wrapper package. */
export const MarkerClusterGroup = createLayerComponent<L.MarkerClusterGroup, LayerProps & { children?: ReactNode }>(
  (_props, ctx) => {
    const group = L.markerClusterGroup({ showCoverageOnHover: false });
    return { instance: group, context: { ...ctx, layerContainer: group } };
  },
);
