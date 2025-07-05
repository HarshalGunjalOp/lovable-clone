import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";


interface Props {
  params: Promise<{
    projectId: string
  }>
}


const Page = async({ params }: Props) => {
  
  const { projectId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({ projectId }));
  void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({ id: projectId }));

  return (
    // dehydrate serializa la cache -> "empaqueta" el estado de la caché para su transporte.
    // HydrationBoundary es una utilidad de TanStack Query recibe el estado serializado de la caché a través la prop state
    // Cuando se carga <AgentsView /> HydrationBoundary se encarga de volver a cargar la caché y "deserializa"/hydrata los datos
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading project...</div>}>
        {/* <ErrorBoundary fallback={<div>Something went wrong...</div>}> */}
          <ProjectView projectId={projectId} />
        {/* </ErrorBoundary> */}
      </Suspense>
    </HydrationBoundary>
  )
}

export default Page