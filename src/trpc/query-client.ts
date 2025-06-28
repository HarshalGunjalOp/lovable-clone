import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import superjson from 'superjson';

/**
 * Crea y configura una nueva instancia de `QueryClient`.
 * Esta función se utiliza para proporcionar un cliente de query tanto en el servidor como en el cliente.
 * @returns Una instancia de `QueryClient` configurada.
 */

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,                                // El tiempo en milisegundos después del cual una query se considera obsoleta.
      },                                                     // Las queries obsoletas se revalidarán en la próxima monta o interacción.
      dehydrate: {
        serializeData: superjson.serialize,                  // Opcional: serializa los datos de la query para almacenarlos en el cache.
        shouldDehydrateQuery: (query) =>                     // Determina si una query específica debe ser deshidratada.
          defaultShouldDehydrateQuery(query) ||              // Aquí, se deshidratan las queries que cumplen la condición por defecto (success, !==undefined, no proceso de fetch)
          query.state.status === 'pending',                  // O las que están en estado 'pending' (fetching).
      },
      hydrate: {
         deserializeData: superjson.deserialize,             // Función para deserializar los datos durante la hidratación
      },
    },
  });
}