import React from "react";
import { AppNavbar } from "../AppNavbar";
import "./index.scss"

export const MainTemplate: React.FC = ({ children }) => {
  return (
    <div>
      <AppNavbar />
      <main className="main">{children}</main>
    </div>
  );
};
