import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import superjason from 'superjson';

export const createTRPCContext = cache(async () => {
  return { userId: 'user_123' };
});


/**
 * Inicialización de la instancia de tRPC.
 * Esta es la base para construir tus routers y procedimientos.
 */
const t = initTRPC.create({
  transformer: superjason,                                          /** indicas al servidor tRPC que use superjson para serializar y deserializar los datos  */
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;                           /** Helper para crear routers tRPC. Es un alias para `t.router`. */
export const createCallerFactory = t.createCallerFactory;           /** Helper para crear un "caller" del lado del servidor. Útil para llamar procedimientos internamente o en pruebas. Es un alias para `t.createCallerFactory`. */
export const baseProcedure = t.procedure;                           /** Procedimiento base público. Úsalo para construir tus queries, mutations y subscriptions. Es un alias para `t.procedure`. */