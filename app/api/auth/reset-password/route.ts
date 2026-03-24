// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

const secret = new TextEncoder().encode(process.env.RESET_TOKEN_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Verify JWT
    let payload: { sub?: string };
    try {
      const result = await jwtVerify(token, secret, { requiredClaims: ['sub', 'exp'] });
      payload = result.payload as { sub?: string };
    } catch {
      return NextResponse.json(
        { error: 'Reset link is invalid or has expired.' },
        { status: 401 }
      );
    }

    const userId = payload.sub;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }

    // Confirm user still exists and uses email auth
    const userResult = await query(
      `SELECT id, auth_provider FROM leads WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (!userResult.rows[0]) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    if (userResult.rows[0].auth_provider !== 'email') {
      return NextResponse.json(
        { error: 'This account does not use password authentication.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update password — updated_at tracks when it changed
    await query(
      `UPDATE leads SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [passwordHash, userId]
    );

    console.log('[Password Reset Success]', {
      userId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[Reset-password Error]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}