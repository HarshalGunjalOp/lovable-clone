"use client"

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {

  const trpc = useTRPC();

  const baseQueryOptionsProjects = trpc.projects.getOne.queryOptions({ id: projectId }) // Obtenemos un proyecto en base a su Id
  const { data: project } = useSuspenseQuery({
    ...baseQueryOptionsProjects,
    retry: 3,
  });

  const baseQueryOptionsMessages = trpc.messages.getMany.queryOptions({ projectId })    // Obtenemos los mensajes de un proyecto en base a su Id
  const { data: messages } = useSuspenseQuery({
    ...baseQueryOptionsMessages,
    retry: 3,
  });

  return (
    <div>
      {JSON.stringify(project)}
      {JSON.stringify(messages, null, 2)}
    </div>
  )
}

