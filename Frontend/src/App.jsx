
import React from 'react'
import Navigation from './components/Navigation'
import { Route, Routes } from 'react-router-dom'
import Login from './components/UserAuthentication/Login'
import Home from './components/HomePage/Home'
import Signup from './components/UserAuthentication/Signup'

export default function App() {
  return (
    <>
    <Navigation/>
    <Routes>
      <Route path='/' element={<Home/>}>Home</Route>
      <Route path='/Login' element={<Login/>}>Login</Route>
      <Route path='/signup' element={<Signup/>}>Signup</Route>
    </Routes>
    </>
  )
}
