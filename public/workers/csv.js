self.onmessage = async (e) => {
  try {
    const csvData = await getCsvData(e.data)
    postMessage({type: "csv", message: csvData})
  } catch (e) {
    postMessage({type: "error", message: `Ошибка при обработке csv файла`})
  }
};

const banned = ["для", "около", "в", "по", "где", "на", "купить", "цена"];
const bannedFirst = ["купить", "цена"]


const transform = (data, size) => {
  const bannedFirstRegex = RegExp(`(${bannedFirst.join("|")})`, "gi")
  const map = new Map();
  const { columns } = data;
  data.forEach((d) => {
    const categs = [];
    for (let i = 0; i < size; i++) {
      categs.push(d[columns[i]]);
    }
    const query = d[columns[size]].trim();
    const strForRegex = query.length <= 6 ? query : query.slice(0, -1).trim();

    map.set(query, {
      categs,
      regex: RegExp(strForRegex.replace(bannedFirstRegex, "").trim().replace(" ", "(.)+"), "ig"),
    });
  });
  return map;
};

const isMatched = (word1, word2, len) => {
  for (let i = 0; i < len; i++) {
    if (word1[i] !== word2[i]) {
      return false;
    }
  }
  return true;
};

const toFilteredWords = (str) =>
  str.split(" ").filter((word) => !banned.includes(word) && word.length > 1);

const checkMatching = ({ wordForMatching, phrase }) => {
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
  const isSimilarStr = (count) =>
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

const match = (data, map, updateProgressInfo) => {
  const dataLength = data.length
  const keys = Array.from(map.keys());
  const resultArray = [];
  const pushToResult = ({ key, queryToCateg }) => {
    const item = key ? [queryToCateg, ...map.get(key).categs] : [queryToCateg];
    resultArray.push(item);
  };
  const key = data.columns[0];
  data.forEach((item, i) => {
    updateProgressInfo(i, dataLength)
    const queryToCateg = item[key];
    for (let key of keys) {
      if (queryToCateg.match(map.get(key).regex)) {
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
    pushToResult({ queryToCateg });
  });
  return resultArray;
};

const toCsv = (array, columns) => {
  const data = array.map((row) => row.join(",")).join("\n");
  const columnsStr = columns.join(",");
  return [columnsStr, data].join("\n");
};

async function getCsvData({ initObj, finalObj, size = 1 } = {}) {
  const periodBetweenUpdates = Math.max(~~(finalObj / 150), 120)
  const updateProgressInfo = (index, length) => {
    if (index % periodBetweenUpdates === 0) {
      postMessage({type: "progress", message: index / length})
    }
  }
  postMessage({type: "processing", message: "Начало обрабоки исходного файла"})
  const transformed = transform(initObj, size);
  postMessage({type: "processing", message: "Исходный файл проанализирован. Заполнение финального файла"})
  const matched = match(finalObj, transformed, updateProgressInfo);
  const columns = [finalObj.columns[0], ...initObj.columns.slice(0, size)];
  postMessage({type: "processing", message: "Всё готово. Приведение к csv формату"})
  const csvData = toCsv(matched, columns);
  return csvData;
}
