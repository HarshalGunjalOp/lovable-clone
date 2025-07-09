"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {

  // const router = useRouter()

  // const [value, setValue] = useState("")

  // const trpc = useTRPC();
  
  // const createProject = useMutation(trpc.projects.create.mutationOptions({
  //   onError: (error) => {
  //     toast.error(error.message)
  //   },
  //   onSuccess: (data) => {
  //     toast.success("Project created successfully")
  //     router.push(`/projects/${data.id}`)
  //   }
  // }));



  // return (
  //   <div className="h-screen w-screen flex items-center justify-center">
  //     <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
  //       <Input value={ value } onChange={ (e) => setValue(e.target.value) }/>
  //       <Button 
  //         disabled={createProject.isPending}
  //         onClick={() => createProject.mutate({ value: value})}
  //       >
  //         Submit
  //       </Button>
  //     </div>
  //   </div>
  //)

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          <Image 
            src="/logo.svg"
            alt="Assistant logo"
            width={50}
            height={50}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something wiht Vibe
        </h1>
        <p className="tex-lg md:text-xl text-muted-foreground text-center"> 
          Create apps and websites by chatting with AI
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
    </div>
  )
}

export default Page