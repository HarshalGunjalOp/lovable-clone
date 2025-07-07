"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface HintProps {
  children: React.ReactNode;
  text: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const Hint = ({ children, text, side, align }: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p className="font-semibold">
            {text}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}