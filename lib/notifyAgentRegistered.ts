import { query } from '@/lib/db';

export async function notifyAgentRegistered({
  newAgentId,
  fullName,
  email,
  agencyName,
  city,
  initialStatus,
}: {
  newAgentId: string;   // UUID of the newly registered agent
  fullName: string;
  email: string;
  agencyName?: string;
  city?: string;
  initialStatus: string;
}): Promise<void> {
  const superAdminResult = await query(`SELECT id FROM superadmin_users`);
  if (superAdminResult.rows.length === 0) return;

  const notificationTitle = 'New Agent Registered';

  const agencyPart = agencyName ? ` (${agencyName})` : '';
  const cityPart   = city       ? ` from ${city}`     : '';
  const statusPart = initialStatus === 'approved'
    ? 'auto-approved and is now active'
    : 'pending your review and approval';

  const message =
    `New agent "${fullName}"${agencyPart}${cityPart} has registered with email ${email}. ` +
    `Their account is ${statusPart}.`;

  const values: unknown[] = [];
  const placeholders = superAdminResult.rows.map((row, i) => {
    const base = i * 5;
    values.push(
      row.id,             // $1 superadmin_id  ← correct column for this table
      'agent_registered', // $2 type
      notificationTitle,  // $3 title
      message,            // $4 message
      newAgentId,         // $5 reference_id   ← UUID of the new agent
    );
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, 'agents', false, NOW())`;
  });

  await query(
    `INSERT INTO superadmin_notifications
       (superadmin_id, type, title, message, reference_id, reference_table, is_read, created_at)
     VALUES ${placeholders.join(', ')}`,
    values
  );
}