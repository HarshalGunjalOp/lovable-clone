import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";


export async function getSandbox(sandboxId: string){
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  )

  const message = result.output[lastAssistantTextMessageIndex] as 
    | TextMessage
    | undefined
  
  return message?.content
    ? typeof message.content === "string"
      ? message.content  
      : message.content.map((c) => c.text).join("")
    : undefined
}

export function parseAgentOutput(value: Message[]) {       // Extraen el contenido del primer mensaje de tipo text para poder guardarlo en la bd
  const output = value[0];                                 // Del objeto message se extrae el contenido

  if (output.type !== "text") {                            // Primero se verifica que la salida del agente sea de tipo text
    return "Fragment";                                     // Si no es de tipo text se devuelve "Fragment"
  }

  if (Array.isArray(output.content)) {                     // Despues se verifica si el contenido es un array de strings
    return output.content.map((txt) => txt).join("");      // Si lo es se concatena cada string en un string unido por un espacio
  } else {
    return output.content;                                 // Si no es un array se devuelve el contenido directamente
  }
}