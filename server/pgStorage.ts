import { IStorage } from './storage';
import { db } from './db';
import { User, Ride, InsertUser, InsertRide, users, rides } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { log } from './vite';

/**
 * PostgreSQL based storage implementation
 */
export class PgStorage implements IStorage {
  constructor() {
    log('Initializing PostgreSQL storage...', 'pgStorage');
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async getRidesByUserId(userId: number): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.userId, userId))
      .orderBy(rides.startTime);
  }

  async getRide(id: number): Promise<Ride | undefined> {
    const results = await db.select().from(rides).where(eq(rides.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    // Ensure required fields have default values
    const rideWithDefaults = {
      ...insertRide,
      totalElevationGain: insertRide.totalElevationGain || 0,
      avgCadence: insertRide.avgCadence || 0,
      maxCadence: insertRide.maxCadence || 0,
      updatedAt: new Date()
    };

    const result = await db.insert(rides).values(rideWithDefaults).returning();
    return result[0];
  }

  async updateRide(id: number, ride: InsertRide): Promise<Ride | undefined> {
    // Ensure required fields have default values
    const rideWithDefaults = {
      ...ride,
      totalElevationGain: ride.totalElevationGain || 0,
      avgCadence: ride.avgCadence || 0,
      maxCadence: ride.maxCadence || 0,
      updatedAt: new Date()
    };

    const result = await db.update(rides)
      .set(rideWithDefaults)
      .where(eq(rides.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteRide(id: number): Promise<boolean> {
    const result = await db.delete(rides).where(eq(rides.id, id)).returning();
    return result.length > 0;
  }
}

// Create and export an instance of the PostgreSQL storage
export const pgStorage = new PgStorage();