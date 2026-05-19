import { query } from "@/lib/db";

export async function notifyAgentOnFavorite(
    propertyId: string,
    userId: string,
    leadActivityId: string
  ): Promise<void> {
    try {
      // 1. Fetch the warehouse associated with this lead_activity
      const warehouseResult = await query(
        `SELECT w.id, w.user_id AS agent_id
         FROM warehouses w
         INNER JOIN lead_activity la ON la.property_id = w.id::text
         WHERE la.id = $1
         LIMIT 1`,
        [leadActivityId]
      );
  
      if (warehouseResult.rows.length === 0) {
        console.warn(
          `[notifyAgentOnFavorite] No warehouse found for leadActivityId="${leadActivityId}". Skipping.`
        );
        return;
      }
  
      const agentId = warehouseResult.rows[0].agent_id;
      const warehouseId = warehouseResult.rows[0].id;
  
      // 2. Fetch lead name and property/warehouse name
      const leadResult = await query(
        `SELECT first_name FROM leads WHERE id = $1 LIMIT 1`,
        [userId]
      );
      const leadName: string = leadResult.rows[0]?.first_name ?? "A lead";

      const propertyResult = await query(
        `SELECT title FROM warehouses WHERE id = $1 LIMIT 1`,
        [warehouseId]
      );
      const propertyName: string = propertyResult.rows[0]?.title ?? "A property";
  
      // 3. Insert notification with enhanced message
      await query(
        `INSERT INTO agent_notifications
           (agent_id, type, title, message, reference_id, reference_table, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
        [
          agentId,
          "favorite",
          "New Lead Added to Favorites",
          `${leadName} added property "${propertyName}" to their favorites.`,
          warehouseId,
          "warehouses",
        ]
      );
  
      console.log(
        `[notifyAgentOnFavorite] ✓ Sent → agent=${agentId}, lead=${leadName}, property=${propertyName}`
      );
    } catch (error) {
      console.error("[notifyAgentOnFavorite] Failed to send notification:", error);
    }
  }