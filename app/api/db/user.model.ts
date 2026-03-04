 
import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true, unique: false },
  password: { type: String, required: true },
  salt: { type: String, required: false},  
  role: { type: String, default: "user" ,unique: false },
  admin: { type: Boolean, default: false}
});
 
const User = models.User || model("User", userSchema);

export { User };