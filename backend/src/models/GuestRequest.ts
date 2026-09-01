import { Schema, model, InferSchemaType } from "mongoose";

const guestRequestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    guestId: { type: Schema.Types.ObjectId, ref: "Guest" },
  },
  { timestamps: true }
);

export type GuestRequest = InferSchemaType<typeof guestRequestSchema>;
export const GuestRequestModel = model("GuestRequest", guestRequestSchema);
