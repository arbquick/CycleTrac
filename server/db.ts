import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { log } from './vite';

// Configure neon to use HTTP
neonConfig.fetchConnectionCache = true;

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL as string;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

// Create a SQL client
const sql = neon(databaseUrl);

// Export the drizzle client
export const db = drizzle(sql);

// Function to test the database connection
export async function testDatabaseConnection() {
  try {
    log('Testing database connection...', 'db');
    const result = await sql`SELECT NOW()`;
    log(`Database connection successful: ${result[0].now}`, 'db');
    return true;
  } catch (error) {
    log(`Database connection error: ${error}`, 'db');
    return false;
  }
}