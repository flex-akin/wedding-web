import { Router } from "express";
import { HotelReservationModel } from "../models/HotelReservation";
import { requireAdmin } from "../middleware/requireAdmin";

export const hotelReservationsRouter = Router();

// Public: submit a reservation request
hotelReservationsRouter.post("/", async (req, res) => {
  const { name, contact, checkIn, checkOut, rooms, budgetPerRoom, notes } = req.body as {
    name?: string;
    contact?: string;
    checkIn?: string;
    checkOut?: string;
    rooms?: number;
    budgetPerRoom?: string;
    notes?: string;
  };

  if (!name?.trim() || !contact?.trim() || !checkIn || !checkOut || !budgetPerRoom?.trim()) {
    return res.status(400).json({ error: "name, contact, checkIn, checkOut, and budgetPerRoom are required" });
  }

  const reservation = await HotelReservationModel.create({
    name: name.trim(),
    contact: contact.trim(),
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    rooms: rooms && rooms > 0 ? rooms : 1,
    budgetPerRoom: budgetPerRoom.trim(),
    notes,
  });
  res.status(201).json(reservation);
});

// Admin: list all reservations
hotelReservationsRouter.get("/", requireAdmin, async (_req, res) => {
  const reservations = await HotelReservationModel.find().sort({ createdAt: -1 });
  res.json(reservations);
});

// Admin: update status
hotelReservationsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const reservation = await HotelReservationModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!reservation) return res.status(404).json({ error: "Reservation not found" });
  res.json(reservation);
});
