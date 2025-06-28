import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createCallerFactory, createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';


/**
 * Factory para crear "callers" de tRPC.
 * Un "caller" es una forma de invocar tus procedimientos tRPC desde el lado del servidor
 * directamente, sin pasar por una capa HTTP. Está configurado con tu `appRouter`.
 * @see https://trpc.io/docs/server/server-side-calls
 */
const callerFactory = createCallerFactory(appRouter);

/**
 * Instancia del "caller" de tRPC para uso exclusivo en el servidor.
 * Permite llamar a tus procedimientos tRPC (queries, mutations) como si fueran funciones
 * directas desde Server Components, API Routes, etc.
 * Se inicializa con un contexto (`createTRPCContext`). Si tu contexto es asíncrono,
 * esto utiliza top-level await (soportado en Next.js con módulos ESM).
 */
export const caller = callerFactory(await createTRPCContext());


/**
 *  Permite llamar a tus procedimientos tRPC desde tus Componentes de Servidor como si fueran funciones asíncronas
 *  normales, sin necesidad de realizar una petición HTTP. 
 */
export const getQueryClient = cache(makeQueryClient);  // Se utiliza la cache de React para asegurar que makeQueryClient se ejecute una sola vez por solicitud

export const trpc = createTRPCOptionsProxy({           // Configura el proxy de tRPC para ser utilizado con TanStack Query
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});


