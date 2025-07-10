import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([                // Public routes
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/api(.*)',
]) 

export default clerkMiddleware(async (auth, req) => {      
  if (!isPublicRoute(req)) {                               // Protected routes
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};