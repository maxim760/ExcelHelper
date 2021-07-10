import { csv } from "d3-fetch";
import { DSVRowArray } from "d3-dsv";
import { useEffect, useState } from "react";

const banned = ["для", "около", "в", "по", "где", "на", "ы", "купить"];

type ICategs = string[]
type ITransformedMap = Map<string, {
  categs: ICategs,
  regex: RegExp
}>
const transform = (data: DSVRowArray<string>, size: number = 1) => {
  const map: ITransformedMap = new Map();
  const { columns } = data;
  data.forEach((d) => {
    const categs: ICategs = [];
    for (let i = 0; i < size; i++) {
      categs.push(d[columns[i]]!);
    }
    const query = d[columns[size]]!.trim();
    map.set(query, {
      categs,
      regex: RegExp(query.replaceAll(" ", "(.)+"), "ig"),
    });
  });
  return map;
};
type IFinalCsvArray = string[][]
const match = (data:DSVRowArray<string>, map: ITransformedMap) => {
  const keys = Array.from(map.keys())
  const resultArray: IFinalCsvArray = [];
  const pushToResult = ({ key, queryToCateg }: { key?: string, queryToCateg: string }) => {
    const item = key ? [queryToCateg, ...map.get(key)!.categs] : [queryToCateg] 
    resultArray.push(item);
  };
  const key = data.columns[0];
  data.forEach((item) => {
    const queryToCateg = item[key]!;
    for (let key of keys) {
      if (queryToCateg.match(map.get(key)!.regex)) {
        pushToResult({ key, queryToCateg });
        return;
      }
    }
    for (let key of keys) {
      let count = 0;
      const wordsKeys = key
        .split(" ")
        .filter((word) => !banned.includes(word) && word.length > 1);
      const wordsQuery = queryToCateg
        .split(" ")
        .filter((word) => !banned.includes(word) && word.length > 1);
      for (let word of wordsKeys) {
        if (!queryToCateg.includes(word)) {
          count++;
        }
      }
      if (count < wordsKeys.length / 2) {
        pushToResult({ key, queryToCateg });
        return;
      }
      count = 0;
      for (let word of wordsQuery) {
        if (!key.includes(word)) {
          count++;
        }
      }
      if (count < wordsQuery.length / 2) {
        pushToResult({ key, queryToCateg });
        return;
      }
    }
    pushToResult({ queryToCateg });
  });
  return resultArray;
};

const toCsv = (array: IFinalCsvArray, columns: string[]) => {
  const data = array.map((row) => row.join(",")).join("\n");
  const columnsStr = columns.join(",");
  return [columnsStr, data].join("\n");
};

export type IUseDataProps = {
  initUrl: string;
  finalUrl: string;
  size: number;
};

type IScv = string
export const getCsvData: (arg: IUseDataProps) => Promise<IScv> = async ({
  initUrl,
  finalUrl,
  size = 1,
} = {} as IUseDataProps) => {
      const [init, final] = await Promise.all([
        csv(initUrl),
        csv(finalUrl),
      ]);
      const transformed = transform(init, size);
      const matched = match(final, transformed);
      const columns = [final.columns[0], ...init.columns.slice(0, size)];
      const csvData = toCsv(matched, columns);
      await window.navigator.clipboard.writeText(csvData);
  return csvData;
};
