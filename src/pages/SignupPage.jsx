import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setIsSubmitting(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage('会員登録に失敗しました。' + error.message)
      return
    }

    // メール確認が有効な場合はセッションが発行されないため、確認を促す
    if (!data.session) {
      setInfoMessage('確認メールを送信しました。メール内のリンクから登録を完了してください。')
      return
    }

    navigate('/properties')
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>会員登録</h1>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {infoMessage && <p className="info-message">{infoMessage}</p>}

        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '会員登録'}
        </button>

        <p className="auth-switch">
          すでにアカウントをお持ちの方は<Link to="/login">ログイン</Link>
        </p>
      </form>
    </div>
  )
}

export default SignupPage
