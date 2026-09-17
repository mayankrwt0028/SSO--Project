import { useState, useEffect } from 'react'

import './App.css'
import AuthPage from './pages/AuthPage'
import UsersPage from './pages/userPage'
import { useAuth } from './context/AuthContext'

function App() {
  const {user, loading} = useAuth()

  if(loading){
    return <h2>Loading...</h2>
  }
  return user ?(
  <UsersPage /> 
) : (<
  AuthPage />
)
}

export default App
