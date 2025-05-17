import { db } from './db';
import { users, rides } from '@shared/schema';
import { log } from './vite';

/**
 * Push schema to the database
 * This is a simplified synchronization script for development
 */
export async function synchronizeSchema() {
  try {
    log('Synchronizing database schema...', 'db');
    
    // Create the schema
    const createUsersSchema = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    
    const createRidesSchema = `
      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ,
        duration INTEGER,
        distance DOUBLE PRECISION,
        avg_speed DOUBLE PRECISION,
        max_speed DOUBLE PRECISION,
        elevation INTEGER,
        total_elevation_gain INTEGER,
        avg_cadence INTEGER,
        max_cadence INTEGER,
        route_data JSONB NOT NULL,
        is_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS user_id_idx ON rides(user_id);
      CREATE INDEX IF NOT EXISTS start_time_idx ON rides(start_time);
    `;
    
    // Execute the schema creation
    await db.execute(createUsersSchema);
    await db.execute(createRidesSchema);
    
    log('Database schema synchronized successfully!', 'db');
    return true;
  } catch (error) {
    log(`Error synchronizing schema: ${error}`, 'db');
    return false;
  }
}