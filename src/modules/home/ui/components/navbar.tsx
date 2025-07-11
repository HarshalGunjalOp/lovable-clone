"use client"

import { Button } from "@/components/ui/button"
import UserControl from "@/components/user-control"
import { useScroll } from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"


const Navbar = () => {

  const isScrolled = useScroll(50)

  return (
    <nav className={cn(
      "p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
      isScrolled && "bg-background border-border"
    )}
    >
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="Logo" 
            width={24} 
            height={24} 
          />
        <span className="font-semibold text-lg">Vibe</span>
        </Link>

        <div className="flex gap-2">
          <SignedOut>
            <SignUpButton>
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button  size="sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserControl showName={true} />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}

export default Navbar