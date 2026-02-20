// app/api/warehouse/search-by-bounds/route.ts
// Place this file at: app/api/warehouse/search-by-bounds/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get bounds parameters
    const ne_lat = searchParams.get('ne_lat');
    const ne_lng = searchParams.get('ne_lng');
    const sw_lat = searchParams.get('sw_lat');
    const sw_lng = searchParams.get('sw_lng');
    const propertyType = searchParams.get('type');

    // Validate required parameters
    if (!ne_lat || !ne_lng || !sw_lat || !sw_lng) {
      return NextResponse.json(
        { success: false, error: 'Missing required bounds parameters' },
        { status: 400 }
      );
    }

    // Parse coordinates
    const neLat = parseFloat(ne_lat);
    const neLng = parseFloat(ne_lng);
    const swLat = parseFloat(sw_lat);
    const swLng = parseFloat(sw_lng);

    // Validate coordinates
    if (isNaN(neLat) || isNaN(neLng) || isNaN(swLat) || isNaN(swLng)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinate values' },
        { status: 400 }
      );
    }

    // Build SQL query - UPDATE THIS TO MATCH YOUR DATABASE SETUP
    let query = `
      SELECT 
        w.*,
        json_agg(
          json_build_object(
            'id', wi.id,
            'file_name', wi.file_name,
            'file_type', wi.file_type,
            's3_url', wi.s3_url,
            'is_primary', wi.is_primary,
            'image_order', wi.image_order
          ) ORDER BY wi.image_order, wi.is_primary DESC
        ) FILTER (WHERE wi.id IS NOT NULL) as images
      FROM warehouses w
      LEFT JOIN warehouse_images wi ON w.id = wi.warehouse_id
      WHERE w.latitude BETWEEN $1 AND $2
        AND w.longitude BETWEEN $3 AND $4
        AND w.status = 'active'
    `;

    const queryParams: any[] = [swLat, neLat, swLng, neLng];

    // Add property type filter if provided
    if (propertyType) {
      query += ` AND w.property_type = $${queryParams.length + 1}`;
      queryParams.push(propertyType);
    }

    query += ` GROUP BY w.id ORDER BY w.created_at DESC LIMIT 500`;

    // Execute query - UPDATE THIS TO USE YOUR DATABASE CONNECTION
    // Example using pg (PostgreSQL):
    /*
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const result = await pool.query(query, queryParams);
    const properties = result.rows;
    */

    // For now, return mock data structure - REPLACE THIS WITH ACTUAL DATABASE CALL
    const properties: any[] = []; // Your actual database query results go here

    return NextResponse.json({
      success: true,
      properties,
      count: properties.length,
      bounds: {
        ne: { lat: neLat, lng: neLng },
        sw: { lat: swLat, lng: swLng }
      }
    });

  } catch (error) {
    console.error('Error searching properties by bounds:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}