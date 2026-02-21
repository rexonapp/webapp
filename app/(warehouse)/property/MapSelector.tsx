'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader, Search, AlertCircle } from 'lucide-react';

interface MapSelectorProps {
  latitude: string;
  longitude: string;
  address?: string;
  city?: string;
  state?: string;
  onLocationSelect: (lat: string, lng: string) => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function MapSelector({
  latitude,
  longitude,
  address = '',
  city = '',
  state = '',
  onLocationSelect,
}: MapSelectorProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'success' | 'fallback' | 'error'>('idle');
  const [geocodeMessage, setGeocodeMessage] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeocodedRef = useRef<string>('');

  // ─── Load Google Maps script once ────────────────────────────────────────────
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    if (document.getElementById('google-maps-script')) {
      const poll = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(poll);
          setMapLoaded(true);
        }
      }, 200);
      return () => clearInterval(poll);
    }

    window.initGoogleMap = () => setMapLoaded(true);

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geocoding&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ─── Initialise map once the script is ready ─────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const centerLat = latitude ? parseFloat(latitude) : 17.385;
    const centerLng = longitude ? parseFloat(longitude) : 78.4867;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: latitude && longitude ? 15 : 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    geocoderRef.current = new window.google.maps.Geocoder();
    mapInstanceRef.current = map;

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) placeOrMoveMarker(lat, lng, map);
    }

    map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      placeOrMoveMarker(lat, lng, map);
      onLocationSelect(lat.toFixed(6), lng.toFixed(6));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  // ─── Sync external lat/lng → marker ─────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    placeOrMoveMarker(lat, lng, mapInstanceRef.current);
    mapInstanceRef.current.panTo({ lat, lng });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  // ─── Debounced geocoding ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !geocoderRef.current) return;

    const fullAddress = [address, city, state].filter(Boolean).join(', ');
    if (!fullAddress || fullAddress === lastGeocodedRef.current) return;

    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

    geocodeTimerRef.current = setTimeout(() => {
      geocodeAddress(fullAddress);
    }, 800);

    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, city, state, mapLoaded]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const placeOrMoveMarker = useCallback((lat: number, lng: number, map: any) => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        icon: {
          // Standard teardrop / pin path (Material Design place icon)
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#1D4ED8',   // Tailwind blue-700
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
          scale: 2,
          // Anchor at the tip of the pin (bottom-centre of the 24×24 viewBox)
          anchor: new window.google.maps.Point(12, 22),
        },
      });

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        onLocationSelect(pos.lat().toFixed(6), pos.lng().toFixed(6));
      });

      markerRef.current = marker;
    }
  }, [onLocationSelect]);

  const geocodeAddress = useCallback(async (query: string) => {
    if (!geocoderRef.current) return;

    setGeocoding(true);
    setGeocodeStatus('idle');
    lastGeocodedRef.current = query;

    const attempt = (q: string, fallback: boolean) =>
      new Promise<{ lat: number; lng: number } | null>((resolve) => {
        geocoderRef.current.geocode({ address: q }, (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve(null);
          }
        });
      });

    let result = await attempt(query, false);
    let usedFallback = false;

    if (!result && (city || state)) {
      const fallbackQuery = [city, state, 'India'].filter(Boolean).join(', ');
      result = await attempt(fallbackQuery, true);
      usedFallback = true;
    }

    setGeocoding(false);

    if (result) {
      placeOrMoveMarker(result.lat, result.lng, mapInstanceRef.current);
      mapInstanceRef.current.setCenter({ lat: result.lat, lng: result.lng });
      mapInstanceRef.current.setZoom(usedFallback ? 12 : 16);
      onLocationSelect(result.lat.toFixed(6), result.lng.toFixed(6));
      setGeocodeStatus(usedFallback ? 'fallback' : 'success');
      setGeocodeMessage(
        usedFallback
          ? `Showing approximate location for ${city || state}. Click the map to pinpoint exactly.`
          : 'Location found! Drag the marker to fine-tune.'
      );
    } else {
      setGeocodeStatus('error');
      setGeocodeMessage('Could not locate address. Click the map to set manually.');
    }
  }, [city, state, placeOrMoveMarker, onLocationSelect]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        placeOrMoveMarker(lat, lng, mapInstanceRef.current);
        mapInstanceRef.current?.setCenter({ lat, lng });
        mapInstanceRef.current?.setZoom(16);
        onLocationSelect(lat.toFixed(6), lng.toFixed(6));
        setGettingLocation(false);
        setGeocodeStatus('success');
        setGeocodeMessage('Using your current location.');
      },
      (error) => {
        setGettingLocation(false);
        const msgs: Record<number, string> = {
          1: 'Location permission denied. Please enable it in browser settings.',
          2: 'Location information unavailable. Try again.',
          3: 'Location request timed out. Try again.',
        };
        alert(msgs[error.code] || 'Unable to get current location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full">
        <div className="w-full h-96 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-200">
          <div className="text-center px-4">
            <AlertCircle className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-700">Google Maps API key missing</p>
            <p className="text-xs text-orange-500 mt-1">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="w-full">
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation || geocoding}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {gettingLocation ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Getting location…</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              <span>Use Current Location</span>
            </>
          )}
        </button>

        {geocoding && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Search className="h-4 w-4 animate-pulse" />
            <span>Finding address on map…</span>
          </div>
        )}
      </div>

      {/* Status banner */}
      {geocodeStatus !== 'idle' && !geocoding && (
        <div
          className={`mb-3 flex items-start gap-2 text-sm px-3 py-2 rounded-lg border ${
            geocodeStatus === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : geocodeStatus === 'fallback'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-orange-50 border-orange-200 text-orange-700'
          }`}
        >
          {geocodeStatus === 'success' && <MapPin className="h-4 w-4 mt-0.5 shrink-0" />}
          {geocodeStatus === 'fallback' && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          {geocodeStatus === 'error' && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          <span>{geocodeMessage}</span>
        </div>
      )}

      {/* Map container */}
      <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        <div ref={mapRef} className="w-full h-96" style={{ zIndex: 0 }} />
      </div>

      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          💡 Type an address above to auto-pin the location, or click the map / drag the marker to set it manually.
        </p>
      </div>
    </div>
  );
}