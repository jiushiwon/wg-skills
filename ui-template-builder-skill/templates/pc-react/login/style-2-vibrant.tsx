import React, { useState } from 'react'
import './style-2.css'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', password: '', remember: false })

  return (
    <div className="login-page style-vibrant">
      <div className="login-bg-pattern"></div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">✨</span>
            </div>
            <h1 className="login-title">{isLogin ? '欢迎回来' : '加入我们'}</h1>
            <p className="login-subtitle">{isLogin ? '登录后开始探索' : '创建账号开启旅程'}</p>
          </div>

          <form className="login-form">
            <div className="form-item">
              <input
                type="text"
                className="form-input"
                placeholder="请输入手机号"
              />
            </div>

            <div className="form-item">
              <input
                type="password"
                className="form-input"
                placeholder="请输入密码"
              />
            </div>

            <div className="form-extra">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkbox-text">我同意用户协议</span>
              </label>
            </div>

            <button type="button" className="submit-btn">
              {isLogin ? '登 录' : '注 册'}
            </button>

            <div className="divider">
              <span className="divider-text">或</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn wechat">
                <span>💬</span> 微信登录
              </button>
            </div>
          </form>

          <div className="login-footer">
            <span className="footer-text">
              {isLogin ? '没有账号？' : '已有账号？'}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
                {isLogin ? '立即注册' : '立即登录'}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
