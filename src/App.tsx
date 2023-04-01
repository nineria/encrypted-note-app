import { useState } from 'react'
import LoginPage from './LoginPage'
import NotesPage from './NotesPage'

function App() {
  const [userData, setUserData] = useState<{
    username: string
    passphrase: string
  }>()
  return userData ? <NotesPage /> : <LoginPage setUserData={setUserData} />
}

export default App
