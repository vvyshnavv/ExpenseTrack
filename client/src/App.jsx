import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'

export default function App(){
  const token = localStorage.getItem('token')
  return (
    <Routes>
      <Route path='/' element={ token ? <Navigate to='/app'/> : <Auth/> } />
      <Route path='/app/*' element={ token ? <Dashboard/> : <Navigate to='/'/> } />
    </Routes>
  )
}
