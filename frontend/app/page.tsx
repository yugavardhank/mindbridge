'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, register } from '../lib/api'

export default function HomePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', email: '', password: '', language: 'en-IN' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      let data
      if (mode === 'login') {
        data = await login(form.email, form.password)
      } else {
        data = await register(form.username, form.email, form.password, form.language)
      }
      localStorage.setItem('mb_token', data.access_token)
      localStorage.setItem('mb_username', data.username)
      router.push('/consultation')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eef2ff 0%, #fce8f8 50%, #e8f0ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, top: -150, right: -150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,85,168,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, bottom: -100, left: -100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,116,249,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.95)',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 8px 48px rgba(79,116,249,0.14)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeUp 0.5s ease',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, #4f74f9, #e855a8)',
            borderRadius: 18,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, marginBottom: 16,
            boxShadow: '0 8px 24px rgba(79,116,249,0.3)',
          }}>🌸</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 30, color: '#1a1f3c', marginBottom: 6, letterSpacing: -0.5 }}>
            Maitri
          </div>
          <div style={{ fontSize: 13, color: '#9aa0c0', fontWeight: 300 }}>
            Your mental health companion · Hindi & English
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: '#e8eeff', borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: 9,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === m ? 'white' : 'transparent',
              color: mode === m ? '#4f74f9' : '#9aa0c0',
              boxShadow: mode === m ? '0 2px 8px rgba(79,116,249,0.15)' : 'none',
            }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {mode === 'register' && (
            <div>
              <div style={labelStyle}>Username</div>
              <input placeholder="Choose a username" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} style={fieldStyle} />
            </div>
          )}
          <div>
            <div style={labelStyle}>Email address</div>
            <input placeholder="you@example.com" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <div style={labelStyle}>Password</div>
            <input placeholder="••••••••" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={fieldStyle} />
          </div>
          {mode === 'register' && (
            <div>
              <div style={labelStyle}>Preferred language</div>
              <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} style={{ ...fieldStyle, cursor: 'pointer' }}>
                <option value="en-IN">English</option>
                <option value="hi-IN">हिंदी (Hindi)</option>
              </select>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fff0f7', border: '1px solid #f9c5e8', borderRadius: 10, color: '#e855a8', fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: 14,
          background: loading ? '#c7d4ff' : 'linear-gradient(135deg, #4f74f9, #3a5ee8)',
          color: 'white', border: 'none', borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(79,116,249,0.35)',
          transition: 'all 0.2s',
        }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in to Maitri →' : 'Create Account →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9aa0c0', lineHeight: 1.8 }}>
          Safe, private & confidential<br />
          Works on 2G · Hindi + English · Always free
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder, textarea::placeholder { color: #9aa0c0; }
        input:focus, select:focus { border-color: #7b9cff !important; box-shadow: 0 0 0 4px rgba(79,116,249,0.1) !important; outline: none; }
      `}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: '#5a6080', marginBottom: 6, letterSpacing: 0.3 }
const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  background: '#f0f4ff', border: '1.5px solid #e2e8ff',
  borderRadius: 12, fontFamily: "'DM Sans', sans-serif",
  fontSize: 14, color: '#1a1f3c', outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}