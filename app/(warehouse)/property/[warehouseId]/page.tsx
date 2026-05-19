import BackButton from "@/components/ui/BackButton";
import Image from "next/image";
import { Share2 } from "lucide-react";
import PropertyHeader from "@/components/ui/PropertyHeader";
async function getProperty(warehouseId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/public-property/${warehouseId}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  return res.json();
}


export default async function PropertyPage({    
  params,
}: {
  params: Promise<{ warehouseId: string }>;
}) {
  const { warehouseId } = await params;

  const data = await getProperty(warehouseId);

  if (!data) {
    return (
      <div className="p-20 text-center text-xl font-semibold">
        Property not found
      </div>
    );
  }

  const { property, media } = data;

  const images = media?.filter((m: any) =>
    m.file_type?.startsWith("image/")
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
     <PropertyHeader
    propertyId={warehouseId}
    title={property.title}
  />
      {/* 🔹 Image Gallery */}
      {images?.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-10">
          {/* Main Image */}
          <div className="col-span-4 md:col-span-2 relative h-[400px] rounded-xl overflow-hidden">
            <Image
              src={images[0].s3_url}
              alt="Property"
              fill
              className="object-cover"
            />
          </div>

          {/* Thumbnails */}
          <div className="col-span-4 md:col-span-2 grid grid-cols-2 gap-4">
            {images.slice(1, 5).map((img: any) => (
              <div
                key={img.id}
                className="relative h-[190px] rounded-xl overflow-hidden"
              >
                <Image
                  src={img.s3_url}
                  alt="Property"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 Title & Badges */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">
          {property.title}
        </h1>

        <div className="flex gap-2">
          {property.is_verified && (
            <span className="bg-green-600 text-white px-3 py-1 text-sm rounded-full">
              Verified
            </span>
          )}

          {property.is_featured && (
            <span className="bg-yellow-500 text-white px-3 py-1 text-sm rounded-full">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* 🔹 Location */}
      <p className="text-gray-500 mb-6">
        {property.address}, {property.city}, {property.state}
      </p>

      {/* 🔹 Price Section */}
      <div className="bg-[#13a8b4]/10 border border-[#13a8b4]/20 rounded-xl p-6 mb-8">
        <p className="text-sm text-gray-500 mb-1">
          {property.price_type}
        </p>
        <h2 className="text-2xl font-bold text-[#0f8a94]">
          ₹ {Number(property.price_per_sqft).toLocaleString()} / sqft
        </h2>
      </div>

      {/* 🔹 Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl mb-6">
        <div>
          <p className="text-sm text-gray-500">Property Type</p>
          <p className="font-semibold">{property.property_type}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Available Space</p>
          <p className="font-semibold">
            {property.space_available} sqft
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Warehouse Size</p>
          <p className="font-semibold">
            {property.warehouse_size} sqft
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Listed On</p>
          <p className="font-semibold">
            {new Date(property.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-xl font-semibold mb-3">
          Amenities
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {property.amenities.map((a: any, idx: any) => (
            <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-600 text-sm font-semibold px-3 py-1 rounded-full"
            >{a}</span>
          ))}
        </div>
      </div>
      {/* 🔹 Description */}
      <div className="mt-5">
        <h3 className="text-xl font-semibold mb-3">
          Description
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {property.description}
        </p>
      </div>

      {/* 🔹 Map Section */}
      {property.latitude && property.longitude && (
        <div>
          <h3 className="text-xl font-semibold mb-4 mt-10">
            Location Map
          </h3>

          <iframe
            width="100%"
            height="350"
            className="rounded-xl border"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
          ></iframe>
        </div>
      )}
    </div>
  );
}
