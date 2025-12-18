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

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
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
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const warehouseSize = formData.get('warehouseSize') as string || '';
    const address = formData.get('address') as string;
    
    const contactPersonName = formData.get('contactPersonName') as string || '';
    const contactPersonPhone = formData.get('contactPersonPhone') as string || '';
    const contactPersonDesignation = formData.get('contactPersonDesignation') as string || '';
    const contactPersonRelation = formData.get('contactPersonRelation') as string || '';
    
    const latitude = formData.get('latitude') as string || null;
    const longitude = formData.get('longitude') as string || null;
    
    const files = formData.getAll('files') as File[];

    if (!title || !address) {
      return NextResponse.json(
        { error: 'Title and address are required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required' },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Allowed: images, videos, CSV, XLSX, PDF` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 50MB limit` },
          { status: 400 }
        );
      }
    }

    const warehouseResult = await query(
      `INSERT INTO warehouses 
       (user_id, title, description, warehouse_size, address, 
        contact_person_name, contact_person_phone, contact_person_designation, contact_person_relation,
        latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, address, created_at`,
      [
        userId, 
        title, 
        description, 
        warehouseSize, 
        address,
        contactPersonName,
        contactPersonPhone,
        contactPersonDesignation,
        contactPersonRelation,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null
      ]
    );

    const warehouseId = warehouseResult.rows[0].id;

    const uploadedFiles = [];
    
    for (const file of files) {
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

      const uploadResult = await query(
        `INSERT INTO uploads (user_id, warehouse_id, file_name, file_type, file_size, s3_key, s3_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, file_name, s3_url`,
        [userId, warehouseId, file.name, file.type, file.size, s3Key, s3Url]
      );

      uploadedFiles.push(uploadResult.rows[0]);
    }

    return NextResponse.json({
      success: true,
      warehouse: warehouseResult.rows[0],
      uploads: uploadedFiles,
      message: 'Warehouse and files uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

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
      `SELECT id, title, description, warehouse_size, address,
              contact_person_name, contact_person_phone, contact_person_designation, contact_person_relation,
              latitude, longitude, created_at
       FROM warehouses
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [session.userId]
    );

    const warehouses = await Promise.all(
      warehousesResult.rows.map(async (warehouse) => {
        const uploadsResult = await query(
          `SELECT id, file_name, file_type, file_size, s3_url, created_at
           FROM uploads
           WHERE warehouse_id = $1
           ORDER BY created_at DESC`,
          [warehouse.id]
        );

        return {
          ...warehouse,
          uploads: uploadsResult.rows,
        };
      })
    );

    return NextResponse.json({
      success: true,
      warehouses,
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}