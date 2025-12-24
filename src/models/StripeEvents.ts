import Stripe from 'stripe';
import { database } from '../lib/db';

export interface StripeEventAttribute {
  event_id: string;
  event_type: Stripe.Event.Type;
  payload: Stripe.Event.Data.Object;
  received_at: Date;
}

export class StripeEvent {
  static tableName = 'stripe_events';

  static async create(event: StripeEventAttribute) {
    const query = `
      INSERT INTO ${this.tableName} (event_id, event_type, payload, received_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (event_id) DO NOTHING
      RETURNING *;
    `;
    const params = [event.event_id, event.event_type, JSON.stringify(event.payload), event.received_at];
    const result = await database.query(query, params);
    return result.rows[0] as StripeEventAttribute;
  }

  static async findById(eventId: string): Promise<StripeEventAttribute | null> {
    const query = `
      SELECT * FROM ${this.tableName} WHERE event_id = $1
    `;
    const result = await database.query(query, [eventId]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as StripeEventAttribute;
  }
}