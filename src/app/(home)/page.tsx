"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import ProjectsList from "@/modules/home/ui/components/projects-list";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-38">
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

      <ProjectsList />
    </div>
  )
}

export default Page