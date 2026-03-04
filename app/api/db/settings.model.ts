import { Schema, model, models } from "mongoose";

const settingsSchema = new Schema({
  darkTheme: { type: Boolean, required: false },
  nextFieldShorcut: { type: String, required: false, default: "Tab" },
  
})


export const settings = new models.settings || model("userSettings", settingsSchema)