import React, { memo, useEffect } from "react";
import { useChange } from "../../hooks/useChange";
import { IFile, useFile } from "../../hooks/useFile";
import "./index.scss";

export type ISubmitFn = (
  arg: Record<"initFile" | "finalFile", IFile> & { size: number }
) => void;

type FormCsvProps = {
  submitForm: ISubmitFn;
  children: React.ReactNode;
  resetCsvData: () => void;
  className ?: string
};

const csvFileOptions = { accept: ".csv, text/csv", required: true };
export const FormCsv: React.FC<FormCsvProps> = memo(
  ({ submitForm, children, resetCsvData,className="" }) => {
    const { file: initFile, input: initInputFile } = useFile(csvFileOptions);
    const { file: finalFile, input: finalInputFile } = useFile(csvFileOptions);
    const [countCols, onChangeCountCols, { reset: resetCount }] = useChange("");

    const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.currentTarget.reset();
      resetCount();
      if (!initFile || !finalFile) {
        return alert("Добавьте файлы");
      }
      submitForm({ initFile, finalFile, size: +countCols });
    };
    useEffect(() => {
      if (!(finalFile || initFile || countCols)) {
        resetCsvData();
      }
    }, [finalFile, initFile, countCols, resetCsvData]);
    return (
      <form className={`${className} form`} onSubmit={onSubmitForm}>
        <div className="form__files">
          <label className="form__file-label">
            <span>Исходный файл</span>
            <input {...initInputFile} />
          </label>
          <label className="form__file-label">
            <span>Финальный файл</span>

            <input {...finalInputFile} />
          </label>
        </div>
        <label className="form__count-label">
          <span>Кол-во столбцов с типами:</span>
          <input
            required
            onChange={onChangeCountCols}
            value={countCols}
            type="number"
          />
        </label>
        {children}
      </form>
    );
  }
);
