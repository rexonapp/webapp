import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/session';
import { query } from "@/lib/db";
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ warehouseId: string }> }
) {
    const session = await getSession();
    const { warehouseId } = await params;

    if (!session) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    //   console.log(session, "adfsjkdfks");
    //   console.log("Property ID:", warehouseId);
    const leadResult = await query(
        `SELECT
            id,
            first_name,
            last_name,
            email,
            phone
         FROM leads
         WHERE email = $1`,
        [session.email]
    );

    if (leadResult.rows.length === 0) {
        return NextResponse.json(
            { success: false, message: "Lead not found" },
            { status: 404 }
        );
    }

    const lead = leadResult.rows[0];

    const propertyResult = await query(
        `SELECT
            id,
            title,
            property_name,
            property_code,
            agent_id,
            user_id
         FROM warehouses
         WHERE id = $1`,
        [warehouseId]
    );

    if (propertyResult.rows.length === 0) {
        return NextResponse.json(
            { success: false, message: "Property not found" },
            { status: 404 }
        );
    }

    const property = propertyResult.rows[0];

    const agentResult = await query(
        `SELECT
            id,
            full_name,
            email
         FROM agents
         WHERE id = $1`,
        [property.user_id]
    );

    if (agentResult.rows.length === 0) {
        return NextResponse.json(
            { success: false, message: "Agent not found" },
            { status: 404 }
        );
    }

    const agent = agentResult.rows[0];

    // console.log("Lead:", lead);
    // console.log("Property:", property);
    // console.log("Agent:", agent);

    const enquiryResult = await query(
        `INSERT INTO property_enquiries (
            property_id,
            agent_id,
            lead_id,
            lead_name,
            lead_email,
            lead_phone
         )
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [
            property.id,
            agent.id,
            lead.id,
            `${lead.first_name} ${lead.last_name}`,
            lead.email,
            lead.phone,
        ]
    );
    const enquiry = enquiryResult.rows[0];

    // console.log("Enquiry:", enquiry);
    await query(
        `INSERT INTO agent_notifications (
        agent_id,
        lead_name,
        type,
        title,
        message,
        reference_id,
        reference_table,
        is_read
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
            agent.id,
            `${lead.first_name} ${lead.last_name}`,
            "property_enquiry",
            "New Property Enquiry",
            `${lead.first_name} ${lead.last_name} is interested in "${property.property_name}".`,
            enquiry.id,
            "property_enquiries",
            false,
        ]
    );

    console.log("Notification created");
    return NextResponse.json({
        success: true,
        message: "Agent notified successfully",
    });
}