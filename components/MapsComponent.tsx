'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Kost } from '@/lib/types';
import { MapPin, X, ArrowRight, ShieldCheck, Eye, Layers, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { formatKostLocation } from '@/lib/jakarta-regions';

interface MapsComponentProps {
  kosts: Kost[];
  selectedKost: Kost | null;
  onSelectKost: (kost: Kost | null) => void;
}

export default function MapsComponent({ kosts, selectedKost, onSelectKost }: MapsComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Google Maps Tile URLs
  const getGoogleTileUrl = (type: 'roadmap' | 'satellite') => {
    // lyrs=m : Standard Google Maps Roadmap
    // lyrs=y : Google Maps Hybrid (Satellite + Road & Place Labels)
    return type === 'satellite'
      ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet on client side
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L;

      // Default center: Jakarta (Kuningan/Setiabudi area)
      const map = L.map(mapContainerRef.current, {
        center: [-6.2150, 106.8300],
        zoom: 12.5,
        zoomControl: false, // Custom zoom control for cleaner UI
        attributionControl: false,
      });

      // Add Google Maps TileLayer
      const tileLayer = L.tileLayer(getGoogleTileUrl('roadmap'), {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps',
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Ensure full rendering across container
      setTimeout(() => {
        if (isMounted && map) {
          map.invalidateSize();
        }
      }, 250);

      // Add custom styled markers for each kost
      kosts.forEach((kost) => {
        if (!kost.latitude || !kost.longitude) return;

        const isSelected = selectedKost?.id === kost.id;
        const priceLabel = `Rp ${(kost.harga / 1000000).toFixed(1)} Jt`;

        const iconHtml = `
          <div id="marker-${kost.id}" style="width:96px;height:32px;line-height:1" class="group-marker flex items-center justify-center gap-1.5 rounded-full shadow-lg text-xs font-bold border transition-all transform hover:scale-110 cursor-pointer whitespace-nowrap ${
            isSelected 
              ? 'bg-[#F97316] text-slate-950 border-slate-900 scale-110 ring-4 ring-[#F97316]/50 shadow-xl' 
              : 'bg-[#18181B] text-white border-white/90 hover:bg-[#F97316] hover:text-slate-950 shadow-md'
          }">
            <span class="text-[12px] leading-none">🏠</span>
            <span class="leading-none">${priceLabel}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: iconHtml,
          iconSize: [96, 32],
          iconAnchor: [48, 16],
        });

        const marker = L.marker([kost.latitude, kost.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          onSelectKost(kost);
          map.flyTo([kost.latitude!, kost.longitude!], 15, { duration: 0.8 });
        });

        markersRef.current[kost.id] = marker;
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle map type switch (Google Roadmap vs Google Satellite)
  const switchMapType = (newType: 'roadmap' | 'satellite') => {
    setMapType(newType);
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const newLayer = L.tileLayer(getGoogleTileUrl(newType), {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps',
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
  };

  // Update markers styling and flyTo when selectedKost changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      kosts.forEach((kost) => {
        const marker = markersRef.current[kost.id];
        if (!marker || !kost.latitude || !kost.longitude) return;

        const isSelected = selectedKost?.id === kost.id;
        const priceLabel = `Rp ${(kost.harga / 1000000).toFixed(1)} Jt`;

        const iconHtml = `
          <div id="marker-${kost.id}" style="width:96px;height:32px;line-height:1" class="group-marker flex items-center justify-center gap-1.5 rounded-full shadow-lg text-xs font-bold border transition-all transform hover:scale-110 cursor-pointer whitespace-nowrap ${
            isSelected 
              ? 'bg-[#F97316] text-slate-950 border-slate-900 scale-110 ring-4 ring-[#F97316]/50 shadow-xl' 
              : 'bg-[#18181B] text-white border-white/90 hover:bg-[#F97316] hover:text-slate-950 shadow-md'
          }">
            <span class="text-[12px] leading-none">🏠</span>
            <span class="leading-none">${priceLabel}</span>
          </div>
        `;

        marker.setIcon(L.divIcon({
          className: 'custom-map-marker',
          html: iconHtml,
          iconSize: [96, 32],
          iconAnchor: [48, 16],
        }));

        if (isSelected && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([kost.latitude, kost.longitude], 15, { duration: 0.8 });
        }
      });
    });
  }, [selectedKost, kosts]);

  // Fallback / Selected Kost preview thumbnail
  const thumbMedia = selectedKost?.media?.find(m => m.tipe === 'foto_gedung') || selectedKost?.media?.[0];
  const thumbUrl = thumbMedia?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
  const detailUrl = selectedKost ? `/kost/${(selectedKost.kota || 'jakarta').toLowerCase()}/${selectedKost.area.toLowerCase()}/${selectedKost.slug}` : '';

  return (
    <div className="relative w-full h-full min-h-0 z-0 lg:min-h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls: Google Maps Layer Toggle & Reset */}
      <div className="absolute top-4 right-4 z-400 flex items-center gap-2">
        {/* Layer Toggle (Peta / Satelit) */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchMapType('roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'roadmap'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Google Maps
          </button>
          <button
            type="button"
            onClick={() => switchMapType('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'satellite'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Satelit
          </button>
        </div>

        {/* Center to Jakarta button */}
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([-6.2150, 106.8300], 12.5, { duration: 0.8 });
            }
          }}
          title="Pusatkan Peta ke Jakarta"
          className="bg-white/95 backdrop-blur-md hover:bg-slate-100 text-slate-700 p-2 rounded-xl shadow-md border border-slate-200 transition-colors"
        >
          <Compass className="w-4 h-4 text-[#0F2A43]" />
        </button>

        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Perbesar"
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Perkecil"
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Kost Preview Card on Map (Sekitar 1:1 format) */}
      {selectedKost && (
        <div className="hidden lg:block absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-96 z-500 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F2A43] bg-[#FFEDD5] px-2.5 py-0.5 rounded-full border border-[#F97316]/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>{formatKostLocation(selectedKost)}</span>
            </div>
            <button
              onClick={() => onSelectKost(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3.5 items-center">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              <Image
                src={thumbUrl}
                alt={selectedKost.nama}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                {selectedKost.nama}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {selectedKost.alamat}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-sm font-extrabold text-slate-900">
                  Rp {selectedKost.harga.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400">/ bulan</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
              <Eye className="w-3.5 h-3.5 text-[#F97316]" />
              <span>3 Foto + 1 Video Free</span>
            </div>
            <Link
              href={detailUrl}
              className="inline-flex items-center gap-1 bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <span>Lihat Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
