import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';


/**
 * Router principal de la aplicación.
 * Aquí se agrupan todos los sub-routers y procedimientos de tu API.
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    //createContext: createTRPCContext,
    createContext: () => createTRPCContext({
      headers: req.headers 
    })
  });

export { handler as GET, handler as POST };