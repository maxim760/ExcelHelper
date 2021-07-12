import React, {
  createContext,
} from "react";
import { CsvInformation } from "../../components/CsvInformation";
import { FormCsv } from "../../components/FormCsv";
import { InfinityLoader } from "../../components/InfinityLoader";
import { useStatus } from "../../hooks/useStatus";
import { useTitle } from "../../hooks/useTitle";
import { STATUSES } from "../../types";
import { useCsvData } from "./hooks/useCsvData";

import "./index.scss";
type IStatusContext = Record<
  "isLoading" | "isSuccess" | "isNone" | "isError",
  boolean
> & { statusMessage: null | undefined | string };
export const StatusContext = createContext({} as IStatusContext);

export const MainPage = () => {
  useTitle("Главная");
  const {
    isLoading,
    isSuccess,
    isError,
    isNone,
    statusMessage,
    setStatus: setCsvStatus,
    updateMessage: updateCsvMessage,
  } = useStatus(STATUSES.NONE);
  const {
    resetCsvData,
    csvData,
    csvResultPercent,
    progressCsv,submitForm
  } = useCsvData({setCsvStatus, updateCsvMessage})
  
  return (
    <div className="app">
      <StatusContext.Provider
        value={{ isError, isLoading, isSuccess, isNone, statusMessage }}
      >
        <FormCsv submitForm={submitForm} resetCsvData={resetCsvData} className="app-half">
          <button className="button" type="submit" disabled={isLoading}>
            Отправить
            {isLoading && (
              <InfinityLoader
                color="blue"
                size="small"
                className="button-loader"
              />
            )}
          </button>
        </FormCsv>
        <CsvInformation
          progressCsv={progressCsv}
          csvResultPercent={csvResultPercent}
          csvData={csvData}
          className="app-half"
        />
      </StatusContext.Provider>
    </div>
  );
};
