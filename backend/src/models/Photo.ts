import { Schema, model, InferSchemaType } from "mongoose";

const photoSchema = new Schema(
  {
    url: { type: String, required: true },
    uploadedBy: { type: String, trim: true },
    approved: { type: Boolean, default: true },
    likedBy: { type: [String], default: [] },
    challengeTag: {
      type: String,
      enum: ["groomsmen", "bridal-team", "parents", null],
      default: null,
    },
  },
  { timestamps: true }
);

export type Photo = InferSchemaType<typeof photoSchema>;
export const PhotoModel = model("Photo", photoSchema);
