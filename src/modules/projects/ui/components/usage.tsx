import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";



interface Props {
  points: number;         // points available
  msBeforeNext: number;   // ms until next reset
}

export const Usage = ({ points, msBeforeNext }: Props) => {

  const { has } = useAuth();                        // Obtiene el objeto de autenticación de Clerk
  const hasProAccess = has?.({ plan: "pro" });      // y dentro se verifica si el usuario tiene acceso a la plan "pro"

  const resetTime = useMemo(() => {
    try {
      return formatDuration(                        // Formatea una duración en un formato legible por humanos.
        intervalToDuration({                        // calcula la duración entre dos fechas y devuelve un objeto `Duration`
          start: Date.now(),
          end: Date.now() + msBeforeNext,
        }),
        { format: ["months", "days", "hours"] }     // Formateo del objeto de duración
      )
    } catch (error) {
      console.log("Error formating duration", error);
      return "unknown"
    }
  },[msBeforeNext])

  return (
    <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm">
            {points} {hasProAccess ? "" : "free"} credits remaining
          </p>

          <p className="text-xs text-muted-foreground">
            Resets in{" "} {resetTime}
          </p>
        </div>

        {!hasProAccess && (
          <Button
            asChild
            size="sm"
            variant="tertiary"
            className="ml-auto"
          >
            <Link href="/pricing">
              <CrownIcon /> Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}