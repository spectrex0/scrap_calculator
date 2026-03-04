import Elysia from "elysia";
import { comment } from "../db/comments.model";
import { Log } from "../db/logs.model";
import { User } from "../db/user.model";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get("/logs", async ({ query }) => {
    const { username } = query;
 
    if (!username) {
      return { success: false, message: "Username required" };
    }

    const logs = await Log.find({ 
      username: { $regex: new RegExp(`^${username}$`, "i") } 
    }).sort({ createdAt: -1 });

    return {
      success: true,
      logs,
    };
  })
  

  .get("/logs/sesion", async () => {
    const SLogs = await Log.find({}).sort({ createdAt: -1 });
    return {
      success: true,
      SLogs,
    };
  })

  .get("/users", async () => {
    try {
      const users = await User.find({});
      return {
        users,
      };
    } catch {
      return {
        message: "something went wrong",
      };
    }
  })

  .get("/comment", async () => {
    try {
      const comments = await comment.find({});
      return {
        comments,
      };
    } catch (error) {
      return {
        message: error,
      };
    }
  });