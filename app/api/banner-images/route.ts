// app/api/banner-images/route.ts
import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSession } from '@/lib/session'; // Adjust path as needed

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'rexon-web';
const AWS_REGION = process.env.AWS_REGION || 'ap-south-2';
const BANNER_PREFIX = 'banners/';

// Initialize S3 Client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Helper function to construct proper S3 URL
function getS3Url(key: string): string {
  const url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
  return url;
}

export async function GET() {
  try {
    // Get user session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const userBannerPrefix = `${BANNER_PREFIX}${userId}/`;

    console.log(`Fetching banners for user ${userId} with prefix: ${userBannerPrefix}`);

    // Verify bucket access
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✓ Successfully connected to bucket: ${BUCKET_NAME} in region: ${AWS_REGION}`);
    } catch (bucketError: any) {
      console.error('Bucket access error:', bucketError);
      return NextResponse.json(
        {
          images: [],
          error: `Cannot access bucket: ${bucketError.message}`,
        },
        { status: 500 }
      );
    }

    // List objects in the user's banners folder
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: userBannerPrefix,
      MaxKeys: 50,
    });

    const response = await s3Client.send(command);

    console.log('S3 Response:', {
      bucket: BUCKET_NAME,
      region: AWS_REGION,
      prefix: userBannerPrefix,
      contentsCount: response.Contents?.length || 0,
      contents: response.Contents?.map(item => item.Key)
    });

    if (!response.Contents || response.Contents.length === 0) {
      return NextResponse.json({
        images: [],
        message: 'No banner images found',
        debug: {
          bucket: BUCKET_NAME,
          region: AWS_REGION,
          prefix: userBannerPrefix,
          userId,
        }
      });
    }

    // Filter for image files only and construct URLs
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const images = response.Contents
      .filter((item) => {
        const key = item.Key || '';
        return (
          key !== userBannerPrefix && // Exclude the folder itself
          imageExtensions.some((ext) => key.toLowerCase().endsWith(ext))
        );
      })
      .map((item) => {
        const s3Key = item.Key || '';
        const url = getS3Url(s3Key);
        console.log(`Image found: ${s3Key} -> ${url}`);
        return url;
      });

    console.log(`✓ Found ${images.length} banner images for user ${userId}`);

    return NextResponse.json({
      images,
      count: images.length,
      userId,
      debug: {
        bucket: BUCKET_NAME,
        region: AWS_REGION,
        prefix: userBannerPrefix,
        sampleUrl: images[0] || 'No images found',
      }
    });
  } catch (error: any) {
    console.error('Error fetching banner images from S3:', error);
    return NextResponse.json(
      {
        images: [],
        error: 'Failed to fetch banner images',
        details: error.message,
        errorName: error.name,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename with user-specific path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const s3Key = `${BANNER_PREFIX}${userId}/${filename}`;

    console.log(`Uploading file for user ${userId}: ${filename} to ${BUCKET_NAME}/${s3Key}`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3 with public-read ACL
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'original-name': file.name,
        'user-id': userId.toString(),
        'uploaded-by': session.email,
      }
    });

    try {
      await s3Client.send(uploadCommand);
      console.log(`✓ Successfully uploaded: ${s3Key}`);
    } catch (uploadError: any) {
      console.error('Upload error:', uploadError);
      
      // If ACL fails, try without ACL
      if (uploadError.name === 'AccessControlListNotSupported' || 
          uploadError.Code === 'AccessControlListNotSupported') {
        console.log('ACL not supported, retrying without ACL...');
        
        const retryCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: file.type,
          CacheControl: 'public, max-age=31536000',
          Metadata: {
            'uploaded-at': new Date().toISOString(),
            'original-name': file.name,
            'user-id': userId.toString(),
            'uploaded-by': session.email,
          }
        });
        
        await s3Client.send(retryCommand);
        console.log(`✓ Successfully uploaded without ACL: ${s3Key}`);
      } else {
        throw uploadError;
      }
    }

    // Construct the image URL
    const imageUrl = getS3Url(s3Key);

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Banner image uploaded successfully',
      key: s3Key,
      userId,
    });
  } catch (error: any) {
    console.error('Error uploading banner image:', error);
    
    let errorMessage = 'Failed to upload banner image';
    if (error.name === 'IllegalLocationConstraintException') {
      errorMessage = 'S3 bucket region mismatch. Please check your AWS_REGION environment variable.';
    } else if (error.name === 'AccessDenied') {
      errorMessage = 'Access denied. Check your S3 bucket permissions and AWS credentials.';
    } else if (error.name === 'NoSuchBucket') {
      errorMessage = `Bucket '${BUCKET_NAME}' does not exist in region '${AWS_REGION}'.`;
    } else if (error.Code === 'AccessControlListNotSupported') {
      errorMessage = 'Bucket does not support ACLs. Please add a bucket policy for public access.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message,
        errorName: error.name,
        bucket: BUCKET_NAME,
        region: AWS_REGION,
      },
      { status: 500 }
    );
  }
}