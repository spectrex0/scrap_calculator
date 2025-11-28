import Elysia from "elysia";
import { User } from "../db/user.model";
import { Log } from "../db/logs.model";
export const adminRoutes = new Elysia({ prefix: "/admin" })

  .get("/logs", async ({ query }) => {
    const { userId } = query;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return { success: false, message: "Access denied" };
    }

    const logs = await Log.find().sort({ createdAt: -1 });

    return {
      success: true,
      logs
    };
  })

  .get("/users",async () => {
     try {
      const users = await User.find({})
     return {
      users
     }
     } catch (error) {
      return{
        message: "something went wrong"
      }
     }
  })