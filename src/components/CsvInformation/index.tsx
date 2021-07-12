import React, { useCallback, useContext, useEffect, useState } from "react";
import { StatusContext } from "../../Pages/MainPage";
import { percentFormat } from "../../utils/percentFormat";
import { CircularLoader } from "../CircularLoader";
import "./index.scss"

interface CsvInformationProps {
  progressCsv: number;
  csvData: string | null;
  csvResultPercent: number | null;
  className ?: string
}

export const CsvInformation: React.FC<CsvInformationProps> = ({
  csvData,
  progressCsv,
  csvResultPercent,className = ""
}) => {
  const { isError, isLoading, isSuccess, statusMessage } =
    useContext(StatusContext);
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  }, [isCopied]);
  const onCopyCsv = useCallback(() => {
    if (!csvData) return;
    window.navigator.clipboard.writeText(csvData);
    setIsCopied(true);
  }, [csvData]);
  return (
    <div className={className}>
      {isCopied && <div className="copied">Скопировано</div>}
      {isError && <h2 className="csv-error">{statusMessage || "Ошибка!!!"}</h2>}
      {isLoading && !!progressCsv && (
        <>
          <div className="loading-info">
            {statusMessage ? (
              <>
                <span>Идёт загрузка:</span>{" "}
                <span className="detail-info">{statusMessage}</span>
              </>
            ) : (
              "Идёт загрузка..."
            )}
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
          <button className="button small" onClick={onCopyCsv}>
            Скопировать
          </button>
          <textarea className="csv-text" readOnly defaultValue={csvData} />
          {isSuccess && (
            <>
              <p className="csv-info">{statusMessage}</p>
              {csvResultPercent && (
                <p className="csv-info">
                  Процент совпадения -{" "}
                  <b>{percentFormat(csvResultPercent, 3)}</b>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
