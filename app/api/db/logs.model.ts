import { model, Schema, models } from "mongoose";

const logSchema = new Schema({
  username: { type: String, required: false },
  userId: { type: String, required: false },
  scrap: { type: Number, required: false },
  woTotal: { type: Number, required: false },
  totalYards: { type: Number, required: false },
  result: { type: Number, required: false },
  event: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const modelName = "SCLog";

export const Log = (models)[modelName] || model(modelName, logSchema);