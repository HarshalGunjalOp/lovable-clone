//"use client"

import { useTRPC } from "@/trpc/client"
import { caller, trpc, getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";




const Page = async() => {

  //const trpc = useTRPC();
  //const { data } = useQuery(trpc.createAI.queryOptions({ text:  "Antonio"}));

  const queryClient =getQueryClient();
  void queryClient.prefetchQuery(trpc.createAI.queryOptions({ text:  "Antonio server prefetch"})); // prefetch query

  return (
    // dehydrate serializa la cache -> "empaqueta" el estado de la caché para su transporte.
    // HydrationBoundary es una utilidad de TanStack Query recibe el estado serializado de la caché a través la prop state
    // Cuando se cargue el componente children HydrationBoundary se encarga de volver a cargar la caché y "deserializa"/hydrata los datos
    <HydrationBoundary state={dehydrate(queryClient)}> 
      {/* useSuspenseQuery lanza una promesa , y Suspense renderiza el fallback hasta que la promesa se resuelva  */}
      <Suspense fallback={<div>Loading...</div>}>
          <Client />
      </Suspense>
    </HydrationBoundary>
  )
}

export default Page