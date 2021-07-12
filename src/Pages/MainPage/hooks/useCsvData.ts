import { csv } from "d3-fetch";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ISubmitFn } from "../../../components/FormCsv";
import { ISetStatusFn, IUpdateStatusMsgFn } from "../../../hooks/useStatus";
import { STATUSES } from "../../../types";

type Props = {
  setCsvStatus: ISetStatusFn;
  updateCsvMessage: IUpdateStatusMsgFn;
};

export const useCsvData = ({ setCsvStatus, updateCsvMessage }: Props) => {
  const csvWorker = useMemo(() => new Worker("./workers/csv.js"), []);
  const [csvData, setCsvData] = useState("");
  const [csvResultPercent, setCsvResultPercent] = useState<null | number>(null);
  const [progressCsv, setProgressCsv] = useState<number>(0);
  const clearCsvData = useCallback(() => {
    setCsvData("");
  }, []);
  const resetCsvData = useCallback(() => {
    clearCsvData();
    setCsvResultPercent(null);
    setCsvStatus(STATUSES.NONE);
  }, [setCsvStatus, clearCsvData]);
  const submitForm: ISubmitFn = useCallback(
    async ({ finalFile, initFile, size }) => {
      clearCsvData();
      setCsvStatus(STATUSES.LOADING);
      try {
        const [initObj, finalObj] = await Promise.all([
          csv(initFile.url),
          csv(finalFile.url),
        ]);
        csvWorker.postMessage({
          initObj,
          finalObj,
          size,
        });
      } catch (error) {
        console.log("err:", error);
        setCsvStatus(STATUSES.ERROR);
      }
    },
    [csvWorker, setCsvStatus, clearCsvData]
  );
  const onCsvWorkerMessage = useCallback(
    ({ data: { type, message, empty, total } }: MessageEvent) => {
      switch (type) {
        case "csv":
          const statusMsg = `Пустых строк - ${empty}`;
          setCsvResultPercent((total - empty) / total);
          setCsvData(message);
          setCsvStatus(STATUSES.SUCCESS, statusMsg);
          setProgressCsv(0);
          break;
        case "error":
          clearCsvData();
          console.log("csv error message", message);
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
    },
    [setCsvStatus, updateCsvMessage, clearCsvData]
  );
  useEffect(() => {
    csvWorker.onmessage = onCsvWorkerMessage;
  }, [csvWorker, onCsvWorkerMessage]);
  return {
    resetCsvData,
    csvData,
    csvResultPercent,
    progressCsv,
    submitForm,
  };
};
