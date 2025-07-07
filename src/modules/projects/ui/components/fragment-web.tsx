import { Button } from "@/components/ui/button";
import { Fragment } from "@/generated/prisma"
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import { useState } from "react"



interface Props {
  data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {
  
  
  
  return (
    <div className="flex flex-col w-full h-full">
      <iframe
        className="h-full w-full"
        sandbox="allow-form allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      >

      </iframe>
    </div>
  )
}