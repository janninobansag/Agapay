"use client";

import { useEffect, useRef, useState } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import { MapPin, Search } from "lucide-react";
import { PHILIPPINES_CENTER, osmRasterStyle } from "@/lib/map/config";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

type Place = { label: string; latitude: number; longitude: number };
type InitialLocation = { address: string; latitude: number | null; longitude: number | null };

export function LocationPicker({ initial }: { initial?: InitialLocation }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude ?? null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);

  function moveMarker(nextLongitude: number, nextLatitude: number) {
    setLongitude(nextLongitude);
    setLatitude(nextLatitude);
    if (!mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new Marker({ color: "#19765b", draggable: true })
        .setLngLat([nextLongitude, nextLatitude])
        .addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const point = markerRef.current?.getLngLat();
        if (point) { setLongitude(point.lng); setLatitude(point.lat); }
      });
    } else markerRef.current.setLngLat([nextLongitude, nextLatitude]);
    mapRef.current.flyTo({ center: [nextLongitude, nextLatitude], zoom: 17 });
  }

  useEffect(() => {
    if (!mapContainer.current) return;
    const hasPoint = initial?.latitude != null && initial.longitude != null;
    const map = new Map({ container: mapContainer.current, style: osmRasterStyle, center: hasPoint ? [initial.longitude!, initial.latitude!] : PHILIPPINES_CENTER, zoom: hasPoint ? 17 : 14 });
    map.addControl(new NavigationControl(), "top-right");
    map.on("click", (event) => moveMarker(event.lngLat.lng, event.lngLat.lat));
    mapRef.current = map;
    if (hasPoint) {
      markerRef.current = new Marker({ color: "#19765b", draggable: true })
        .setLngLat([initial.longitude!, initial.latitude!])
        .addTo(map);
      markerRef.current.on("dragend", () => {
        const point = markerRef.current?.getLngLat();
        if (point) { setLongitude(point.lng); setLatitude(point.lat); }
      });
    }
    return () => { markerRef.current?.remove(); markerRef.current = null; mapRef.current = null; map.remove(); };
    // Initial values only establish the map once; form state owns later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchLocation() {
    if (address.trim().length < 3) { setMessage("Enter at least three characters."); return; }
    setSearching(true); setMessage(""); setPlaces([]);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
      const result = await response.json() as { places?: Place[]; message?: string };
      if (!response.ok) throw new Error(result.message ?? "Search failed.");
      setPlaces(result.places ?? []);
      if (!result.places?.length) setMessage("No matching location was found in the Philippines.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Location search is unavailable.");
    } finally { setSearching(false); }
  }

  function choose(place: Place) {
    setAddress(place.label); setPlaces([]); setMessage("Location selected. You can drag the marker to refine it.");
    moveMarker(place.longitude, place.latitude);
  }

  return <div><label className="text-sm font-bold text-brand-dark" htmlFor="address">Location</label><div className="mt-2 flex gap-2"><div className="relative flex-1"><MapPin className="absolute left-3 top-3.5 text-muted" size={19} /><input className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm" id="address" maxLength={240} name="address" onChange={(event) => { setAddress(event.target.value); setLatitude(null); setLongitude(null); }} placeholder="Street, landmark, barangay, and city" value={address} /></div><button className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white disabled:opacity-60" disabled={searching} onClick={searchLocation} type="button"><Search size={16} /> {searching ? "Searching…" : "Search"}</button></div>
  {places.length > 0 && <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">{places.map((place) => <li key={`${place.latitude}-${place.longitude}`}><button className="w-full p-3 text-left text-sm hover:bg-surface-muted" onClick={() => choose(place)} type="button">{place.label}</button></li>)}</ul>}
  {message && <p aria-live="polite" className="mt-2 text-xs text-muted">{message}</p>}
  <div className="mt-3 h-72 overflow-hidden rounded-2xl border border-border" ref={mapContainer} />
  <input name="latitude" type="hidden" value={latitude ?? ""} /><input name="longitude" type="hidden" value={longitude ?? ""} />
  <p className="mt-2 text-xs text-muted">Search and select a result, or click the map. Submitted reports require a marker inside the Philippines.</p></div>;
}
