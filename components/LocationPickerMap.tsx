'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Compass, Layers, Check, Loader2, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { matchRegionFromGeocode, MatchedRegionResult } from '@/lib/indonesia-regions';

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number, addressSuggestion?: string, regionDetails?: MatchedRegionResult) => void;
  searchAddress?: string;
}

export default function LocationPickerMap({
  initialLat,
  initialLng,
  onLocationChange,
  searchAddress,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || -6.2110,
    lng: initialLng || 106.8280,
  });
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Google Maps Tile URLs
  const getGoogleTileUrl = (type: 'roadmap' | 'satellite') => {
    return type === 'satellite'
      ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  };

  // Reverse geocode to get street / road name from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'User-Agent': 'KostKostanApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.pedestrian || data.address?.neighbourhood || '';
        const houseNumber = data.address?.house_number ? ` No. ${data.address.house_number}` : '';
        const hamlet = data.address?.hamlet || data.address?.village || '';
        
        let roadSuggestion = road ? `${road}${houseNumber}` : '';
        if (roadSuggestion && hamlet) {
          roadSuggestion += `, ${hamlet}`;
        }

        const matchedRegion = matchRegionFromGeocode(data.address);

        if (roadSuggestion) {
          setDetectedAddress(roadSuggestion);
          onLocationChange(lat, lng, roadSuggestion, matchedRegion);
        } else if (data.display_name) {
          const firstPart = data.display_name.split(',')[0];
          setDetectedAddress(firstPart);
          onLocationChange(lat, lng, firstPart, matchedRegion);
        } else {
          onLocationChange(lat, lng, undefined, matchedRegion);
        }
      } else {
        onLocationChange(lat, lng);
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
      onLocationChange(lat, lng);
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getGoogleTileUrl('roadmap'), {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps',
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      // Custom Draggable Google Maps Pin Marker
      const customPinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div class="relative flex flex-col items-center cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-full">
            <div class="bg-red-600 text-white p-2 rounded-full shadow-2xl border-2 border-white ring-4 ring-red-500/30 flex items-center justify-center animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div class="w-2.5 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5"></div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      });

      const marker = L.marker([currentCoords.lat, currentCoords.lng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCurrentCoords({ lat: position.lat, lng: position.lng });
        reverseGeocode(position.lat, position.lng);
      });

      // Click on map to move pin
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Trigger initial reverse geocode if no address yet
      reverseGeocode(currentCoords.lat, currentCoords.lng);

      setTimeout(() => {
        if (isMounted && map) {
          map.invalidateSize();
        }
      }, 300);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map and marker if initialLat / initialLng prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (initialLat && initialLng) {
      if (Math.abs(currentCoords.lat - initialLat) > 0.0001 || Math.abs(currentCoords.lng - initialLng) > 0.0001) {
        markerRef.current.setLatLng([initialLat, initialLng]);
        mapInstanceRef.current.flyTo([initialLat, initialLng], 16, { duration: 0.8 });
        setCurrentCoords({ lat: initialLat, lng: initialLng });
        reverseGeocode(initialLat, initialLng);
      }
    }
  }, [initialLat, initialLng]);

  // Switch Layer (Roadmap vs Satellite)
  const switchMapType = (type: 'roadmap' | 'satellite') => {
    setMapType(type);
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const newLayer = L.tileLayer(getGoogleTileUrl(type), {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps',
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
  };

  // Search Address / Forward Geocode
  const searchAddressOnMap = async () => {
    if (!searchAddress?.trim()) return;
    setIsGeocoding(true);
    try {
      const q = encodeURIComponent(searchAddress.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=id&limit=1`,
        { headers: { 'User-Agent': 'KostKostanApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 0.8 });
            setCurrentCoords({ lat, lng });
            reverseGeocode(lat, lng);
          }
        }
      }
    } catch (e) {
      console.error('Search address error:', e);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Use Current Geolocation
  const handleUseCurrentLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 0.8 });
            setCurrentCoords({ lat, lng });
            reverseGeocode(lat, lng);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setIsGeocoding(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-red-600" />
          <span>Pin Lokasi Kost di Google Maps (Dapat Digeser / Diklik):</span>
        </label>

        {isGeocoding && (
          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Mencari lokasi...</span>
          </span>
        )}
      </div>

      {/* Map Card */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner group">
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Top Control Bar: Layer Switch & Locate */}
        <div className="absolute top-2.5 right-2.5 z-400 flex items-center gap-1.5">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => switchMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapType === 'roadmap' ? 'bg-[#18181B] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Google Maps
            </button>
            <button
              type="button"
              onClick={() => switchMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapType === 'satellite' ? 'bg-[#18181B] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Satelit
            </button>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            title="Gunakan Lokasi GPS Saya Saat Ini"
            className="p-1.5 bg-white/95 backdrop-blur-md hover:bg-slate-100 text-slate-700 rounded-xl shadow-md border border-slate-200 transition-colors"
          >
            <Navigation className="w-4 h-4 text-emerald-600" />
          </button>
        </div>

        {/* Top Left Instructions */}
        <div className="absolute top-2.5 left-2.5 z-400 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span>Klik peta atau geser pin merah</span>
        </div>

        {/* Bottom Bar: Detected Street Name & Quick Actions */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-400 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Lokasi Terdeteksi dari Pin Google Maps:
            </span>
            <p className="font-extrabold text-slate-900 truncate text-xs">
              {detectedAddress || `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {detectedAddress && (
              <button
                type="button"
                onClick={() => onLocationChange(currentCoords.lat, currentCoords.lng, detectedAddress)}
                className="bg-[#0F2A43] hover:bg-[#152a65] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3 h-3" />
                <span>Salin ke Detail Jalan</span>
              </button>
            )}

            {searchAddress && (
              <button
                type="button"
                onClick={searchAddressOnMap}
                title="Cari alamat ini di Google Maps"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 border border-slate-300"
              >
                <Search className="w-3 h-3 text-[#0F2A43]" />
                <span>Cari Alamat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
        <span>Koordinat Peta: <strong className="text-slate-600 font-mono">{currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}</strong></span>
        <span>Pin ini menentukan posisi pin akurat pada menu Maps</span>
      </div>
    </div>
  );
}

