'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { startSession, sendMessage } from '../../lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  is_crisis?: boolean
  helplines?: string[]
}

const QUICK_REPLIES = ['😔 Feeling anxious', '😴 Can\'t sleep', '😤 Family pressure', '😞 Feeling lonely', '😰 Exam stress']

export default function ConsultationPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('en-IN')
  const [username, setUsername] = useState('')
  const [starting, setStarting] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionInitialized = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem('mb_token')
    if (!token) { router.push('/'); return }
    setUsername(localStorage.getItem('mb_username') || 'Friend')
    if (!sessionInitialized.current) {
      sessionInitialized.current = true
      initSession()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initSession = async () => {
    try {
      const data = await startSession()
      setSessionId(data.session_id)
      setMessages([{ role: 'assistant', content: `Namaste 🙏 I'm Maitri, your mental health companion. I'm here to listen without judgment — whatever is on your mind, this is a safe space.\n\nWhat's on your mind today?` }])
    } catch { router.push('/') }
    finally { setStarting(false) }
  }

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || !sessionId || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const data = await sendMessage(sessionId, msg, language)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, is_crisis: data.is_crisis, helplines: data.helplines }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a small technical difficulty. Please try again in a moment." }])
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('mb_token')
    localStorage.removeItem('mb_username')
    router.push('/')
  }

  if (starting) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff, #fce8f8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 36 }}>🌸</div>
      <div style={{ fontSize: 14, color: '#9aa0c0' }}>Connecting to Maitri...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8ff', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7b9cff, #f07bc4)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(79,116,249,0.2)' }}>🌸</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1f3c' }}>Maitri <span style={{ color: '#9aa0c0', fontWeight: 400 }}>· {username}</span></div>
            <div style={{ fontSize: 12, color: '#9aa0c0' }}><span style={{ display: 'inline-block', width: 6, height: 6, background: '#22c55e', borderRadius: '50%', marginRight: 5 }} />Here with you · Listening</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '6px 12px', background: '#f0f4ff', border: '1.5px solid #e2e8ff', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#5a6080', cursor: 'pointer', outline: 'none' }}>
            <option value="en-IN">English</option>
            <option value="hi-IN">हिंदी</option>
          </select>
          <button onClick={() => router.push('/history')} style={ghostBtn}>History</button>
          <button onClick={logout} style={{ ...ghostBtn, color: '#9aa0c0', background: '#f0f4ff' }}>Sign out</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '100px 24px 220px', maxWidth: 760, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'msgIn 0.3s ease' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, marginTop: 2, background: msg.role === 'user' ? '#e8eeff' : 'linear-gradient(135deg, #7b9cff, #f07bc4)' }}>
              {msg.role === 'user' ? '👤' : '🌸'}
            </div>
            <div style={{
              maxWidth: '74%', padding: '14px 18px', fontSize: 15, lineHeight: 1.75,
              borderRadius: 18,
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 18,
              borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
              whiteSpace: 'pre-wrap',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #4f74f9, #3a5ee8)'
                : msg.is_crisis ? 'linear-gradient(135deg, #fff0f7, #fde8f5)' : 'white',
              color: msg.role === 'user' ? 'white' : '#1a1f3c',
              border: msg.role === 'user' ? 'none' : `1px solid ${msg.is_crisis ? '#f9c5e8' : '#e2e8ff'}`,
              boxShadow: msg.role === 'user' ? '0 4px 16px rgba(79,116,249,0.25)' : '0 2px 12px rgba(79,116,249,0.06)',
            }}>
              {msg.role === 'assistant' && (
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8, color: msg.is_crisis ? '#e855a8' : '#4f74f9' }}>
                  {msg.is_crisis ? '🌸 CRISIS SUPPORT' : 'MAITRI'}
                </div>
              )}
              {msg.content}
              {msg.is_crisis && msg.helplines && msg.helplines.length > 0 && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(232,85,168,0.08)', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e855a8', marginBottom: 8 }}>Talk to someone right now (Free)</div>
                  {msg.helplines.map((h, j) => <div key={j} style={{ fontSize: 13, color: '#1a1f3c', marginBottom: 4 }}>📞 {h}</div>)}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg, #7b9cff, #f07bc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🌸</div>
            <div style={{ padding: '14px 18px', background: 'white', border: '1px solid #e2e8ff', borderRadius: '18px 18px 18px 4px', boxShadow: '0 2px 12px rgba(79,116,249,0.06)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === 1 ? '#f07bc4' : '#7b9cff', animation: `bounce 1.4s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)', borderTop: '1px solid #e2e8ff', padding: '12px 24px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {QUICK_REPLIES.map((q, i) => (
              <button key={i} onClick={() => handleSend(q.replace(/^[^\s]+\s/, ''))} style={{ padding: '5px 12px', background: '#e8eeff', color: '#4f74f9', border: '1px solid #c7d4ff', borderRadius: 100, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {q}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Share what's on your mind... (Enter to send)"
              rows={2}
              style={{ flex: 1, padding: '13px 18px', background: '#f0f4ff', border: '1.5px solid #e2e8ff', borderRadius: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1a1f3c', resize: 'none', outline: 'none', lineHeight: 1.5, transition: 'border-color 0.2s, box-shadow 0.2s' }}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()} style={{ width: 50, height: 50, background: loading || !input.trim() ? '#c7d4ff' : 'linear-gradient(135deg, #4f74f9, #e855a8)', border: 'none', borderRadius: 14, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontSize: 20, boxShadow: loading || !input.trim() ? 'none' : '0 4px 16px rgba(79,116,249,0.3)', transition: 'all 0.2s', flexShrink: 0 }}>
              →
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#9aa0c0' }}>
            Not a replacement for professional care · Emergency: iCall 9152987821
          </div>
        </div>
      </div>

      <style>{`
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        textarea:focus { border-color: #7b9cff !important; box-shadow: 0 0 0 4px rgba(79,116,249,0.08) !important; }
        textarea::placeholder { color: #9aa0c0; }
      `}</style>
    </div>
  )
}

const ghostBtn: React.CSSProperties = { padding: '7px 16px', background: '#e8eeff', color: '#4f74f9', border: 'none', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer' }