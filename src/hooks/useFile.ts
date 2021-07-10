import { useCallback, useState } from "react";

export type IFile = {
  file: File;
  url: string;
};

type FileProps = {
  required?: boolean;
  accept?: string
}

export const useFile = ({required = false, accept}: FileProps = {}) => {
  const [file, setFile] = useState<null | IFile>(null);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFiles = e.target.files;
    if (!targetFiles) {
      return;
    }
    const file = targetFiles[0];

    setFile({
      file,
      url: URL.createObjectURL(file),
    });
    // e.target.value = "";
  }, []);
  return { input: {onChange, required, type: "file", accept}, file };
};
