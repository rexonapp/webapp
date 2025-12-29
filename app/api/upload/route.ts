// api/properties/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import { randomBytes } from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = 'rexon-web';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const formData = await request.formData();
    
    // Basic Information
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const propertyType = formData.get('propertyType') as string;
    const totalArea = formData.get('totalArea') as string;
    const sizeUnit = formData.get('sizeUnit') as string || 'sqft';
    
    // Availability & Pricing
    const availableFrom = formData.get('availableFrom') as string;
    const listingType = formData.get('listingType') as string; // 'rent' or 'sale'
    const pricePerSqFt = formData.get('pricePerSqFt') as string;
    const totalPrice = formData.get('totalPrice') as string || null;
    
    // Location
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const pincode = formData.get('pincode') as string || null;
    const roadConnectivity = formData.get('roadConnectivity') as string || null;
    const latitude = formData.get('latitude') as string || null;
    const longitude = formData.get('longitude') as string || null;
    
    // Contact Information
    const contactPersonName = formData.get('contactPersonName') as string || '';
    const contactPersonPhone = formData.get('contactPersonPhone') as string || '';
    const contactPersonEmail = formData.get('contactPersonEmail') as string || '';
    const contactPersonDesignation = formData.get('contactPersonDesignation') as string || '';
    
    // Amenities (JSON array)
    const amenitiesStr = formData.get('amenities') as string;
    const amenities = amenitiesStr ? JSON.parse(amenitiesStr) : [];
    
    // Images
    const images = formData.getAll('images') as File[];

    // Validation
    if (!title || !propertyType || !totalArea || !availableFrom || !listingType || !pricePerSqFt || !address || !city || !state) {
      return NextResponse.json(
        { error: 'Please fill in all required fields: title, property type, total area, available from, listing type, price per sq.ft, address, city, and state' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one property image is required' },
        { status: 400 }
      );
    }

    // Validate image types and sizes
    for (const file of images) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Only images are allowed (JPG, PNG, GIF, WebP)` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Image ${file.name} exceeds 50MB limit` },
          { status: 400 }
        );
      }
    }

    // Map listingType to price_type for database
    const priceType = listingType === 'rent' ? 'Rent' : listingType === 'sale' ? 'Sale' : 'Lease';

    // Insert warehouse record
    const warehouseResult = await query(
      `INSERT INTO warehouses 
       (user_id, property_name, title, description, property_type, 
        space_available, space_unit, warehouse_size, available_from,
        price_type, price_per_sqft, 
        address, city, state, pincode, road_connectivity,
        contact_person_name, contact_person_phone, contact_person_email, contact_person_designation,
        latitude, longitude, amenities, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING id, property_name, title, address, city, created_at`,
      [
        userId, 
        title, // property_name
        title, // title (keeping both for backward compatibility)
        description, 
        propertyType,
        parseFloat(totalArea),
        sizeUnit,
        parseFloat(totalArea), // warehouse_size (keeping for backward compatibility)
        availableFrom,
        priceType,
        parseFloat(pricePerSqFt),
        address,
        city,
        state,
        pincode,
        roadConnectivity,
        contactPersonName,
        contactPersonPhone,
        contactPersonEmail,
        contactPersonDesignation,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        JSON.stringify(amenities),
        'Pending' // status
      ]
    );

    const warehouseId = warehouseResult.rows[0].id;

    // Upload images to S3 and save to database
    const uploadedImages = [];
    
    for (let index = 0; index < images.length; index++) {
      const file = images[index];
      const fileExtension = file.name.split('.').pop();
      const randomString = randomBytes(16).toString('hex');
      const uniqueFileName = `${Date.now()}-${randomString}.${fileExtension}`;
      
      const s3Key = `${userId}/warehouses/${warehouseId}/${uniqueFileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(uploadCommand);

      const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-2'}.amazonaws.com/${s3Key}`;

      // Insert into image_uploads table with new fields
      const uploadResult = await query(
        `INSERT INTO uploads 
         (user_id, warehouse_id, image_order, is_primary, file_name, file_type, file_size, s3_key, s3_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, file_name, s3_url, is_primary, image_order`,
        [
          userId, 
          warehouseId, 
          index, // image_order
          index === 0, // is_primary (first image is primary)
          file.name, 
          file.type, 
          file.size, 
          s3Key, 
          s3Url,
          'Active' // status
        ]
      );

      uploadedImages.push(uploadResult.rows[0]);
    }

    return NextResponse.json({
      success: true,
      propertyId: warehouseId,
      warehouse: warehouseResult.rows[0],
      images: uploadedImages,
      message: 'Property listed successfully',
    });

  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create property listing. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's properties
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const warehousesResult = await query(
      `SELECT id, property_name, title, description, property_type,
              space_available, space_unit, warehouse_size, available_from,
              price_type, price_per_sqft,
              address, city, state, pincode, road_connectivity,
              contact_person_name, contact_person_phone, contact_person_email, contact_person_designation,
              latitude, longitude, amenities,
              is_verified, is_featured, status, created_at, updated_at
       FROM warehouses
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [session.userId]
    );

    const warehouses = await Promise.all(
      warehousesResult.rows.map(async (warehouse) => {
        const imagesResult = await query(
          `SELECT id, file_name, file_type, file_size, s3_url, is_primary, image_order, created_at
           FROM uploads
           WHERE warehouse_id = $1 AND status = 'Active'
           ORDER BY image_order ASC, created_at ASC`,
          [warehouse.id]
        );

        return {
          ...warehouse,
          amenities: warehouse.amenities ? JSON.parse(warehouse.amenities) : [],
          images: imagesResult.rows,
        };
      })
    );

    return NextResponse.json({
      success: true,
      properties: warehouses,
    });

  } catch (error) {
    console.error('Get properties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}