

'use client'

import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 19.07283,
  lng: 72.88261,
};

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
  media?: Array<{
    url: string;
    type: string;
    order: number;
    description: string;
    isMain: boolean;
  }>;
  [key: string]: any;
  Latitude: number;
  Longitude: number;
  ShowMapLink: string;
}

export interface MapBounds {
  top_left: { lat: number; lng: number };
  bottom_right: { lat: number; lng: number };
}

export interface MapCenter {
  lat: number;
  lng: number;
}

interface MapProps {
  properties?: Property[];
  bounds?: MapBounds;
  center?: MapCenter;
  zoom?: number;
}

const Map = ({ properties = [], bounds, center, zoom }: MapProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Update map bounds when bounds prop changes
  useEffect(() => {
    if (mapRef.current && bounds) {
      const googleBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.bottom_right.lat, bounds.top_left.lng),
        new google.maps.LatLng(bounds.top_left.lat, bounds.bottom_right.lng)
      );
      mapRef.current.fitBounds(googleBounds);
    }
  }, [bounds]);

  // Update map center/zoom when they change
  useEffect(() => {
    if (mapRef.current && center && zoom) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    // If bounds are provided, fit to bounds immediately
    if (bounds) {
      const googleBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.bottom_right.lat, bounds.top_left.lng),
        new google.maps.LatLng(bounds.top_left.lat, bounds.bottom_right.lng)
      );
      map.fitBounds(googleBounds);
    }
  };

  if (!isLoaded) return <div>Loading map...</div>;

  const mapCenter = center || defaultCenter;
  const mapZoom = zoom || 11;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={mapZoom}
      onLoad={onMapLoad}
    >
      {properties.map((property) =>
        property.ShowMapLink === "true" ? (
          <Marker
            key={property.ListingId}
            position={{ lat: property.Latitude, lng: property.Longitude }}
            // icon={{
            //   url: '/icons/round-red-dot.png',
            //   scaledSize: new window.google.maps.Size(20, 20),
            // }}
            onClick={() => setSelectedProperty(property)}
            title={property.UnparsedAddress}
          />
        ) : null
      )}

      {selectedProperty && (
        <InfoWindow
          position={{
            lat: selectedProperty.Latitude,
            lng: selectedProperty.Longitude,
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
            <p style={{ color: 'red', margin: '4px 0', fontWeight: 'bold' }}>
              ${selectedProperty.ListPrice.toLocaleString()}
            </p>
            <p style={{ fontSize: '0.8em', color: '#555' }}>
              {selectedProperty.BedroomsTotal} BEDS &nbsp;&nbsp;
              {selectedProperty.Bathrooms} BATHS &nbsp;&nbsp;
              {selectedProperty.LivingArea.toLocaleString()} SF
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default Map;
