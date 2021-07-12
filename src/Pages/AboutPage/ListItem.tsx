import { FC } from "react";

type Props = {
  title: string;
  onClick: () => void;
  active?: boolean;
  items: string[];
  withNumeration?: boolean;
} | {
  title: string;
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  items?: string[];
  withNumeration?: boolean;
}

export const ListItem: FC<Props> = ({
  title,
  children,
  onClick,
  active = false,
  items = [],
  withNumeration = false,
}) => {
  const getTextItem: (arg: string, i: number) => string = withNumeration
    ? (item, i) => `${i + 1}. ${item}`
    : (item) => item;
  return (
    <li className={`about__list-item ${active ? "active" : ""}`}>
      <button onClick={onClick}>{title}</button>
      {active && <ul>
        {children
          ? <li>{children}</li>
          : items.map((item, i) => <li key={i}>{getTextItem(item, i)}</li>)}
      </ul>}
    </li>
  );
};
