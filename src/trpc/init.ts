import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjason from 'superjson';

export const createTRPCContext = cache(async () => {
                                  
  const session = await auth()                                      /** Llamada a Clerk para obtener la session del usuario que se incluye en el contexto de tRPC */
  return {    
    auth: session
  }
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;


/**
 * Inicialización de la instancia de tRPC.
 * Esta es la base para construir tus routers y procedimientos.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjason,                                          /** indicas al servidor tRPC que use superjson para serializar y deserializar los datos  */
});

const isAuthed = t.middleware(({ next, ctx }) => {                  /** Middleware para verificar si el usuario está autenticado */
  if (!ctx.auth?.userId){
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated'
    })
  }
  return next({
    ctx: {
      auth: ctx.auth 
    }
  })
})


// Base router and procedure helpers
export const createTRPCRouter = t.router;                           /** Helper para crear routers tRPC. Es un alias para `t.router`. */
export const createCallerFactory = t.createCallerFactory;           /** Helper para crear un "caller" del lado del servidor. Útil para llamar procedimientos internamente o en pruebas. Es un alias para `t.createCallerFactory`. */
export const baseProcedure = t.procedure;                           /** Procedimiento base público. Se usa para construir tus queries, mutations y subscriptions. Es un alias para `t.procedure`. */
export const protectedProcedure = t.procedure.use(isAuthed);        /** Procedimiento protegido. Se usa para crear procedimientos que solo pueden ser llamados por usuarios autenticados. Es un alias para `t.procedure.use(isAuthed)`. */