import { ChangeEvent, FormEvent, useState } from 'react'
import styles from './LoginPage.module.css'
import { AES, enc } from 'crypto-js'
import storage from './storage'
import { v4 as uuid } from 'uuid'
import { UserData } from './type'

const PASSPHRASE_STORAGE_KEY = 'passphrase'

type Props = {
  setUserData: (userData: UserData) => void
}

function LoginPage({ setUserData }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState('')

  const handleSummit = (e: FormEvent) => {
    e.preventDefault()

    const encryptedPassphrase = storage.get<string | undefined>(
      `${username}:${PASSPHRASE_STORAGE_KEY}`
    )

    if (!encryptedPassphrase) {
      const passphrase = uuid()
      storage.set(
        `${username}:${PASSPHRASE_STORAGE_KEY}`,
        AES.encrypt(passphrase, password).toString()
      )
      setUserData({ username, passphrase })
      return
    }

    const passphrase = AES.decrypt(encryptedPassphrase, password).toString(
      enc.Utf8
    )

    if (passphrase) {
      setUserData({ username, passphrase })
    } else {
      setErrorText('Invalid credentials for existing user')
    }
  }

  const onUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }
  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  return (
    <div className={styles.pageContainer}>
      <form className={styles.loginContainer} onSubmit={handleSummit}>
        {errorText}
        <label>
          <div className={styles.labelText}>username</div>
          <input
            type='text'
            name='username'
            className={styles.textField}
            onChange={onUsernameChange}
            value={username}
          />
        </label>
        <label>
          <div className={styles.labelText}>username</div>
          <input
            type='password'
            name='password'
            className={styles.textField}
            onChange={onPasswordChange}
            value={password}
          />
        </label>
        <div>
          <button type='submit' className={styles.submitButton}>
            Login
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginPage
