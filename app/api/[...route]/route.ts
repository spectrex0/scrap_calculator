import swagger from "@elysiajs/swagger";
import Elysia, { t } from "elysia";
import mongoose from "mongoose";
import { adminRoutes } from "../admin/admin";
import { roleRoutes } from "../admin/roles";
import { authRoutes } from "../auth/auth";
import { comment } from "../db/comments.model";
import { Log } from "../db/logs.model";
import("dotenv/config");
const url = process.env.MONGO_URL;
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
    "/calculate/scraps",
    ({ body }) => {
      const { scraps, woTotal, totalYards } = body;

      try {
        const wo = Number(woTotal);
        const yards = Number(totalYards);

        if (isNaN(wo) || isNaN(yards) || wo <= 0 || yards <= 0) {
          return {
            success: false,
            message: "WO Total y Total Yards deben ser números positivos",
          };
        }

        const validScraps: string[] = scraps.filter(
          (value: string): boolean => {
            const num: number = Number(value);
            return !isNaN(num) && num !== 0;
          }
        );

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
      } catch {
        return {
          success: false,
          message: "Error en el cálculo",
        };
      }
    },
    {
      body: t.Object({
        scraps: t.Array(t.String()),
        woTotal: t.String(),
        totalYards: t.String(),
      }),
    }
  )
.post(
  "/calculate/spr",
  ({ body }) => {
    const { cycles, piecesPerBlade, currentProduction } = body;

    try {
      const c = Number(cycles);
      const p = Number(piecesPerBlade);
      const curr = Number(currentProduction);

      // Validación
      if (isNaN(c) || isNaN(p) || isNaN(curr) || c < 0 || p <= 0 || curr < 0) {
        return {
          success: false,
          message:
            "Ciclos y Producción Actual deben ser ≥ 0. Piezas por cuchilla debe ser > 0.",
        };
      }


      const expectedPieces = c * p;
      const difference = expectedPieces - curr;

      return {
        success: true,
        result: {
          cycles: c,
          piecesPerBlade: p,
          expectedPieces,       
          currentProduction: curr, 
          difference,            
        },
      };
    } catch (error) {
      console.error("Error en el cálculo:", error);
      return {
        success: false,
        message: "Error en el cálculo",
      };
    }
  },
  {
    body: t.Object({
      cycles: t.String(),
      piecesPerBlade: t.String(),
      currentProduction: t.String(),
    }),
  }
)
  .post(
    "/calculate/missingyards",
    async ({ body }) => {
      const { currentProduction, woTotal, totalYards } = body;

      const WO = Number(woTotal);
      const TY = Number(totalYards);

      if (isNaN(WO) || isNaN(TY)) {
        return {
          error: "WO Total y Total de Yardas deben ser números válidos.",
        };
      }
     

      if (!Array.isArray(currentProduction)) {
        return {
          error: "currentProduction debe ser un arreglo.",
        };
      }

      const results = currentProduction.map((cpValue) => {
        const CurrentP = Number(cpValue);

        if (isNaN(CurrentP)) {
          return {
            error: `El valor de producción actual "${cpValue}" no es un número válido.`,
          };
        }

        try {
          const WyC = WO - CurrentP;
          const RyW = WyC / WO;
          const RyY = RyW * TY;
          
          return {
            WyC: WyC,
            RyY: RyY,
            input: CurrentP,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return {
            error: `Error en cálculo para ${CurrentP}: ${errorMessage}`,
          };
        }
      });

      return {
        success: true,
        results: results,
      };
    },
    {
      body: t.Object({
        currentProduction: t.Array(t.String()),
        woTotal: t.String(),
        totalYards: t.String(),
      }),
    }
  )

  .post(
    "/log",
    async ({ body }) => {
      const { username, event } = body;

      try {
        const gl = new Log({ username, event });
        await gl.save();

        return { success: true, id: gl._id };
      } catch (error) {
        return { success: false, ERROR: error };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        event: t.String(),
      }),
    }
  )

.post('calculate/pty', ({ body }) => {
  const { targetPieces, woTotal, totalYards } = body;

  try {
    const targetPiecesNum = parseFloat(targetPieces);
    const woTotalNum = parseFloat(woTotal);
    const totalYardsNum = parseFloat(totalYards);

    if (isNaN(targetPiecesNum) || isNaN(woTotalNum) || isNaN(totalYardsNum)) {
      return {
        error: 'Invalid number format in input'
      };
    }

    const TPyWT = targetPiecesNum / woTotalNum;
    const result = TPyWT * totalYardsNum
    return {
      yardas: result
    };

  } catch (error) {
    return {
      ErrorMessage: (error as Error).message
    };
  }
}, {
  body: t.Object({
    targetPieces: t.String(),
    woTotal: t.String(),
    totalYards: t.String()
  })
})

  .post(
    "/comment",
    async ({ body }) => {
      const { title, author, content } = body;

      try {
        const now = new Date().toLocaleString();
        await comment.create({
          title,
          author,
          content,
          date: now,
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Error creating comment:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: t.Object({
        title: t.String(),
        author: t.String(),
        content: t.String(),
      }),
    }
  );


export type API = typeof api;
export const POST = api.handle;
export const GET = api.handle;
