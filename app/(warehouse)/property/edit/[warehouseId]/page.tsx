'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader, AlertCircle } from 'lucide-react';
import WarehouseEditForm from './warehouseedit';

export default function EditWarehousePage() {
  const params = useParams();
  const router = useRouter();
  const warehouseId = params?.warehouseId as string;

  const [warehouseData, setWarehouseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!warehouseId) return;

    const fetchWarehouse = async () => {
      try {
        const res = await fetch(`/api/properties/${warehouseId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch property');
        setWarehouseData(data.property);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouse();
  }, [warehouseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader className="animate-spin h-10 w-10 text-orange-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
          <p className="text-gray-800 font-semibold text-lg mb-1">Property Not Found</p>
          <p className="text-gray-500 text-sm mb-4">{error || 'This property does not exist or you do not have permission to edit it.'}</p>
          <button
            onClick={() => router.push('/mylistings')}
            className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return <WarehouseEditForm warehouseId={warehouseId} initialData={warehouseData} />;
}