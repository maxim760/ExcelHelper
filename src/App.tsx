import React, { FC } from "react";
import { AppRouter } from "./components/AppRouter";
import { MainTemplate } from "./components/Templates/Main";

export const App: FC = () => {
  return (
    <MainTemplate>
      <AppRouter />
    </MainTemplate>
  );
};
