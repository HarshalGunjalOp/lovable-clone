import { inngest } from "./client";
import { openai, createAgent, gemini, createTool } from "@inngest/agent-kit";
import  { Sandbox } from "@e2b/code-interpreter"
import { getSandbox } from "./utils";
import { z } from "zod";

export const helloWorld = inngest.createFunction(
  
  { id: "hello-world" },
  { event: "test/hello.world" },

  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("lovableclone-test9");
      //await sandbox.setTimeout(60)
      return sandbox.sandboxId;
    })

    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert next.js developer. You write readable, maintainable, and testable code. You write simple Next.js & React snippets.",
      model: gemini({ model: "gemini-1.5-flash", apiKey: process.env.GEMINI_API_KEY }),
      tools: [
        
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
            { step, network }
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

        
      ]
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    )

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000)
      return `https://${host}`
    })
    
    console.log(output, sandboxUrl)

    return { output, sandboxUrl };
  },
);




