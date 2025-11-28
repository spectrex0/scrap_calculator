import Elysia, { t } from "elysia";
import { User } from "../db/user.model";
import { randomBytes, pbkdf2, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2); 
 
async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = randomBytes(32).toString("hex");
  const hash = (await pbkdf2Async(password, salt, 100000, 64, "sha256")).toString("hex");
  return { salt, hash };
}
 
async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const newHash = (await pbkdf2Async(password, salt, 100000, 64, "sha256")).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(newHash, "hex"));
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", async ({ body }) => {
    const { username, password } = body;

    const exists = await User.findOne({ username });
    if (exists) return { success: false, message: "User exists" };

    const { salt, hash } = await hashPassword(password);

    await User.create({ username, password: hash, salt });  

    return { success: true };
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String()
    })
  })

  .post("/login", async ({ body }) => {
  const { username, password } = body;

  const user = await User.findOne({ username });
  if (!user || !user.salt || !user.password) {
    return { success: false, message: "Invalid credentials" };
  }

  const isValid = await verifyPassword(password, user.salt, user.password);
  if (!isValid) {
    return { success: false, message: "Invalid credentials" };
  }

  return {
    success: true,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  };
}, {
  body: t.Object({
    username: t.String(),
    password: t.String()
  })
});