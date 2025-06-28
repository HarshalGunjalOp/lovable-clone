import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';


/**
 * Router principal de la aplicación.
 * Aquí se agrupan todos los sub-routers y procedimientos de tu API.
 */
export const appRouter = createTRPCRouter({
  createAI: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});


// export type definition of API
/** Tipo inferido del `appRouter`. Se utiliza en el cliente para obtener tipado de extremo a extremo. */
export type AppRouter = typeof appRouter;