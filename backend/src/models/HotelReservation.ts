import { Schema, model, InferSchemaType } from "mongoose";

const hotelReservationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    rooms: { type: Number, required: true, default: 1, min: 1 },
    budgetPerRoom: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
  },
  { timestamps: true }
);

export type HotelReservation = InferSchemaType<typeof hotelReservationSchema>;
export const HotelReservationModel = model("HotelReservation", hotelReservationSchema);
