import { Schema, model, InferSchemaType } from "mongoose";

const plusOneSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const guestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    partySize: { type: Number, required: true, default: 1, min: 1 },
    phone: { type: String, trim: true, index: true },
    email: { type: String, trim: true },
    rsvpStatus: {
      type: String,
      enum: ["pending", "attending", "declined"],
      default: "pending",
    },
    mealChoice: { type: String, trim: true },
    plusOnes: { type: [plusOneSchema], default: [] },
    notes: { type: String, trim: true },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

export type Guest = InferSchemaType<typeof guestSchema>;
export const GuestModel = model("Guest", guestSchema);
