import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRideSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user rides
  app.get("/api/rides", async (req, res) => {
    try {
      const userId = req.query.userId;
      
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const rides = await storage.getRidesByUserId(parseInt(userId));
      return res.json(rides);
    } catch (error) {
      console.error("Error fetching rides:", error);
      return res.status(500).json({ message: "Failed to fetch rides" });
    }
  });

  // Get a single ride
  app.get("/api/rides/:id", async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      
      if (isNaN(rideId)) {
        return res.status(400).json({ message: "Invalid ride ID" });
      }
      
      const ride = await storage.getRide(rideId);
      
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      return res.json(ride);
    } catch (error) {
      console.error("Error fetching ride:", error);
      return res.status(500).json({ message: "Failed to fetch ride" });
    }
  });

  // Create a new ride
  app.post("/api/rides", async (req, res) => {
    try {
      const validatedData = insertRideSchema.parse(req.body);
      const newRide = await storage.createRide(validatedData);
      return res.status(201).json(newRide);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ride data", errors: error.errors });
      }
      console.error("Error creating ride:", error);
      return res.status(500).json({ message: "Failed to create ride" });
    }
  });

  // Update a ride (e.g., when syncing from offline storage)
  app.put("/api/rides/:id", async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      
      if (isNaN(rideId)) {
        return res.status(400).json({ message: "Invalid ride ID" });
      }
      
      const validatedData = insertRideSchema.parse(req.body);
      const updatedRide = await storage.updateRide(rideId, validatedData);
      
      if (!updatedRide) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      return res.json(updatedRide);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ride data", errors: error.errors });
      }
      console.error("Error updating ride:", error);
      return res.status(500).json({ message: "Failed to update ride" });
    }
  });

  // Delete a ride
  app.delete("/api/rides/:id", async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      
      if (isNaN(rideId)) {
        return res.status(400).json({ message: "Invalid ride ID" });
      }
      
      const success = await storage.deleteRide(rideId);
      
      if (!success) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting ride:", error);
      return res.status(500).json({ message: "Failed to delete ride" });
    }
  });

  // User registration
  app.post("/api/users", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser({ username, password });
      return res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
