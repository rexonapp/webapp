'use client'
import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader } from 'lucide-react';

interface MapSelectorProps {
  latitude: string;
  longitude: string;
  onLocationSelect: (lat: string, lng: string) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapSelector({ latitude, longitude, onLocationSelect }: MapSelectorProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    
    script.onload = () => {
      setMapLoaded(true);
    };
    
    document.head.appendChild(script);

    return () => {
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      const centerLat = latitude ? parseFloat(latitude) : 13.6288;
      const centerLng = longitude ? parseFloat(longitude) : 79.4192;

      const map = window.L.map(mapRef.current).setView([centerLat, centerLng], 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = window.L.marker([lat, lng], {
            draggable: true,
          }).addTo(map);

          markerRef.current = marker;

          marker.on('dragend', (event: any) => {
            const position = event.target.getLatLng();
            onLocationSelect(position.lat.toFixed(6), position.lng.toFixed(6));
          });
        }
      }

      map.on('click', (event: any) => {
        const { lat, lng } = event.latlng;
        
        if (!markerRef.current) {
          const marker = window.L.marker([lat, lng], {
            draggable: true,
          }).addTo(map);

          markerRef.current = marker;

          marker.on('dragend', (event: any) => {
            const position = event.target.getLatLng();
            onLocationSelect(position.lat.toFixed(6), position.lng.toFixed(6));
          });
        } else {
          markerRef.current.setLatLng([lat, lng]);
        }
        
        onLocationSelect(lat.toFixed(6), lng.toFixed(6));
      });
    }
  }, [mapLoaded, onLocationSelect]);

  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
        } else {
          const marker = window.L.marker([lat, lng], {
            draggable: true,
          }).addTo(mapInstanceRef.current);

          markerRef.current = marker;

          marker.on('dragend', (event: any) => {
            const position = event.target.getLatLng();
            onLocationSelect(position.lat.toFixed(6), position.lng.toFixed(6));
          });
          
          mapInstanceRef.current.setView([lat, lng], 13);
        }
      }
    }
  }, [latitude, longitude, onLocationSelect]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          
          onLocationSelect(lat, lng);
          
          if (mapInstanceRef.current) {
            if (!markerRef.current) {
              const marker = window.L.marker([parseFloat(lat), parseFloat(lng)], {
                draggable: true,
              }).addTo(mapInstanceRef.current);

              markerRef.current = marker;

              marker.on('dragend', (event: any) => {
                const position = event.target.getLatLng();
                onLocationSelect(position.lat.toFixed(6), position.lng.toFixed(6));
              });
            } else {
              markerRef.current.setLatLng([parseFloat(lat), parseFloat(lng)]);
            }
            
            mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lng)], 15);
          }
          
          setGettingLocation(false);
        },
        (error) => {
          setGettingLocation(false);
          
          let errorMessage = 'Unable to get current location.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (!mapLoaded) {
    return (
      <div className="w-full">
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex gap-3">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {gettingLocation ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Getting location...</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-300">
        <div ref={mapRef} className="w-full h-96" style={{ zIndex: 0 }} />
      </div>
      
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          💡 Click on the map or drag the marker to set the warehouse location
        </p>
      </div>
    </div>
  );
}