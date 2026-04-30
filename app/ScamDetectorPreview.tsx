'use client'

import { useEffect, useRef, useState } from 'react'

const API = 'https://scam-detector-backend-bbff.onrender.com'

const SAMPLE = `Congratulations! You have been selected to receive a $500 Walmart gift card. Your account has been flagged for a special reward. Click the link below IMMEDIATELY to claim before it expires in 24 hours. Verify your billing information to receive your prize.`

type ModelResult = {
  verdict?: 'Scam' | 'Legitimate'
  scam_probability?: number
  error?: string
  offline?: boolean
}
type ApiResponse = {
  ensemble: { verdict: string; confidence: number; votes: string } | null
  models: {
    logistic_regression?: ModelResult
    svm?: ModelResult
    ffnn?: ModelResult
  }
}

const MODELS: { key: keyof ApiResponse['models']; label: string }[] = [
  { key: 'logistic_regression', label: 'LR' },
  { key: 'svm',                 label: 'SVM' },
  { key: 'ffnn',                label: 'FFNN' },
]

const C = {
  bg:      '#080808',
  surface: 'rgba(255,255,255,0.055)',
  border:  'rgba(255,255,255,0.10)',
  text:    '#F0F0F0',
  muted:   'rgba(232,232,232,0.45)',
  scam:    '#e05555',
  scamDim: 'rgba(224,85,85,0.14)',
  safe:    '#4caf7d',
  safeDim: 'rgba(76,175,125,0.14)',
  orange:  'rgba(210,65,0,0.32)',
}

export default function ScamDetectorPreview() {
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<ApiResponse | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [typed, setTyped]     = useState('')
  const [didType, setDidType] = useState(false)
  const textareaRef           = useRef<HTMLTextAreaElement>(null)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  // auto-type sample text on mount if user hasn't interacted
  useEffect(() => {
    if (didType) return
    let i = 0
    let cancelled = false
    const next = () => {
      if (cancelled || didType) return
      if (i <= SAMPLE.length) {
        const val = SAMPLE.slice(0, i)
        setTyped(val)
        if (textareaRef.current) textareaRef.current.value = val
        i++
        timerRef.current = setTimeout(next, 18)
      }
    }
    timerRef.current = setTimeout(next, 500)
    return () => { cancelled = true; if (timerRef.current) clearTimeout(timerRef.current) }
  }, [didType])

  const currentText = didType ? text : typed

  const analyze = async () => {
    const t = currentText.trim()
    if (!t || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 90000)
      let res: Response
      try {
        res = await fetch(`${API}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: t }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timer)
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `HTTP ${res.status}`)
      }
      setResult(await res.json())
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Request failed'
      setError(msg.includes('abort') || msg.includes('fetch') || msg.includes('Failed')
        ? 'Server warming up — try again in ~30s'
        : msg)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    setText('')
    setTyped('')
    setDidType(false)
    if (textareaRef.current) textareaRef.current.value = ''
  }

  const ensemble = result?.ensemble
  const isScam   = ensemble?.verdict === 'Scam'
  const hasText  = currentText.trim().length > 0

  return (
    <div style={{
      background: C.bg,
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* orange glow blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 340, height: 300, top: '-10%', left: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(210,65,0,0.22) 0%, transparent 65%)', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', width: 280, height: 260, bottom: '-10%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,45,0,0.16) 0%, transparent 65%)', filter: 'blur(30px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '14px 14px 12px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28CA40' }} />
            <span style={{ fontSize: 9, color: C.muted, marginLeft: 6, letterSpacing: '0.05em' }}>scam-detector — live demo</span>
          </div>
          {result && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); reset() }}
              style={{ fontSize: 9, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em' }}>
              reset
            </button>
          )}
        </div>

        {!result ? (
          <>
            {/* textarea — grows to fill space */}
            <div style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              backdropFilter: 'blur(20px)',
              marginBottom: 9,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <textarea
                ref={textareaRef}
                defaultValue=""
                placeholder="Paste a message to analyze…"
                onFocus={() => { if (!didType) { setDidType(true); if (timerRef.current) clearTimeout(timerRef.current) } }}
                onInput={e => { setDidType(true); setText((e.target as HTMLTextAreaElement).value) }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); e.stopPropagation(); analyze() } }}
                onClick={e => e.stopPropagation()}
                style={{
                  flex: 1, width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: C.text, fontSize: 10.5, lineHeight: 1.6, resize: 'none',
                  fontFamily: 'inherit', padding: '10px 12px',
                }}
              />
            </div>

            {/* analyze button — pinned at bottom */}
            <button
              disabled={!hasText || loading}
              onClick={e => { e.preventDefault(); e.stopPropagation(); analyze() }}
              style={{
                flexShrink: 0, width: '100%', padding: '8px 0', borderRadius: 7, border: 'none',
                cursor: hasText && !loading ? 'pointer' : 'default',
                background: hasText && !loading ? '#F0F0F0' : 'rgba(255,255,255,0.07)',
                color: hasText && !loading ? '#111' : C.muted,
                fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'inherit',
                fontWeight: 600, transition: 'background 0.2s, color 0.2s',
              }}
            >
              {loading ? 'analyzing…' : 'analyze'}
            </button>

            {error && (
              <div style={{ marginTop: 8, fontSize: 10, color: C.scam, lineHeight: 1.5, flexShrink: 0 }}>{error}</div>
            )}
          </>
        ) : (
          <>
            {/* ensemble verdict */}
            {ensemble && (
              <div style={{
                background: isScam ? C.scamDim : C.safeDim,
                border: `1px solid ${isScam ? 'rgba(224,85,85,0.2)' : 'rgba(76,175,125,0.2)'}`,
                borderRadius: 8, padding: '10px 12px', marginBottom: 9, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isScam ? C.scam : C.safe, letterSpacing: '0.06em' }}>
                    {ensemble.verdict.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                    {ensemble.votes} models · {Math.round(ensemble.confidence * 100)}% confidence
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: isScam ? C.scam : C.safe, fontFamily: 'inherit' }}>
                  {Math.round(ensemble.confidence * 100)}%
                </div>
              </div>
            )}

            {/* model bars — grow to fill remaining space */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
              {MODELS.map(({ key, label }) => {
                const m = result.models[key]
                if (!m || m.error || m.scam_probability === undefined) return null
                const pct = Math.round(m.scam_probability * 100)
                const sc  = m.verdict === 'Scam'
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, color: C.muted, width: 30, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: sc ? C.scam : C.safe,
                        borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                    </div>
                    <span style={{ fontSize: 9, color: sc ? C.scam : C.safe, width: 28, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
