import { pgTable, text, serial, integer, boolean, timestamp, json, real, varchar, doublePrecision, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Ride table to store individual ride data
export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  distance: doublePrecision("distance"), // in kilometers
  avgSpeed: doublePrecision("avg_speed"), // in km/h
  maxSpeed: doublePrecision("max_speed"), // in km/h
  elevation: integer("elevation"), // in meters
  totalElevationGain: integer("total_elevation_gain"), // total elevation gain in meters
  avgCadence: integer("avg_cadence"), // average cadence in rpm
  maxCadence: integer("max_cadence"), // maximum cadence in rpm
  routeData: json("route_data").notNull(), // GPS points and other data
  isUploaded: boolean("is_uploaded").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("user_id_idx").on(table.userId),
    startTimeIdx: index("start_time_idx").on(table.startTime),
  }
});

// Ride point (GPS coordinates)
export type GPSPoint = {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp: number;
  speed?: number;
  cadence?: number;
};

export type RouteData = {
  points: GPSPoint[];
  stats: {
    topSpeed: number;
    avgCadence: number;
    maxCadence: number;
    totalElevationGain: number;
  };
};

// Insert schemas (for validation)
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRideSchema = createInsertSchema(rides).pick({
  userId: true,
  title: true,
  startTime: true,
  endTime: true,
  duration: true,
  distance: true,
  avgSpeed: true,
  maxSpeed: true,
  elevation: true,
  totalElevationGain: true,
  avgCadence: true,
  maxCadence: true,
  routeData: true,
  isUploaded: true,
});

// Define inferred types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof rides.$inferSelect;

// Current ride data type (used during active tracking)
export type CurrentRideData = {
  isActive: boolean;
  isPaused: boolean;
  startTime: Date;
  currentTime: Date;
  elapsedTime: number; // in seconds (excluding paused time)
  pausedTime: number; // total time spent paused
  distance: number; // in kilometers
  currentSpeed: number; // in km/h
  avgSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  currentCadence: number; // in rpm (simulated in MVP)
  avgCadence: number; // in rpm
  maxCadence: number; // in rpm
  elevation: number; // current elevation in meters
  elevationGain: number; // total elevation gain in meters
  routePoints: GPSPoint[]; // GPS track points
};
