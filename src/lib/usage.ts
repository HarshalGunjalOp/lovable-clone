import { RateLimiterPrisma } from "rate-limiter-flexible"
import { prisma } from "./db"
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 5;
const PRO_POINTS = 100;
const DURATION = 30 * 24 * 60 * 60; // 30 days
const GENERATION_COST = 1;

export async function getUsagetracker() {

  const { has } = await auth();                   // Obtiene el objeto de autenticación de Clerk
  const hasProAccess = has({ plan: "pro" });      // y dentro se verifica si el usuario tiene acceso a la plan "pro"

  const usageTracker = new RateLimiterPrisma({      // Esta herramienta se configura para que
    storeClient: prisma,                            // use Prisma para conectarse a la base de datos
    tableName: "Usage",                             // y almacene los datos en la tabla "Usage" 
    points: hasProAccess ? PRO_POINTS :FREE_POINTS, // Asigna puntos en función de si el usuario tiene acceso a la plan "pro" o no.
    duration: DURATION,                             // siendo válidos por 30 días
  });
  return usageTracker;
}

/**
 * Consume un crédito del usuario actual para una operación.
 * Utiliza un rate limiter para verificar y deducir puntos de la tabla `Usage`.
 */
export async function consumeCredits() { 
  const { userId } = await auth();                                                   // 1. Obtiene el ID del usuario autenticado usando Clerk.

  if (!userId) {                                                                     // 2. Si no hay un usuario logueado, lanza un error para detener la ejecución.
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsagetracker();                                      // 3. Obtiene la instancia del rastreador de uso configurado para Prisma. Aquí se aplica la config del limiter. Si se aplica a un usuario nuevo en la tabla Usage se asignan los puntos. Si no tiene puntos arroja un error    
  const result = await usageTracker.consume(userId, GENERATION_COST);                // 4. Intenta consumir 1 crédito (GENERATION_COST) para el userId actual.
  return result;                                                                     // 5. Devuelve el resultado de la operación si fue exitosa.
}


export async function getUsageStatus(){                                              // Obtiene el estado actual del rastreador de uso para el usuario autenticado.
  const { userId } = await auth();                                                   

  if (!userId) {                                                                     
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsagetracker();
  const result = await usageTracker.get(userId);   // result contiene remainingPoints y msBeforeNext                                  
  return result;
}