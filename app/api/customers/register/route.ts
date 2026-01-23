// api/customers/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const formData = await request.formData();

    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const mobileNumber = formData.get('mobileNumber') as string;
    const city = formData.get('city') as string;
    const completeAddress = formData.get('completeAddress') as string;

    // Validation
    if (!fullName || !mobileNumber || !email || !completeAddress || !city) {
      return NextResponse.json(
        { error: 'Please fill in all required fields: full name, mobile number, email, complete address, and city' },
        { status: 400 }
      );
    }

    // Validate phone number format (Indian mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobileNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingEmail = await query(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: 'This email is already registered as a customer' },
        { status: 400 }
      );
    }

    // Check if mobile number is already registered
    const existingMobile = await query(
      'SELECT id FROM customers WHERE mobile_number = $1',
      [mobileNumber]
    );

    if (existingMobile.rows.length > 0) {
      return NextResponse.json(
        { error: 'This mobile number is already registered as a customer' },
        { status: 400 }
      );
    }

    // Insert customer record
    const customerResult = await query(
      `INSERT INTO customers
       (user_id, full_name, email, mobile_number, city, complete_address, status, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, full_name, email, mobile_number, city, status, created_at`,
      [
        userId,
        fullName,
        email,
        mobileNumber,
        city,
        completeAddress,
        'Active', // status
        true // is_active
      ]
    );

    return NextResponse.json({
      success: true,
      customer: customerResult.rows[0],
      message: 'Customer registration completed successfully. Welcome aboard!',
    });

  } catch (error) {
    console.error('Customer registration error:', error);

    // Check for unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 400 }
        );
      }
      if (error.message.includes('mobile_number')) {
        return NextResponse.json(
          { error: 'This mobile number is already registered' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch customer profile
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customerResult = await query(
      `SELECT id, user_id, full_name, email, mobile_number, city, complete_address,
              status, is_active, created_at, updated_at
       FROM customers
       WHERE user_id = $1`,
      [session.userId]
    );

    if (customerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: customerResult.rows[0],
    });

  } catch (error) {
    console.error('Get customer profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer profile' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update customer profile
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'full_name', 'mobile_number', 'city', 'complete_address'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(session.userId);

    const updateQuery = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING id, full_name, email, city, updated_at
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: result.rows[0],
      message: 'Customer profile updated successfully',
    });

  } catch (error) {
    console.error('Update customer profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer profile' },
      { status: 500 }
    );
  }
}
