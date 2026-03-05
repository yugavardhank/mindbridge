'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, getTranscript } from '../../lib/api'

export default function HistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [transcript, setTranscript] = useState<any | null>(null)
  const [loadingTranscript, setLoadingTranscript] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('mb_token')
    if (!token) { router.push('/'); return }
    getHistory().then(data => {
      const seen = new Set()
      const unique = data.filter((s: any) => {
        if (seen.has(s.session_id)) return false
        seen.add(s.session_id); return true
      })
      setSessions(unique)
    }).finally(() => setLoading(false))
  }, [])

  const toIST = (d: string) => {
    const ist = new Date(new Date(d).getTime() + 5.5 * 60 * 60 * 1000)
    return ist.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'
  }

  const openSession = async (s: any) => {
    setSelected(s); setLoadingTranscript(true); setTranscript(null)
    try { setTranscript(await getTranscript(s.session_id)) }
    catch { setTranscript({ messages: [] }) }
    finally { setLoadingTranscript(false) }
  }

  // ── Transcript View ────────────────────────────────────────────────────────
  if (selected) return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8ff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => { setSelected(null); setTranscript(null) }} style={{ padding: '7px 16px', background: '#e8eeff', color: '#4f74f9', border: 'none', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ fontSize: 13, color: '#9aa0c0' }}>{toIST(selected.started_at)}</div>
        </div>
        {selected.is_crisis_flagged && <span style={{ fontSize: 12, color: '#e855a8', fontWeight: 500 }}>🌸 Crisis support provided</span>}
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {loadingTranscript && <div style={{ textAlign: 'center', color: '#9aa0c0', fontSize: 13, marginTop: 60 }}>Loading transcript...</div>}
        {transcript?.messages?.length === 0 && <div style={{ textAlign: 'center', color: '#9aa0c0', fontSize: 13, marginTop: 60 }}>No messages in this session.</div>}
        {transcript?.messages?.map((msg: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, marginTop: 2, background: msg.role === 'user' ? '#e8eeff' : 'linear-gradient(135deg, #7b9cff, #f07bc4)' }}>
              {msg.role === 'user' ? '👤' : '🌸'}
            </div>
            <div style={{ maxWidth: '74%', padding: '14px 18px', fontSize: 15, lineHeight: 1.75, borderRadius: 18, borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 18, borderBottomRightRadius: msg.role === 'user' ? 4 : 18, whiteSpace: 'pre-wrap', background: msg.role === 'user' ? 'linear-gradient(135deg, #4f74f9, #3a5ee8)' : 'white', color: msg.role === 'user' ? 'white' : '#1a1f3c', border: msg.role === 'user' ? 'none' : '1px solid #e2e8ff', boxShadow: '0 2px 8px rgba(79,116,249,0.07)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6, color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#4f74f9' }}>
                {msg.role === 'user' ? 'YOU' : 'MAITRI'}
              </div>
              {msg.content}
              <div style={{ fontSize: 11, color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#9aa0c0', marginTop: 8 }}>{toIST(msg.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Session List View ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8ff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: '#1a1f3c', letterSpacing: -0.3 }}>Your Sessions</div>
        <button onClick={() => router.push('/consultation')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #4f74f9, #3a5ee8)', color: 'white', border: 'none', borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,116,249,0.3)' }}>
          + New Session
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 60px' }}>
        {!loading && <div style={{ fontSize: 12, color: '#9aa0c0', marginBottom: 20, fontWeight: 500 }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} · Click to view transcript · Times in IST</div>}
        {loading && <div style={{ color: '#9aa0c0', fontSize: 13, textAlign: 'center', marginTop: 60 }}>Loading...</div>}

        {!loading && sessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1a1f3c', marginBottom: 8 }}>No sessions yet</div>
            <div style={{ fontSize: 14, color: '#9aa0c0' }}>Start your first conversation with Maitri</div>
          </div>
        )}

        {sessions.map(s => (
          <div key={s.session_id} onClick={() => openSession(s)}
            style={{ background: s.is_crisis_flagged ? 'linear-gradient(135deg, #fff, #fff8fd)' : 'white', border: `1px solid ${s.is_crisis_flagged ? '#f9c5e8' : '#e2e8ff'}`, borderRadius: 16, padding: '18px 22px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(79,116,249,0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,116,249,0.13)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = s.is_crisis_flagged ? '#f07bc4' : '#7b9cff' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,116,249,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = s.is_crisis_flagged ? '#f9c5e8' : '#e2e8ff' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: s.is_crisis_flagged ? '#fde8f5' : '#e8eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {s.is_crisis_flagged ? '🌸' : '💬'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1f3c', marginBottom: 5 }}>{toIST(s.started_at)}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', background: s.is_crisis_flagged ? '#fde8f5' : '#e8eeff', color: s.is_crisis_flagged ? '#e855a8' : '#4f74f9' }}>
                    {s.is_crisis_flagged ? 'Crisis' : s.channel}
                  </span>
                  <span style={{ fontSize: 12, color: '#9aa0c0' }}>{s.is_crisis_flagged ? 'Support provided · Helpline shown' : 'Completed'}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 22, color: s.is_crisis_flagged ? '#f07bc4' : '#7b9cff', flexShrink: 0 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}