import React, { useCallback, useEffect, useState, useMemo } from "react";
import { csv } from "d3-fetch";
import "./App.scss";
import { useChange } from "./hooks/useChange";
import { useFile } from "./hooks/useFile";
import { STATUSES } from "./types";
import { percentFormat } from "./utils/percentFormat";
import { CircularLoader } from "./components/CircularLoader";
import { useStatus } from "./hooks/useStatus";
import { InfinityLoader } from "./components/InfinityLoader";

// todo - перенести код в воркер и добавить проценты
const csvFileOptions = { accept: ".csv, text/csv", required: true };
export const App = () => {
  const { file: initFile, input: initInputFile } = useFile(csvFileOptions);
  const { file: finalFile, input: finalInputFile } = useFile(csvFileOptions);
  const [countCols, onChangeCountCols, { reset: resetCount }] = useChange("");
  const [csvData, setCsvData] = useState("");
  const [progressCsv, setProgressCsv] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  const {
    isLoading,
    isError,
    statusMessage,
    setStatus: setCsvStatus,
    updateMessage: updateCsvMessage,
  } = useStatus(STATUSES.NONE);
  const csvWorker = useMemo(() => new Worker("./workers/csv.js"), []);
  useEffect(() => {
    if (!(finalFile || initFile || countCols)) {
      setCsvStatus(STATUSES.NONE);
      setCsvData("");
    }
  }, [finalFile, initFile, countCols]);
  useEffect(() => {
    console.log("eto worker", csvWorker);
    csvWorker.onmessage = ({ data: { type, message } }: MessageEvent) => {
      switch (type) {
        case "csv":
          setCsvData(message);
          setCsvStatus(STATUSES.SUCCESS);
          setProgressCsv(0);
          break;
        case "error":
          setCsvData("");
          setCsvStatus(STATUSES.ERROR, message);
          setProgressCsv(0);
          break;
        case "progress":
          setProgressCsv(message);
          break;
        case "processing":
          updateCsvMessage(message);
          break;
      }
    };
  }, [csvWorker]);

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
    setCsvData("");
    setCsvStatus(STATUSES.LOADING);
    e.preventDefault();
    e.currentTarget.reset();
    resetCount();
    console.log("on submit");
    try {
      console.log("post message");
      const [initObj, finalObj] = await Promise.all([
        csv(initFile!.url),
        csv(finalFile!.url),
      ]);
      csvWorker.postMessage({
        initObj,
        finalObj,
        size: +countCols,
      });
    } catch (error) {
      console.log("err");
      setCsvStatus(STATUSES.ERROR);
    }
  };
  return (
    <div className="app">
      {isCopied && (
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.2)",
            position: "fixed",
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
      <form className="app-half form" onSubmit={onSubmit}>
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
        <button type="submit" disabled={isLoading}>
          Отправить
          {isLoading && (
            <InfinityLoader
              color="blue"
              size="small"
              className="form__button-loader"
            />
          )}
        </button>
      </form>
      <div className="app-half">
        {isError && (
          <h2 className="csv-error">{statusMessage || "Ошибка!!!"}</h2>
        )}
        {isLoading && !!progressCsv && (
          <>
            <div className="loading-info">
              {statusMessage
                ? <><span>Идёт загрузка:</span> <span className="detail-info">{ statusMessage }</span></>
                : "Идёт загрузка..."}
            </div>
            <CircularLoader
              radius={60}
              activeColor="red"
              bgColor="blue"
              stroke={4}
              text={percentFormat(progressCsv)}
              percent={progressCsv}
            />
          </>
        )}
        {csvData && (
          <div className="csv-text-wrapper">
            <h3 className="csv-text-title"> CSV файл: </h3>
            <button className="small" onClick={onCopyCsv}>
              Скопировать
            </button>
            <textarea className="csv-text" readOnly defaultValue={csvData} />
          </div>
        )}
      </div>
    </div>
  );
};
