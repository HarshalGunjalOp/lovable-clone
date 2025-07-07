import { TreeItem } from "@/types";


interface TreeViewProps {
  data: TreeItem[];
  value: string | null;
  onSelect: (value: string) => void;
}

export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {
  
  return (
    <p>{JSON.stringify(data)}</p>
  )
}