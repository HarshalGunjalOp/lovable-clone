"use client"

import { UserButton } from "@clerk/nextjs"


interface Props {
  showName?: boolean
}

const UserControl = ({ showName }: Props) => {
  return (
    <UserButton 
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: "rounded-md!",
          userButtonAvatarBox: "rounded-md! size-8",
          userButtonTrigger: "rounded-md! focus:ring-0",
          //userButtonName: "text-sm font-semibold text-gray-800 dark:text-white"
        }
      }}
      />  
  )
}

export default UserControl