import React, { useState } from 'react'
import './style-3.css'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="login-page style-dark">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-box">
              <span className="logo-icon">◈</span>
            </div>
            <h1 className="login-title">{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
          </div>

          <form className="login-form">
            <div className="form-item">
              <input type="text" className="form-input" placeholder="Email / Phone" />
            </div>
            <div className="form-item">
              <input type="password" className="form-input" placeholder="Password" />
            </div>
            <button type="button" className="submit-btn">{isLogin ? 'Sign In' : 'Sign Up'}</button>
          </form>

          <div className="login-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
