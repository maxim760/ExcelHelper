import { AboutPage } from "../Pages/AboutPage";
import { MainPage } from "../Pages/MainPage";

export enum ROUTES {
  ABOUT = "/about",
  MAIN = "/",
}

export const routes = [
  {path: ROUTES.MAIN, Component: MainPage},
  {path: ROUTES.ABOUT, Component: AboutPage}
]