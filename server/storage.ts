import { users, rides, type User, type InsertUser, type Ride, type InsertRide } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getRidesByUserId(userId: number): Promise<Ride[]>;
  getRide(id: number): Promise<Ride | undefined>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRide(id: number, ride: InsertRide): Promise<Ride | undefined>;
  deleteRide(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rides: Map<number, Ride>;
  currentId: number;
  currentRideId: number;

  constructor() {
    this.users = new Map();
    this.rides = new Map();
    this.currentId = 1;
    this.currentRideId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async getRidesByUserId(userId: number): Promise<Ride[]> {
    return Array.from(this.rides.values()).filter(
      (ride) => ride.userId === userId
    );
  }

  async getRide(id: number): Promise<Ride | undefined> {
    return this.rides.get(id);
  }

  async createRide(ride: InsertRide): Promise<Ride> {
    const id = this.currentRideId++;
    const now = new Date();
    
    // Ensure all required fields have values
    const newRide: Ride = {
      ...ride,
      id,
      userId: ride.userId || null,
      title: ride.title,
      startTime: ride.startTime,
      endTime: ride.endTime || null,
      duration: ride.duration || null,
      distance: ride.distance || null,
      avgSpeed: ride.avgSpeed || null,
      maxSpeed: ride.maxSpeed || null,
      elevation: ride.elevation || null,
      totalElevationGain: ride.totalElevationGain || null,
      avgCadence: ride.avgCadence || null,
      maxCadence: ride.maxCadence || null,
      routeData: ride.routeData,
      isUploaded: ride.isUploaded || false,
      createdAt: now,
      updatedAt: now
    };
    
    this.rides.set(id, newRide);
    return newRide;
  }

  async updateRide(id: number, ride: InsertRide): Promise<Ride | undefined> {
    const existingRide = this.rides.get(id);
    if (!existingRide) {
      return undefined;
    }

    // Handle each field explicitly to ensure type safety
    const updatedRide: Ride = {
      ...existingRide,
      title: ride.title || existingRide.title,
      userId: ride.userId !== undefined ? ride.userId : existingRide.userId,
      startTime: ride.startTime || existingRide.startTime,
      endTime: ride.endTime !== undefined ? ride.endTime : existingRide.endTime,
      duration: ride.duration !== undefined ? ride.duration : existingRide.duration,
      distance: ride.distance !== undefined ? ride.distance : existingRide.distance,
      avgSpeed: ride.avgSpeed !== undefined ? ride.avgSpeed : existingRide.avgSpeed,
      maxSpeed: ride.maxSpeed !== undefined ? ride.maxSpeed : existingRide.maxSpeed,
      elevation: ride.elevation !== undefined ? ride.elevation : existingRide.elevation,
      totalElevationGain: ride.totalElevationGain !== undefined ? ride.totalElevationGain : existingRide.totalElevationGain,
      avgCadence: ride.avgCadence !== undefined ? ride.avgCadence : existingRide.avgCadence,
      maxCadence: ride.maxCadence !== undefined ? ride.maxCadence : existingRide.maxCadence,
      routeData: ride.routeData || existingRide.routeData,
      isUploaded: ride.isUploaded !== undefined ? ride.isUploaded : existingRide.isUploaded,
      id, // Preserve the ID
      createdAt: existingRide.createdAt, // Preserve creation date
      updatedAt: new Date() // Update the modification date
    };
    
    this.rides.set(id, updatedRide);
    return updatedRide;
  }

  async deleteRide(id: number): Promise<boolean> {
    const exists = this.rides.has(id);
    if (!exists) {
      return false;
    }
    
    this.rides.delete(id);
    return true;
  }
}

import { PgStorage } from './pgStorage';

// When DATABASE_URL is available, use PostgreSQL storage, otherwise fallback to in-memory
export const storage = process.env.DATABASE_URL ? new PgStorage() : new MemStorage();
