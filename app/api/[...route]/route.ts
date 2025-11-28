import swagger from "@elysiajs/swagger";
import Elysia, { t } from "elysia";
import { authRoutes } from "../auth/auth";
import { roleRoutes } from "../admin/roles";
import AdminRoute from "@/app/components/AdminRoute";
import mongoose from "mongoose";
import { adminRoutes } from "../admin/admin";
import('dotenv/config')
const url = process.env.MONGO_URL
if (!url) {
  console.error("ERROR | MONGO_URL environment variable is not defined");
  process.exit(1);
}
mongoose
  .connect(url)
  .then(() => console.log(""))
  .catch((Error) => {
    console.error("ERROR | Error connecting to MongoDB:", Error.message);
    process.exit(1);
  });

const api = new Elysia({ prefix: "/api" })

  .use(swagger())
  .use(authRoutes)
  .use(roleRoutes)
  .use(adminRoutes)
 .post(
  "/calculate",
  ({ body }) => {
    const { scraps, woTotal, totalYards } = body;

    try {
      const wo = Number(woTotal);
      const yards = Number(totalYards);

      // Validaciones básicas
      if (isNaN(wo) || isNaN(yards) || wo <= 0 || yards <= 0) {
        return {
          success: false,
          message: "WO Total y Total Yards deben ser números positivos",
        };
      }

      // Filtrar: solo procesar scraps que no sean "0" (como string) ni 0 (como número)
      interface ScrapFilter {
        (value: string): boolean;
      }

      const validScraps: string[] = scraps.filter((value: string): boolean => {
        const num: number = Number(value);
        return !isNaN(num) && num !== 0;
      });

      // Procesar solo los scraps válidos
      const results = validScraps.map((value) => {
        const scrap = Number(value);
        const division = scrap / wo;
        const finalResult = division * yards;

        return {
          scrap,
          division,
          finalResult,
        };
      });

      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error en el cálculo",
      };
    }
  },
  {
    body: t.Object({
      scraps: t.Array(t.String()), // cada scrap llega como string
      woTotal: t.String(),
      totalYards: t.String(),
    }),
  }
);

export type API = typeof api;
export const POST = api.handle;
export const GET = api.handle;
