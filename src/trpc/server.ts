import 'server-only'; // <-- ensure this file cannot be imported from the client

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';

import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';


/**
 * Instancia del "caller" de tRPC para uso exclusivo en el servidor.
 * Permite llamar a tus procedimientos tRPC (queries, mutations) como si fueran funciones
 * directas desde Server Actions o Route Handlers.
 *
 * IMPORTANTE: Se le pasa la función `createTRPCContext` como factory, no el contexto
 * resuelto. Esto asegura que se cree un nuevo contexto para cada petición,
 * manteniendo el aislamiento y la seguridad de los datos del usuario.
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const caller = appRouter.createCaller(createTRPCContext);


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
