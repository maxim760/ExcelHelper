import React, { FC } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ROUTES, routes } from '../../utils/routes'


export const AppRouter: FC = () => {
  
  return (
    <Switch>
      {routes.map(({ path, Component }) => (
        <Route key={path} path={path} component={Component} exact />
      ))}
      <Redirect to={ROUTES.MAIN} />
    </Switch>
  )
}