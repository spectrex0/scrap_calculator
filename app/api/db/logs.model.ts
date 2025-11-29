import { model, Schema, models } from "mongoose";

const logSchema = new Schema({
  username: String,
  scrap: Number,
  woTotal: Number,
  totalYards: Number,
  result: Number,
  event: String,
  createdAt: { type: Date, default: Date.now }
});

export const Log = models.Log || model("scLog", logSchema);
