import React, { FC, useState } from "react";
import { useTitle } from "../../hooks/useTitle";
import "./index.scss";
import { ListItem } from "./ListItem";

const description = [
  "Программа получает на вход 2 файла","в 1 файле типы, которые относятся к запросу и сам запрос", "во 2 файле запросы, к которым нужно подобрать соответсвующий им тип",
];
const algorithm = [
  "Для каждого запроса из 2-ого файла проходим по запросам из первого файла",
  "Если запрос 2 файла совпдает или дополняет запрос из 1го файла, то записываем типы для него",
  "Для оставшися запросов проходим еще раз, и если между запросами совпадет больше половины слов, то также записыавем типы",
];
const features = [
  "При обработке исходного файла из запросов удаляются слова, которые не идентифицируют запрос, например - купить - оно может быть в любом запросе",
  "При определении того, соответсвуют ли запросы, из них убираются предлоги и различные слова, чтобы совпадение запросов было максимально точным",
];



enum FIELDS {
  ALGORITHM = "algorithm",
  DESCRIPTION = "description",
  FEATURES = "features",
  RESULT = "result",
}

type IAboutState = Partial<Record<FIELDS, boolean>>;

export const AboutPage: FC = () => {
  useTitle("Информация о приложении");
  const [showInfoState, setShowInfoState] = useState<IAboutState>({});
  const updateShowInfo = (name: FIELDS) => () => {
    setShowInfoState((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };
  const listItems = [
    { title: "Суть", items: description, field: FIELDS.DESCRIPTION },
    {
      title: "Алгоритм работы",
      items: algorithm,
      field: FIELDS.ALGORITHM,
      withNumeration: true,
    },
    { title: "Особенности", items: features, field: FIELDS.FEATURES },
  ];
  return (
    <div>
      <ul className="about__list">
        {listItems.map(({ title, items, field, withNumeration }) => (
          <ListItem
            key={title}
            title={title}
            onClick={updateShowInfo(field)}
            items={items}
            active={showInfoState[field]}
            withNumeration={withNumeration}
          />
        ))}
        <ListItem title="Пример" onClick={updateShowInfo(FIELDS.RESULT)} active={showInfoState[FIELDS.RESULT]}>
          <div className="about__images-row">
            <img
              className="about-image"
              src="./img/начал файл с пояснениями.jpg"
              alt="фото финального файла"
            />
            <span className="about__plus">+</span>
            <img
              className="about-image"
              src="./img/финал файл.jpg"
              alt="фото финального файла"
            />
          </div>
          <div className="about__equal">=</div>
          <div className="about__result">
            <img
              className="about-image center"
              src="./img/финал 2.jpg"
              alt="фото результата"
            />
          </div>
        </ListItem>
      </ul>
    </div>
  );
};
