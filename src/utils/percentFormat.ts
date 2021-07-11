import { round } from "./round";
export const percentFormat = (num: number, roundNums = 2) => `${round(num  *  100, roundNums)}%`