"use client"

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query"

interface Props {
  projectId: string
}

export const MessagesContainer = ({ projectId }: Props) => {

  const trpc = useTRPC();

  const baseQueryOptionsMessages = trpc.messages.getMany.queryOptions({ projectId })    // Obtenemos los mensajes de un proyecto en base a su Id
  const { data: messages } = useSuspenseQuery({
    ...baseQueryOptionsMessages,
    retry: 3,
  });

  return (
    <div>
      {JSON.stringify(messages)}
    </div>
  )
}

