// types/property.types.ts
// Shared property types to avoid conflicts between components

export interface PropertyImage {
    id?: number;
    file_name?: string;
    file_type?: string;
    s3_url: string;
    is_primary?: boolean;
    image_order?: number;
    url?: string;
    type?: string;
    order?: number;
    description?: string;
    isMain?: boolean;
  }
  
  // Database property structure
  export interface DatabaseProperty {
    id: number;
    property_name: string;
    title: string;
    description: string;
    property_type: string;
    space_available: number;
    space_unit: string;
    warehouse_size: number;
    available_from: string;
    price_type: string;
    price_per_sqft: number;
    address: string;
    city: string;
    state: string;
    pincode: string;
    road_connectivity: string;
    contact_person_name: string;
    contact_person_phone: string;
    contact_person_email: string;
    latitude: number;
    longitude: number;
    amenities: string[];
    is_verified: boolean;
    is_featured: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    images?: PropertyImage[];
    distance?: number;
  }
  
  // Map property structure
  export interface MapProperty {
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
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }
  
  export interface MapCenter {
    lat: number;
    lng: number;
  }
  
  export interface City {
    id?: string;
    city: string;
    stateCode?: string;
    latitude?: number;
    longitude?: number;
  }
  
  // Utility function to convert DatabaseProperty to MapProperty
  export function convertToMapProperty(property: DatabaseProperty): MapProperty {
    return {
      ListingId: property.id.toString(),
      ListPrice: property.price_per_sqft * property.space_available,
      BedroomsTotal: 0,
      Bathrooms: 0,
      LivingArea: property.space_available,
      PropertyType: property.property_type,
      City: property.city,
      StateOrProvince: property.state,
      PostalCode: property.pincode,
      UnparsedAddress: property.address,
      ListAgentFullName: property.contact_person_name,
      PublicRemarks: property.description,
      Latitude: property.latitude,
      Longitude: property.longitude,
      ShowMapLink: "true",
      media: property.images?.map((img, idx) => ({
        url: img.s3_url,
        s3_url: img.s3_url,
        type: 'image',
        order: idx,
        description: property.title,
        isMain: img.is_primary || false,
        is_primary: img.is_primary
      }))
    };
  }