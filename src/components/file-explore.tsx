
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";
import { Hint } from "./hint";
import { Button } from "./ui/button";
import { CodeView } from "./code-view";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbEllipsis
} from "@/components/ui/breadcrumb";

type FileCollection = { [path: string]: string }

function getLanguageFromExtension(filename:string):string {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text"
}

interface FileExplorerProps {
  files: FileCollection;
}

export const FileExplorer = ({ files }: FileExplorerProps) => {

  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);                                    // Obtenemos las claves de los archivos
    return fileKeys.length > 0 ? fileKeys[0] : null;                        // Si hay archivos, seleccionamos el primero
  });

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        defaultSize={30}
        minSize={30}
        className="bg-sidebar"
      >
        <p>
          TODO: Tree view
        </p>
      </ResizablePanel>

      <ResizableHandle className="hover:bg-primary transition-colors" />
      
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedFile && files[selectedFile] ? (
          <div>
            <p>
              Code view
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view it&apos;s content
          </div>
        )}
      </ResizablePanel>

    </ResizablePanelGroup>
  )
}


