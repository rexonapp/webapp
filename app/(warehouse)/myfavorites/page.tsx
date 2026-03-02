"use client";

import { useEffect, useState } from "react";

export default function MyFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch("/api/leads/favorite/list")
      .then(res => res.json())
      .then(data => setFavorites(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {favorites.length === 0 ? (
        <p>No favorite properties found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border">Title</th>
                <th className="p-3 border">City</th>
                <th className="p-3 border">Property Id</th>
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Price</th>
                <th className="p-3 border">Favorited Price</th>
                <th className="p-3 border">Added On</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{item.title}</td>
                  <td className="p-3 border">{item.city}</td>
                  <td className="p-3 border">{item.id}</td>
                  <td className="p-3 border">{item.property_type}</td>
                  <td className="p-3 border">₹ {item.price_per_sqft}</td>
                  <td className="p-3 border">
                    ₹ {item.price_at_favorite}
                  </td>
                  <td className="p-3 border">
                    {new Date(item.created_at).toLocaleDateString()}
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
