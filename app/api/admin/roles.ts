import Elysia, { t } from "elysia";
import { User } from "../db/user.model";
import { requireRole } from "../auth/checkRoles";

export const roleRoutes = new Elysia({ prefix: "/api/admin/roles" })

  // Convertir un usuario a ADMIN
  .post("/set-admin", async ({ body, headers }) => {


    const admin = requireRole(headers, ["admin"]);
    if (!admin) return { success: false, msg: "Access denied" };

    const { userId } = body;

    const u = await User.findByIdAndUpdate(userId, { role: "admin" }, { new: true });

    return { success: true, user: u };
  }, {
    body: t.Object({
      userId: t.String()
    })
  })

  // Quitar admin → user
  .post("/remove-admin", async ({ body, headers }) => {
    

    const admin = requireRole(headers, ["admin"]);
    if (!admin) return { success: false, msg: "Access denied" };

    const { userId } = body;

    const u = await User.findByIdAndUpdate(userId, { role: "user" }, { new: true });

    return { success: true, user: u };
  }, {
    body: t.Object({
      userId: t.String()
    })
  });


  
