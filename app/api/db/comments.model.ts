 
import { Schema, model, models } from "mongoose";

const commentSchema = new Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  title: {type: String, required: true},
  date: {type: String, required: false}
});
 
const comment = models.comments || model("comments", commentSchema);

export { comment };