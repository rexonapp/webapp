import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { warehouseId: string } }
) {
  try {
    const { warehouseId } = await params;

    // Fetch property basic details
    const propertyResult = await query(
      `SELECT id,
              title,
              description,
              property_type,
              space_available,
              warehouse_size,
              price_type,
              price_per_sqft,
              city,
              state,
              address,
              latitude,
              longitude,
              is_verified,
              is_featured,
              created_at
       FROM warehouses
       WHERE id = $1`,
      [warehouseId]
    );

    if (propertyResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const property = propertyResult.rows[0];

    // Fetch media
    const mediaResult = await query(
      `SELECT id,
              s3_url,
              file_type,
              image_order
       FROM uploads
       WHERE warehouse_id = $1
       ORDER BY image_order ASC`,
      [warehouseId]
    );

    return NextResponse.json({
      success: true,
      property,
      media: mediaResult.rows,
    });

  } catch (error) {
    console.error("Public property fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}
