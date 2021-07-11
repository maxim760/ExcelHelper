import { FC, useMemo } from "react";
import "./index.scss";
type Props = {
  radius: number;
  percent: number;
  activeColor: string;
  bgColor: string;
  stroke?: number;
  text: string;
};

export const CircularLoader: FC<Props> = ({
  radius,
  stroke = 2,
  percent,
  activeColor,
  bgColor,
  text,
}) => {
  const { normalizedRadius, circumference } = useMemo(() => {
    const normalizedRadius = radius - stroke * 2;
    return {
      normalizedRadius,
      circumference: normalizedRadius * 2 * Math.PI,
    };
  }, [radius, stroke]);

  const strokeDashoffset = circumference - Math.min(percent, 1) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <g transform={`translate(${radius} ${radius})`}>
        <circle
          fill="transparent"
          stroke={bgColor}
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          strokeDashoffset={strokeDashoffset - circumference}
          r={normalizedRadius}
        />
        <circle
          fill="transparent"
          stroke={activeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={radius / 2.5}
          dy="0.09em"
        >
          {text}
        </text>
      </g>
    </svg>
  );
};
