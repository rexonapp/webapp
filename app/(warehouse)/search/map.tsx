'use client'

import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 19.07283,
  lng: 72.88261,
};

interface PropertyImage {
  url: string;
  type: string;
  order: number;
  description: string;
  isMain: boolean;
}

interface Property {
  ListingId: string;
  ListPrice: number;
  BedroomsTotal: number;
  Bathrooms: number;
  LivingArea: number;
  PropertyType: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  UnparsedAddress?: string;
  YearBuilt?: number;
  ListAgentFullName?: string;
  PublicRemarks?: string;
  media?: PropertyImage[];
  Latitude: number;
  Longitude: number;
  ShowMapLink: string;
  [key: string]: any;
}

export interface MapBounds {
  top_left: { lat: number; lng: number };
  bottom_right: { lat: number; lng: number };
}

export interface MapCenter {
  lat: number;
  lng: number;
}

// Bounds change interface
interface BoundsChangeData {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
}

interface MapProps {
  properties?: Property[];
  bounds?: MapBounds;
  center?: MapCenter;
  zoom?: number;
  onBoundsChange?: (bounds: BoundsChangeData) => void;
}

const Map = ({ properties = [], bounds, center, zoom, onBoundsChange }: MapProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractionRef = useRef(false);

  // Handle bounds change with debouncing
  const handleBoundsChanged = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return;

    // Clear existing timeout
    if (boundsChangeTimeoutRef.current) {
      clearTimeout(boundsChangeTimeoutRef.current);
    }

    // Set new timeout to debounce the bounds change
    boundsChangeTimeoutRef.current = setTimeout(() => {
      if (!mapRef.current) return;

      const bounds = mapRef.current.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const mapBounds: BoundsChangeData = {
        ne: { lat: ne.lat(), lng: ne.lng() },
        sw: { lat: sw.lat(), lng: sw.lng() }
      };

      onBoundsChange(mapBounds);
    }, 300); // 300ms debounce for responsive feel
  }, [onBoundsChange]);

  // Update map bounds when bounds prop changes
  useEffect(() => {
    if (mapRef.current && bounds) {
      isUserInteractionRef.current = false;
      const googleBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.bottom_right.lat, bounds.top_left.lng),
        new google.maps.LatLng(bounds.top_left.lat, bounds.bottom_right.lng)
      );
      mapRef.current.fitBounds(googleBounds);
      
      setTimeout(() => {
        isUserInteractionRef.current = true;
      }, 1000);
    }
  }, [bounds]);

  // Update map center/zoom when they change
  useEffect(() => {
    if (mapRef.current && center && zoom) {
      isUserInteractionRef.current = false;
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
      
      setTimeout(() => {
        isUserInteractionRef.current = true;
      }, 1000);
    }
  }, [center, zoom]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    if (bounds) {
      const googleBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.bottom_right.lat, bounds.top_left.lng),
        new google.maps.LatLng(bounds.top_left.lat, bounds.bottom_right.lng)
      );
      map.fitBounds(googleBounds);
    }

    // Trigger initial bounds change after map loads
    setTimeout(() => {
      handleBoundsChanged();
      isUserInteractionRef.current = true;
    }, 1000);
  }, [bounds, handleBoundsChanged]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current);
      }
    };
  }, []);

  if (!isLoaded) return <div className="flex items-center justify-center h-full">Loading map...</div>;

  const mapCenter = center || defaultCenter;
  const mapZoom = zoom || 11;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={mapZoom}
      onLoad={onMapLoad}
      onBoundsChanged={handleBoundsChanged}
      onZoomChanged={handleBoundsChanged}
      onDragEnd={handleBoundsChanged}
      options={{
        gestureHandling: "greedy",
        scrollwheel: true,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      }}
    >
      {properties.map((property) =>
        property.ShowMapLink === "true" ? (
          <Marker
            key={property.ListingId}
            position={{
              lat: Number(property.Latitude),
              lng: Number(property.Longitude),
            }}
            onClick={() => setSelectedProperty(property)}
            title={property.UnparsedAddress}
          />
        ) : null
      )}

      {selectedProperty && (
        <InfoWindow
          position={{
            lat: Number(selectedProperty.Latitude),
            lng: Number(selectedProperty.Longitude),
          }}
          onCloseClick={() => setSelectedProperty(null)}
        >
          <div style={{ width: '240px', fontFamily: 'Arial, sans-serif' }}>
            <Link href={`/property/${selectedProperty.ListingId}`}>
              <img
                src={selectedProperty.media?.find((m) => m.url?.startsWith('https'))?.url}
                alt="Property"
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
            </Link>
            <h4 style={{ margin: '8px 0 4px', fontSize: '1em' }}>
              {selectedProperty.UnparsedAddress || 'No address provided'}
            </h4>
            <p style={{ margin: '0', fontSize: '0.85em' }}>
              {selectedProperty.City}, {selectedProperty.StateOrProvince}{' '}
              {selectedProperty.PostalCode}
            </p>
            <p style={{ color: '#ea580c', margin: '4px 0', fontWeight: 'bold' }}>
              ₹{selectedProperty.ListPrice.toLocaleString('en-IN')}
            </p>
            <p style={{ fontSize: '0.8em', color: '#555', margin: '4px 0 0' }}>
              {selectedProperty.LivingArea.toLocaleString('en-IN')} sqft • {selectedProperty.PropertyType}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default Map;