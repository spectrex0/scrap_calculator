import { model, Schema, models } from "mongoose";

const logSchema = new Schema({
  userId: { type: String, required: true },
  scrap: Number,
  woTotal: Number,
  totalYards: Number,
  result: Number,
  createdAt: { type: Date, default: Date.now }
});

export const Log = models.Log || model("Log", logSchema);
