import { FC } from "react";
import "./index.scss"
type ISize = "small" | "middle" | "large"
type Props = {
  size?: ISize
  color?: "white" | "blue" | "gray" | "orange"
  className: string
}
export const InfinityLoader:FC<Props> = ({size = "middle", color = "gray", className = ""}) => {
  return (
    <div className={`sk-chase ${size} ${color} ${className}`}>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
    </div>
  );
};
