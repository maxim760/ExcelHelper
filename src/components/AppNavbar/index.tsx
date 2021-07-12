import React from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../utils/routes'
import "./index.scss"

const links = [
  {link: ROUTES.MAIN, name: "Главная"},
  {link: ROUTES.ABOUT, name: "О приложении"},
]
export const AppNavbar: React.FC = () => {
  
  return (
    <header className="header">
      <div><img className="header__logo" src="./img/logo.svg" alt="logo" /></div>
      <nav className="header__nav">
        {links.map(({ link, name }) => (
          <NavLink key={link} to={link} className="header__link" activeClassName="active" exact>{ name }</NavLink>
          ))}
      </nav>
    </header>
  )
}