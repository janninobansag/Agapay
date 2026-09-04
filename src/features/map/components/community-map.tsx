"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map, Marker, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl";
import { PHILIPPINES_CENTER, osmRasterStyle } from "@/lib/map/config";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export type MapReport = {
  id: string;
  title: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
};

export function CommunityMap({ reports }: { reports: MapReport[] }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = new Map({ container: container.current, style: osmRasterStyle, center: PHILIPPINES_CENTER, zoom: 14 });
    map.addControl(new NavigationControl(), "top-right");
    const bounds = new LngLatBounds();

    for (const report of reports) {
      const content = document.createElement("div");
      const heading = document.createElement("strong");
      const detail = document.createElement("p");
      heading.textContent = report.title;
      detail.textContent = `${report.category} · ${report.status} · ${report.id}`;
      content.append(heading, detail);
      new Marker({ color: report.status === "In Progress" ? "#f0a04b" : "#19765b" })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(new Popup({ offset: 22 }).setDOMContent(content))
        .addTo(map);
      bounds.extend([report.longitude, report.latitude]);
    }

    if (reports.length > 1) map.fitBounds(bounds, { padding: 70, maxZoom: 16 });
    if (reports.length === 1) map.setCenter([reports[0].longitude, reports[0].latitude]);
    return () => map.remove();
  }, [reports]);

  return <div aria-label="Map of verified community reports" className="h-[560px] w-full" ref={container} />;
}
