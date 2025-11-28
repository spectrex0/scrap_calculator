import swagger from "@elysiajs/swagger";
import Elysia, { t } from "elysia";
import { authRoutes } from "../auth/auth";
import { roleRoutes } from "../admin/roles";
import mongoose from "mongoose";
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
  .post(
    "/calculate",
    ({ body }) => {
      const { scraps, woTotal, totalYards } = body;

      try {
        const wo = Number(woTotal);
        const yards = Number(totalYards);

        // Procesar cada scrap individualmente
        const results = scraps.map((value) => {
          const scrap = Number(value);

          // Paso 1
          const division = scrap / wo;

          // Paso 2
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
        scraps: t.Array(t.String()), // cada scrap llega individual
        woTotal: t.String(),
        totalYards: t.String(),
      }),
    }
  );

export type API = typeof api;
export const POST = api.handle;
export const GET = api.handle;
