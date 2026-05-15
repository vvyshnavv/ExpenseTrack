import React, {useState} from 'react'
import api from '../api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Auth(){
  const [isLogin,setIsLogin]=useState(true)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')

  async function submit(e){
    e.preventDefault()
    try{
      const url = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const res = await api.post(url,{email,password})
      localStorage.setItem('token', res.data.token)
      toast.success('Authenticated')
      setTimeout(()=> window.location.href='/app',600)
    }catch(err){
      toast.error(err.response?.data?.message || 'Auth failed')
    }
  }

  return (
    <div className="auth-container">
      <ToastContainer />
      <div className="auth-wrap">
        <div className="icon-box" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3h-8a2 2 0 0 0-2 2v0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="display-heading">{isLogin ? 'Welcome back' : 'Create account'}</h2>
        <p className="subtitle">Enter your details to view your finances.</p>

        <div className="card auth-card mx-auto">
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" className="w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" className="w-full" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <button className="login-btn" type="submit">{isLogin ? 'Log in' : 'Sign up'}</button>
          </form>
        </div>

        <p className="footer-text">Don't have an account? <button className="signup-link" onClick={()=>setIsLogin(!isLogin)}>{isLogin ? 'Sign up' : 'Sign in'}</button></p>
      </div>
    </div>
  )
}
