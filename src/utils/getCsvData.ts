import { csv } from "d3-fetch";
import { DSVRowArray } from "d3-dsv";

const banned = ["для", "около", "в", "по", "где", "на", "купить", "цена"];

type ICategs = string[];
type ITransformedMap = Map<
  string,
  {
    categs: ICategs;
    regex: RegExp;
  }
>;
const transform = (data: DSVRowArray<string>, size: number = 1) => {
  const map: ITransformedMap = new Map();
  const { columns } = data;
  data.forEach((d) => {
    const categs: ICategs = [];
    for (let i = 0; i < size; i++) {
      categs.push(d[columns[i]]!);
    }
    const query = d[columns[size]]!.trim();
    // const strForRegex = query
    const strForRegex = query.length <= 6 ? query : query.slice(0, -1).trim()
    map.set(query, {
      categs,
      // regex: RegExp(query, "ig"),
      regex: RegExp(strForRegex.replace(" ", "(.)+") , "ig"),
    });
  });
  return map;
};

type IFnPushMatching = (arg: {
  key?: string | undefined;
  queryToCateg: string;
}) => void;

const isMatched = (word1: string, word2: string, len: number) => {
  for (let i = 0; i < len; i++) {
    if (word1[i] !== word2[i]) {
      return false;
    }
  }
  return true;
};

type IFinalCsvArray = string[][];

type ICheckMatch = {
  wordForMatching: string;
  phrase: string;
};
const toFilteredWords = (str: string) =>
  str.split(" ").filter((word) => !banned.includes(word) && word.length > 1);

const checkMatching = ({ wordForMatching, phrase }: ICheckMatch) => {
  const words1 = toFilteredWords(wordForMatching);
  const words2 = toFilteredWords(phrase);
  const [minArray, maxArray] =
    words1.length > words2.length ? [words2, words1] : [words1, words2];
  const div = maxArray.length / minArray.length;
  if ((minArray.length <= 2 && div > 2) || div >= 3) {
    return false;
  }
  // фразы совпадают, если совпало больше половины слов
  // но если в 1 фразе мало слов, а вдругой много, то более строгая валидация
  const isSimilarStr = (count: number) =>
    div > 2 ? count >= minArray.length * 0.75 : count > minArray.length * 0.5;
  let count = 0;

  for (let word1 of minArray) {
    for (let word2 of maxArray) {
      const l1 = word1.length;
      const l2 = word2.length;
      const diff = Math.abs(l1 - l2);
      if (diff > 2 || l1 < 4 || l2 < 4) {
        continue;
      }
      const len = Math.max(Math.max(l1, l2) - 2, 4);
      if (isMatched(word1, word2, len)) {
        count++;
        break;
      }
    }
  }
  if (isSimilarStr(count)) {
    return true;
  }
  return false;
};

const match = (data: DSVRowArray<string>, map: ITransformedMap) => {
  const keys = Array.from(map.keys());
  const resultArray: IFinalCsvArray = [];
  const pushToResult: IFnPushMatching = ({ key, queryToCateg }) => {
    const item = key ? [queryToCateg, ...map.get(key)!.categs] : [queryToCateg];
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
      if (
        checkMatching({
          wordForMatching: key.toLowerCase(),
          phrase: queryToCateg.toLowerCase(),
        })
      ) {
        pushToResult({ key, queryToCateg });
        return;
      }
    }
    // pushToResult({ queryToCateg });
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

type IScv = string;
export const getCsvData: (arg: IUseDataProps) => Promise<IScv> = async (
  { initUrl, finalUrl, size = 1 } = {} as IUseDataProps
) => {
  const [init, final] = await Promise.all([csv(initUrl), csv(finalUrl)]);
  const transformed = transform(init, size);
  const matched = match(final, transformed);
  const columns = [final.columns[0], ...init.columns.slice(0, size)];
  const csvData = toCsv(matched, columns);
  (<any>window).matched = matched;
  (<any>window).fina = final;
  return csvData;
};
