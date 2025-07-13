import { inngest } from "./client";
import { createAgent, gemini, createTool, createNetwork, type Tool, type Message, createState } from "@inngest/agent-kit";
import  { Sandbox } from "@e2b/code-interpreter"
import { getSandbox, parseAgentOutput } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "../prompt";
import { lastAssistantTextMessageContent } from "./utils";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string;
  files: {
    [path: string]: string
  }
}

export const codeAgentFunction = inngest.createFunction(
  
  { id: "code-agent" },
  { event: "code-agent/run" },

  async ({ event, step }) => { // event contiene el propmt y el projectId

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("lovableclone-test16");
      //await sandbox.setTimeout(60)
      return sandbox.sandboxId;
    })

    const previousMessages = await step.run("get-previous-messages", async () => {  // Obtener los mensajes anteriores del proyecto
      const formattedMessages: Message[] = []
      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "asc" // A mi me funcionó así. Si no te funciona cambialo a "desc"
        },
      });

      for (const message of messages) {
        formattedMessages.push({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
        })
      }

      return formattedMessages;
    })

    const state = createState<AgentState>(                                           // Crear un estado para el agente de código
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    );                                              

    const codeAgent = createAgent<AgentState>({                                      // Crear agente de código
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: gemini({
        model: "gemini-1.5-flash",                                                   // Gemini wraps the code in backticks, which we need to remove.
        apiKey: process.env.GEMINI_API_KEY                                           // Look at <FileExplorer /> the DecodedCode function.
      }),
      tools: [                                                                       // Herramientas del agente de código
        
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async({ command }, { step }) => {
            return await step?.run("terminal", async() => {
              const buffers = {stdout: "", stderr: ""}
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data:string) => {
                    buffers.stdout += data
                  },
                  onStderr: (data:string) => {
                    buffers.stderr += data
                  },
                });
                return result.stdout
              }catch(e){
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`  
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }

                return updatedFiles;
              } catch(e) {
                return "Error: " + e;
              }
            });

            if(typeof newFiles === "object"){
              network.state.data.files = newFiles;
            }
          }
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            })
          },
        })
      ],
      lifecycle: {                                                                   // Eventos de vida del agente de código
        onResponse: async ({ result, network}) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);  // Obtener el último mensaje de texto de la respuesta del agente de código

          if (lastAssistantMessageText && network) {                                 // Si existe un último mensaje y un estado de trabajo del agente
            if(lastAssistantMessageText.includes("<task_summary>")){                 // Y el último mensaje de texto es un resumen de tarea
              network.state.data.summary = lastAssistantMessageText;                 // lo guardamos en el estado compartido de la red. Esta es la señal de que la tarea ha finalizado.
            }
          }

          return result;                                                             // Devolver la respuesta del agente de código
        },
      },
    });

    const network = createNetwork<AgentState>({                                      // El network es el contenedor que ejecuta a los agentes en un ciclo, utiliza el router para decidir el siguiente paso y usa el state para mantener la memoria del trabajo realizado.       
      name: "coding-agent-network",
      agents: [codeAgent],                                                           // Actualmente tenemos un solo agente de código
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {                                               // el router decide qué agente debe actuar a continuación. Para ello usa network.state que es un state que almacena información durante la ejecutcion de las herramientas y el lifecycle de un agente de IA.
        const summary = network.state.data.summary;                                  // Si el resumen de tarea está presente, no debe actuar porque ya se ha completado la tarea

        if(summary){
          return
        }

        return codeAgent;                                                            //  Si no hay resumen, pasa el control al único agente disponible, codeAgent".
      }
    })

    const result = await network.run(event.data.value, { state: state });            // Inicia la ejecución de la red de agentes con el input del usuario y espera a que se complete. 

    const fragmentTitleGenerator = createAgent({                                     // Sub-agentes para cuando termina el agente principal
      name: "fragment-title-generator",                                              // Genera un título corto y descriptivo para el fragmento de código.
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({
        model: "gemini-1.5-flash",                                                   
        apiKey: process.env.GEMINI_API_KEY                                           
      }),
    });

    const responseGenerator = createAgent({                                          // Genera una respuesta amigable y conversacional para el usuario final.
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: gemini({
        model: "gemini-1.5-flash",                                                   
        apiKey: process.env.GEMINI_API_KEY                                           
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary); // La respuesta de los agentes es un array de objetos tipo Message
    const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);           // Y se matizará el resultado con la función parseAgentOutput

    const isError = 
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000)
      return `https://${host}`  
    })
    
    await step.run("save-result", async() => {                                       // Guardar el resultado de la tarea en la base de datos
      
      if( isError ){
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          }
        })
      }
      
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: parseAgentOutput(responseOutput), 
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: parseAgentOutput(fragmentTitleOutput),
              files: result.state.data.files,
            }
          }
        }
      })
    })

    return {
      sandboxUrl,
      title: "Fragment" ,
      files: result.state.data.files,
      summary: result.state.data.summary
    };
  },
);




