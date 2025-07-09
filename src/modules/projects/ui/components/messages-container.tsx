"use client"

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query"
import MessageCard from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma";
import { set } from "date-fns";
import { MessageLoading } from "./message-loading";

interface Props {
  projectId: string
  activeFragment: Fragment | null
  setActiveFragment: (fragment: Fragment | null) => void
}

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(null);                        // Ref para "recordar" el ID del último mensaje del asistente que se procesó.

  const trpc = useTRPC();

  const baseQueryOptionsMessages = trpc.messages.getMany.queryOptions({ projectId })    // Obtenemos los mensajes de un proyecto en base a su Id
  const { data: messages } = useSuspenseQuery({
    ...baseQueryOptionsMessages,
    refetchInterval: 5000,
    retry: 3,
  });

  useEffect(() => {                                                                   // Maneja dos situaciones diferentes:
    const lastAssistantMessage = messages.findLast(
      (message) => message.role === "ASSISTANT"
    )

    if (lastAssistantMessage?.fragment &&                                              // 1º Cuando llega una nueva respuesta de la IA
      lastAssistantMessage.id !== lastAssistantMessageIdRef.current                    // se detecta que el ID del último mensaje del asistnte es nuevo
    ){
      setActiveFragment(lastAssistantMessage.fragment)                                 // En este caso, se activa el fragmento correspondiente
      lastAssistantMessageIdRef.current = lastAssistantMessage.id                      // y se actualiza la referencia del último mensaje del asistente
    }
  },[messages, setActiveFragment, activeFragment])                                     // 2º cuando el usuario hace click en un fragmento activo (onFragmentClick) el if da false y el useEffecto no hace nada. Se respeta la seleccion del usuario.

  useEffect(() => {
    bottomRef.current?.scrollIntoView();                                                //  Hace scroll automáticamente hasta el final del contenedor de mensajes cada vez que se añade un nuevo mensaje.
  },[messages.length])

  const lastMessage = messages[messages.length - 1];                                    // Obtenemos el último mensaje del array de mensajes de la conversación
  const isLastMessageUser = lastMessage?.role === "USER";                               // Compruebo si el último mensaje es del tipo "USER"

  // Usuario escribe un prompt -> procedimiento crea mensaje tipo USER e inicia trabajo de la IA -> MessageContainer se rerenderiza -> isLastMessageUser se establece como true
  // <MessageLoading /> se renderiza -> IA termina su trabajo y genera mensaje tipo ASSISTANT -> MessageContainer se rerenderiza -> isLastMessageUser se establece como false
  // <MessageLoadign /> desaparece -> se rerendiza MessageCard con la respuesta de la IA

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard 
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.fragment?.id} // Comprueba si el mensaje es el fragmento activo
              onFragmentClick={() => setActiveFragment(message.fragment)}    // Se activa el fragmento cuando se hace click en el mensaje  
              type={message.type}
            />
          ))}
          {/* Simular que el assistente está "pensando" y generando una respuesta despues de escribir un prompt */}
          {isLastMessageUser && <MessageLoading />} 
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  )
}

