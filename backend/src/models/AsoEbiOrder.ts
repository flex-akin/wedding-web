import { Schema, model, InferSchemaType } from "mongoose";

const asoEbiOrderSchema = new Schema(
  {
    guestName: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    fabric: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paymentMethod: { type: String, enum: ["manual", "paystack"], required: true },
    paystackReference: { type: String, trim: true },
  },
  { timestamps: true }
);

export type AsoEbiOrder = InferSchemaType<typeof asoEbiOrderSchema>;
export const AsoEbiOrderModel = model("AsoEbiOrder", asoEbiOrderSchema);
