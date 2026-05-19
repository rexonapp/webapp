import { NextRequest, NextResponse } from 'next/server';
import db  from '@/lib/db'; // ← adjust path if your pool export differs

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const limit  = Math.min(parseInt(searchParams.get('limit')  || '10'), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'),  0);
    const status = searchParams.get('status') || null;  // e.g. "active"
    const city   = searchParams.get('city')   || null;
    const state  = searchParams.get('state')  || null;

    // ── Build WHERE clause dynamically ────────────────────────────────────────
    const conditions: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }
    if (city) {
      conditions.push(`LOWER(city) = LOWER($${idx++})`);
      values.push(city);
    }
    if (state) {
      conditions.push(`LOWER(state) = LOWER($${idx++})`);
      values.push(state);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // ── Main query ─────────────────────────────────────────────────────────────
    const agentsQuery = `
      SELECT
        id,
        full_name,
        email,
        mobile_number,
        city,
        state,
        pincode,
        agency_name,
        profile_photo_s3_url,
        bio,
        languages_spoken,
        is_verified,
        status,
        whatsapp_number,
        created_at
      FROM agents
      ${where}
      ORDER BY is_verified DESC, created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    // ── Count query (reuses same WHERE, no limit/offset) ──────────────────────
    const countQuery = `SELECT COUNT(*)::int AS total FROM agents ${where}`;

    // Run both queries in parallel
    const [agentsResult, countResult] = await Promise.all([
      db.query(agentsQuery, [...values, limit, offset]),
      db.query(countQuery, values),
    ]);

    const agents = agentsResult.rows;
    const total  = countResult.rows[0]?.total ?? 0;

    return NextResponse.json(
      {
        agents,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/agents] Error:', error?.message ?? error);
    return NextResponse.json(
      { error: 'Failed to fetch agents. Please try again later.' },
      { status: 500 }
    );
  }
}