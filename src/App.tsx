import React, { useCallback, useEffect, useState } from "react";
import "./App.scss";
import { useChange } from "./hooks/useChange";
import { useFile } from "./hooks/useFile";
import { STATUSES } from "./types";
import { getCsvData } from "./utils/getCsvData";

const csvFileOptions = { accept: ".csv, text/csv", required: true };
export const App = () => {
  const { file: initFile, input: initInputFile } = useFile(csvFileOptions);
  const { file: finalFile, input: finalInputFile } = useFile(csvFileOptions);
  const [countCols, onChangeCountCols, { reset: resetCount }] = useChange("");
  const [csvData, setCsvData] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [csvStatus, setCsvStatus] = useState(STATUSES.NONE);
  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  }, [isCopied]);
  const onCopyCsv = useCallback(() => {
    window.navigator.clipboard.writeText(csvData);
    setIsCopied(true);
  }, [csvData]);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setCsvStatus(STATUSES.LOADING);
    e.preventDefault();
    e.currentTarget.reset();
    resetCount();
    try {
      const csv = await getCsvData({
        initUrl: initFile!.url,
        finalUrl: finalFile!.url,
        size: +countCols,
      });
      setCsvStatus(STATUSES.SUCCESS);
      setCsvData(csv);
    } catch (error) {
      setCsvStatus(STATUSES.ERROR);
    }
  };
  return (
    <div className="app">
      {isCopied && (
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.2)",
            position: "absolute",
            width: "100%",
            padding: "20px",
            fontSize: "1.2em",
            left: 0,
            top: 0,
            textAlign: "center",
          }}
        >
          Скопировано
        </div>
      )}
      <form className="form" onSubmit={onSubmit}>
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
        <label>
          <span>Кол-во строк с типами</span>
          <input
            required
            onChange={onChangeCountCols}
            value={countCols}
            type="number"
          />
        </label>
        <button type="submit">Отправить</button>
      </form>
      {csvStatus === STATUSES.LOADING ? (
        <p>Загрузка...</p>
      ) : csvStatus === STATUSES.ERROR ? (
        <h2 className="csv-error">Ошибка!!!</h2>
      ) : null}
      {csvData && (
        <div className="csv-text-wrapper">
          <button className="small" onClick={onCopyCsv}>
            Скопировать
          </button>
          <textarea className="csv-text" readOnly>
            {csvData}
          </textarea>
        </div>
      )}
    </div>
  );
};
