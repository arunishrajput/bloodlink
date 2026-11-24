"use client";

import dynamic from "next/dynamic";

/** Leaflet touches `window`, so the map only renders on the client. */
export const Map = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-line/60" />,
});
export type { MapPin } from "./MapView";
