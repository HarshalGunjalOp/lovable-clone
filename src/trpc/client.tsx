'use client';


import superjson from 'superjson';
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import { AppRouter } from './routers/_app';


/**
 * `TRPCProvider`: Componente para envolver tu aplicación y proveer el contexto de tRPC.
 * `useTRPC`: Hook para acceder al cliente de tRPC y realizar llamadas a procedimientos.
 * Se crean utilizando `createTRPCContext` con el tipo de tu `AppRouter` para inferencia de tipos.
 */
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

/**
 * Almacena la instancia del `QueryClient` en el lado del navegador.
 * Se utiliza para asegurar que solo se cree una instancia del cliente en el navegador.
 */
let browserQueryClient: QueryClient;

/**
 * Obtiene o crea una instancia de `QueryClient`.
 * - En el servidor: Siempre crea una nueva instancia para evitar compartir estado entre requests.
 * - En el cliente: Retorna una instancia singleton (creada una vez) para mantener el caché.
 * @returns Una instancia de `QueryClient`.
 */
function getQueryClient() {
  
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

/**
 * Determina la URL base para las llamadas a la API de tRPC.
 * - En el cliente: Usa una ruta relativa (ej. '/api/trpc').
 * - En el servidor: Usa la URL completa de la aplicación desde las variables de entorno.
 * @returns La URL completa del endpoint de tRPC.
 */
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    return process.env.NEXT_PUBLIC_APP_URL;
  })();
  return `${base}/api/trpc`;
}

/**
 * Componente proveedor principal para tRPC y React Query.
 * Configura y provee `QueryClientProvider` y `TRPCProvider` a la aplicación.
 * @param props - Props del componente, incluyendo `children`.
 */
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,

) {

  const queryClient = getQueryClient();                                 // Obtiene la instancia de QueryClient (nueva en servidor, singleton en cliente).
                                                                        // Crea la instancia del cliente tRPC.
  const [trpcClient] = useState(() =>                                   // `useState` se usa para asegurar que el cliente se cree solo una vez por renderizado del componente.                                
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson, 
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    // Proveedor de React Query, necesario para que tRPC funcione con TanStack Query.
    <QueryClientProvider client={queryClient}>
      {/* Proveedor específico de tRPC, pasa el cliente tRPC y el cliente de query. */}
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}