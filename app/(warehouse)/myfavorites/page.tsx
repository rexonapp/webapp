"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
interface Favorite {
  id: string;
  user_id: string;
  title: string;
  city: string;
  property_type: string;
  price_per_sqft: number;
  price_at_favorite: number;
  created_at: string;
  property_code: string;
}

export default function MyFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/leads/favorite/list")
      .then(res => res.json())
      .then(data => {
        console.log(data, "dataa");
        setFavorites(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);


  const handleRemoveFavorite = async (userId: string, propertyId: string) => {
    try {
      const res = await fetch(`/api/leads/favorite/removefavorite`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          property_id: propertyId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFavorites((prev: any[]) =>
          prev.filter(item => !(item.user_id === userId && item.id === propertyId))
        );
        toast.success("Removed from favorites");
      }
    } catch (err) {
      console.error("Failed to remove favorite", err);
      toast.error("Failed to remove favorite");
    }
  };
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {loading ? (
        <p>Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p>No favorite properties found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border">Title</th>
                <th className="p-3 border">City</th>
                <th className="p-3 border">Property Id</th>
                <th className="p-3 border">Property Details</th>
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Price</th>
                <th className="p-3 border">Favorited Price</th>
                <th className="p-3 border">Added On</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{item.title}</td>
                  <td className="p-3 border">{item.city}</td>
                  <td className="p-3 border">{item.property_code}</td>
                  <td className="p-3 border">
                    <Link
                      href={`${baseUrl}/property/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                      {/* {baseUrl}/property/{item.id} */}
                    </Link>
                  </td>
                  <td className="p-3 border">{item.property_type}</td>
                  <td className="p-3 border">₹ {item.price_per_sqft}</td>
                  <td className="p-3 border">
                    ₹ {item.price_at_favorite}
                  </td>
                  <td className="p-3 border">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 border relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === item.id ? null : item.id)
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === item.id && (
                      <div className="absolute right-3 mt-2 w-28 bg-white border rounded-md shadow-lg z-10">
                        <button
                          onClick={() => {
                            handleRemoveFavorite(item.user_id, item.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}