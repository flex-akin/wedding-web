import { Schema, model, InferSchemaType } from "mongoose";

const wishSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type Wish = InferSchemaType<typeof wishSchema>;
export const WishModel = model("Wish", wishSchema);
