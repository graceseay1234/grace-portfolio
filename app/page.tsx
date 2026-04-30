'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { projects } from '../lib/projects'
import ScamDetectorPreview from './ScamDetectorPreview'
import type { Project } from '../lib/projects'

type Mode = 'freelance' | 'professional'


const FLOWER_CLIP = (() => {
  const pts: string[] = []
  const n = 5, outer = 46, inner = 19, steps = 160
  for (let i = 0; i < steps; i++) {
    const a = (2 * Math.PI * i) / steps - Math.PI / 2
    const r = inner + (outer - inner) * Math.pow(Math.abs(Math.cos(n * a / 2)), 1.6)
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`)
  }
  return `polygon(${pts.join(',')})`
})()

type Particle = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; r: number; g: number; b: number }

function ParticleImage({ src, size = 200, accent }: { src: string; size?: number; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef(0)
  const SCALE = 2
  const STEP = 2

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const off = document.createElement('canvas')
      off.width = size; off.height = size
      const octx = off.getContext('2d')!
      const a = img.width / img.height
      if (a < 1) {
        const dh = size / a
        octx.drawImage(img, 0, 0, img.width, img.height, 0, -(dh - size) * 0.5, size, dh)
      } else {
        const dw = size * a
        octx.drawImage(img, 0, 0, img.width, img.height, -(dw - size) / 2, 0, dw, size)
      }
      const data = octx.getImageData(0, 0, size, size).data
      const pts: Particle[] = []
      for (let y = 0; y < size; y += STEP) {
        for (let x = 0; x < size; x += STEP) {
          const i = (y * size + x) * 4
          const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
          pts.push({ hx: x, hy: y, x: Math.random() * size, y: Math.random() * size, vx: 0, vy: 0, r: gray, g: gray, b: gray })
        }
      }
      particlesRef.current = pts
      cancelAnimationFrame(rafRef.current)
      loop()
    }
    img.src = src
    return () => cancelAnimationFrame(rafRef.current)
  }, [src, size])

  const loop = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = size * SCALE, H = size * SCALE
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#FAFAF8'
    ctx.fillRect(0, 0, W, H)
    const mouse = mouseRef.current
    for (const p of particlesRef.current) {
      p.vx += (p.hx - p.x) * 0.07
      p.vy += (p.hy - p.y) * 0.07
      if (mouse) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 30 && dist > 0) {
          const f = ((30 - dist) / 30) * 6
          p.vx += (dx / dist) * f
          p.vy += (dy / dist) * f
        }
      }
      p.vx *= 0.86; p.vy *= 0.86
      p.x += p.vx; p.y += p.vy
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`
      ctx.fillRect(p.x * SCALE, p.y * SCALE, STEP * SCALE * 0.75, STEP * SCALE * 0.75)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = { x: (e.clientX - rect.left) * (size / rect.width), y: (e.clientY - rect.top) * (size / rect.height) }
  }

  return (
    <canvas
      ref={canvasRef}
      width={size * SCALE}
      height={size * SCALE}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { mouseRef.current = null }}
      style={{ width: size, height: size, borderRadius: '42% 58% 62% 38% / 55% 35% 65% 45%', cursor: 'crosshair', display: 'block', touchAction: 'none', flexShrink: 0 }}
    />
  )
}

function ParticleText({ text, font, fontSize, color }: { text: string; font: string; fontSize: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef(0)
  const dimsRef = useRef({ w: 700, h: Math.ceil(fontSize * 1.4) + 10 })
  const SCALE = 2
  const STEP = 2

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await document.fonts.load(`${fontSize}px "${font}"`)
      if (cancelled) return
      const mc = document.createElement('canvas')
      mc.width = 1; mc.height = 1
      const mctx = mc.getContext('2d')!
      mctx.font = `${fontSize}px "${font}"`
      const w = Math.ceil(mctx.measureText(text).width) + 20
      const h = Math.ceil(fontSize * 1.4) + 10
      dimsRef.current = { w, h }
      const canvas = canvasRef.current
      if (!canvas || cancelled) return
      canvas.width = w * SCALE
      canvas.height = h * SCALE
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const off = document.createElement('canvas')
      off.width = w; off.height = h
      const octx = off.getContext('2d')!
      octx.font = `${fontSize}px "${font}"`
      octx.fillStyle = color
      octx.fillText(text, 10, fontSize)
      const data = octx.getImageData(0, 0, w, h).data
      const pts: Particle[] = []
      for (let y = 0; y < h; y += STEP) {
        for (let x = 0; x < w; x += STEP) {
          const idx = (y * w + x) * 4
          if (data[idx + 3] > 100) {
            pts.push({ hx: x, hy: y, x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: data[idx], g: data[idx + 1], b: data[idx + 2] })
          }
        }
      }
      particlesRef.current = pts
      cancelAnimationFrame(rafRef.current)
      loop()
    }
    run()
    return () => { cancelled = true; cancelAnimationFrame(rafRef.current) }
  }, [text, font, fontSize, color])

  const loop = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { w, h } = dimsRef.current
    ctx.clearRect(0, 0, w * SCALE, h * SCALE)
    const mouse = mouseRef.current
    for (const p of particlesRef.current) {
      p.vx += (p.hx - p.x) * 0.07
      p.vy += (p.hy - p.y) * 0.07
      if (mouse) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 30 && dist > 0) {
          const f = ((30 - dist) / 30) * 6
          p.vx += (dx / dist) * f
          p.vy += (dy / dist) * f
        }
      }
      p.vx *= 0.86; p.vy *= 0.86
      p.x += p.vx; p.y += p.vy
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`
      ctx.fillRect(p.x * SCALE, p.y * SCALE, STEP * SCALE * 0.75, STEP * SCALE * 0.75)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { w, h } = dimsRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = { x: (e.clientX - rect.left) * (w / rect.width), y: (e.clientY - rect.top) * (h / rect.height) }
  }

  return (
    <canvas
      ref={canvasRef}
      width={dimsRef.current.w * SCALE}
      height={dimsRef.current.h * SCALE}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { mouseRef.current = null }}
      style={{ width: dimsRef.current.w, height: dimsRef.current.h, cursor: 'crosshair', display: 'block', touchAction: 'none' }}
    />
  )
}

function FadeUp({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div data-fadeup ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`, height: '100%', ...style }}>
      {children}
    </div>
  )
}

function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    type Dot = { x: number; y: number; life: number; size: number; vx: number; vy: number }
    let dots: Dot[] = []
    let rafId = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const onMove = (e: MouseEvent) => {
      for (let i = 0; i < 5; i++) {
        dots.push({ x: e.clientX + (Math.random() - 0.5) * 10, y: e.clientY + (Math.random() - 0.5) * 10, life: 1, size: 1.5 + Math.random() * 2.5, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1 })
      }
    }
    window.addEventListener('mousemove', onMove)
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      dots = dots.filter(d => d.life > 0.02)
      for (const d of dots) {
        ctx.globalAlpha = d.life * 0.4
        ctx.fillStyle = '#2E2E2E'
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2)
        ctx.fill()
        d.x += d.vx; d.y += d.vy; d.life -= 0.04
      }
      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }} />
}

function AnimatedHills({ children, padLeft, padRight }: { children: React.ReactNode; padLeft: string; padRight: string }) {
  const bgRef = useRef<HTMLDivElement>(null)
  const cur = useRef({ x: 0, y: 0 })
  const tgt = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * -1
      const ny = (e.clientY / window.innerHeight - 0.5) * -1
      tgt.current = { x: nx * 30, y: ny * 18 }
    }
    window.addEventListener('mousemove', onMouse)

    const tick = () => {
      cur.current.x += (tgt.current.x - cur.current.x) * 0.07
      cur.current.y += (tgt.current.y - cur.current.y) * 0.07
      if (bgRef.current) {
        bgRef.current.style.transform = `translate(${cur.current.x}px, ${cur.current.y}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.removeEventListener('mousemove', onMouse)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      paddingLeft: padLeft,
      paddingRight: padRight,
      paddingTop: 32,
      paddingBottom: 80,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div ref={bgRef} style={{
        position: 'absolute',
        top: '-5%', left: '-5%',
        width: '110%', height: '110%',
        backgroundImage: 'url(/grass.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function ScrambleText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [display, setDisplay] = useState(text)
  useEffect(() => {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?,.'
    setDisplay(text.split('').map(c => c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]).join(''))
    let frame = 0
    const TOTAL = 22
    const id = setInterval(() => {
      frame++
      if (frame >= TOTAL) { setDisplay(text); clearInterval(id); return }
      const progress = frame / TOTAL
      setDisplay(text.split('').map((char, i) => {
        if (char === ' ') return ' '
        if (i / text.length < progress) return char
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }).join(''))
    }, 45)
    return () => clearInterval(id)
  }, [text])
  return <span style={style}>{display}</span>
}

const THEMES = {
  freelance: {
    dark:           false,
    bg:             '#FAFAF8',
    border:         '#E8E8E4',
    cardBg:         'white',
    cardBorder:     '#E8E8E4',
    text:           '#1A1A1A',
    muted:          '#777',
    faint:          '#BBB',
    accent:         '#2E2E2E',
    accentSoft:     'rgba(46,46,46,0.08)',
    emailBg:        '#1A1A1A',
    emailText:      'white',
    tagBg:          'rgba(0,0,0,0.05)',
    tagColor:       '#555',
    bentoPill:      { bg: 'white', text: '#333' },
    bentoFolder:    '#F0F0EE',
    bentoTitle:     '#F5F5F3',
    bentoEdu:       '#F0F0EE',
    bentoTitleText: '#1A1A1A',
    bentoSubText:   '#888',
    radius:         24,
  },
  professional: {
    dark:           false,
    bg:             '#FAFAF8',
    border:         '#EFEFED',
    cardBg:         'white',
    cardBorder:     '#EEEDE9',
    text:           '#1A1A1A',
    muted:          '#777',
    faint:          '#BBB',
    accent:         '#9BB898',
    accentSoft:     'rgba(155,184,152,0.15)',
    emailBg:        '#1A1A1A',
    emailText:      'white',
    tagBg:          'rgba(0,0,0,0.05)',
    tagColor:       '#666',
    bentoPill:      { bg: 'white', text: '#333' },
    bentoFolder:    '#B8C4D4',
    bentoTitle:     '#F5EFE6',
    bentoEdu:       '#EDE8E0',
    bentoTitleText: '#1A1A1A',
    bentoSubText:   '#999',
    radius:         16,
  },
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = THEMES[mode]
  return (
    <div style={{ display: 'inline-flex', position: 'relative', background: '#f0f0f0', borderRadius: 999, padding: 4, gap: 0 }}>
      <div style={{
        position: 'absolute', top: 4, bottom: 4,
        left: mode === 'freelance' ? 4 : 'calc(50% + 2px)',
        width: 'calc(50% - 6px)',
        background: '#fff', borderRadius: 999,
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        transition: 'left 0.22s ease',
        pointerEvents: 'none',
      }} />
      {(['freelance', 'professional'] as Mode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            position: 'relative', zIndex: 1,
            padding: '7px 18px', borderWidth: 0, background: 'none', outline: 'none',
            fontFamily: 'puffin-arcade-nerf, sans-serif',
            fontSize: 14, letterSpacing: '0.06em',
            color: mode === m ? '#111' : '#999',
            cursor: 'pointer', transition: 'color 0.22s ease', borderRadius: 999,
          }}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

function ProjectCard({ p, mode, angle = 'technical', index = 0 }: { p: Project; mode: Mode; angle?: 'creative' | 'technical'; index?: number }) {
  const t = THEMES[mode]
  const desc = angle === 'creative' && p.creativeDesc ? p.creativeDesc : p.shortDesc

  return (
    <Link
      href={`/work/${p.slug}`}
      style={{ display: 'block', borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${t.cardBorder}`, background: t.cardBg, textDecoration: 'none', color: 'inherit', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
    >
      <div style={{ height: 180, background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {!p.mockup && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '45%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: `shimmer 3.5s ease-in-out ${index * 0.6}s infinite`, pointerEvents: 'none' }} />
        )}
        {p.mockup ? (
          <img src={p.mockup} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 80%', display: 'block' }} />
        ) : (
          <span style={{ fontSize: 72, fontWeight: 700, color: p.textLight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)', fontFamily: 'puffin-arcade-nerf, sans-serif', userSelect: 'none', letterSpacing: '-2px' }}>
            {p.title.charAt(0)}
          </span>
        )}
      </div>
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: 0, lineHeight: 1.35, paddingRight: 12, color: t.text }}>
            {p.title}
          </h3>
          <span style={{ fontSize: 16, color: t.faint, flexShrink: 0, marginTop: 1 }}>→</span>
        </div>
        <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.65, margin: '0 0 14px' }}>{desc}</p>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {p.tags.map(tag => (
            <span key={tag} style={{ fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: t.tagBg, color: t.tagColor }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function ResearchCard({ p, mode }: { p: Project; mode: Mode }) {
  const t = THEMES[mode]
  const slides = p.slides ?? (p.mockup ? [p.mockup] : [])
  const hasSlides = slides.length > 0
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const accumRef = useRef(0)
  const lockedRef = useRef(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el || slides.length <= 1) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (lockedRef.current) return
      accumRef.current += e.deltaY
      if (Math.abs(accumRef.current) < 80) return
      const dir = accumRef.current > 0 ? 1 : -1
      accumRef.current = 0
      setActive(i => {
        const next = Math.max(0, Math.min(i + dir, slides.length - 1))
        if (next !== i) {
          setFading(true)
          lockedRef.current = true
          setTimeout(() => { lockedRef.current = false }, 600)
        }
        return next
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [slides.length])

  useEffect(() => {
    if (!fading) return
    const id = setTimeout(() => setFading(false), 200)
    return () => clearTimeout(id)
  }, [fading, active])

  if (!hasSlides) {
    /* Stat card fallback */
    if (p.slug === 'nlp-scam-detection') {
      return (
        <div style={{ borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${t.cardBorder}`, background: t.cardBg, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ScamDetectorPreview />
          </div>
          <div style={{ padding: '16px 18px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, lineHeight: 1.35, color: t.text }}>{p.title}</h3>
              <Link href={`/work/${p.slug}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: t.faint, flexShrink: 0, textDecoration: 'none', marginLeft: 8 }}>case study →</Link>
            </div>
            <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.6, margin: '0 0 12px' }}>{p.shortDesc}</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {p.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: t.tagBg, color: t.tagColor }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <Link
        href={`/work/${p.slug}`}
        style={{ display: 'block', borderRadius: t.radius, overflow: 'hidden', border: `1px solid ${t.cardBorder}`, background: t.cardBg, textDecoration: 'none', color: 'inherit', transition: 'transform 0.15s ease, box-shadow 0.15s ease', height: '100%' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
      >
        <div style={{ height: 4, background: p.gradient }} />
        <div style={{ padding: '22px 22px 20px' }}>
          {p.stat && (
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: 'puffin-arcade-nerf, sans-serif', fontSize: 38, fontWeight: 700, color: t.text, lineHeight: 1, display: 'block' }}>{p.stat}</span>
              <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.faint }}>{p.statLabel}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, lineHeight: 1.35, paddingRight: 12, color: t.text }}>{p.title}</h3>
            <span style={{ fontSize: 14, color: t.faint, flexShrink: 0 }}>→</span>
          </div>
          <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.6, margin: '0 0 14px' }}>{p.shortDesc}</p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {p.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: t.tagBg, color: t.tagColor }}>{tag}</span>
            ))}
          </div>
        </div>
      </Link>
    )
  }

  /* Slide deck card */
  const PEEK = 28        // visual translateY offset between stacked slides
  const RESERVE = 16    // reserved px per slot below front slide
  const MAX_SLOTS = Math.min(slides.length - 1, 2) // fixed — never changes

  return (
    <div ref={cardRef} style={{ color: 'inherit', cursor: 'default', borderRadius: t.radius, border: `1px solid ${t.cardBorder}`, overflow: 'hidden', height: '100%' }}>
      <Link href={`/work/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>

        {/* Stack — fixed height, contained within card, no background */}
        <div style={{
          position: 'relative',
          paddingBottom: MAX_SLOTS * RESERVE,
          background: 'transparent',
        }}>
          {/* Render back-to-front so front sits on top */}
          {[...slides].map((src, i) => {
            const offset = i - active
            if (offset < 0 || offset > 2) return null
            const isFront = offset === 0
            const inset = offset * 14 // px narrower per layer — no scale so peek is predictable
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: 48,
                  left: 16 + inset,
                  right: 16 + inset,
                  zIndex: 10 - offset,
                  transform: `translateY(${offset * PEEK}px)`,
                  transition: 'transform 0.35s cubic-bezier(0.34,1.2,0.64,1), filter 0.25s ease',
                  filter: `brightness(${1 - offset * 0.18})`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: isFront ? '0 6px 28px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.07)',
                }}
              >
                <img
                  src={src}
                  alt={`${p.title} slide ${i + 1}`}
                  style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
            )
          })}

          {/* Invisible spacer: top offset + slide height */}
          <div style={{ width: '100%', paddingTop: 48 }}>
            <div style={{ width: '100%', aspectRatio: '16/9', visibility: 'hidden' }} />
          </div>

          {/* Badges */}
          <div style={{ position: 'absolute', top: 12, left: 10, zIndex: 20 }}>
            <span style={{ background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4 }}>
              Presentation
            </span>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 10, zIndex: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            {slides.length > 1 && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>scroll</span>}
            <span style={{ background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: 9, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 4 }}>
              {active + 1} / {slides.length}
            </span>
          </div>
        </div>

        {/* Info section — card background, no border (outer card handles it) */}
        <div style={{
          background: t.cardBg,
          padding: '16px 18px 18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, lineHeight: 1.35, paddingRight: 12, color: t.text }}>{p.title}</h3>
            <span style={{ fontSize: 14, color: t.faint, flexShrink: 0 }}>→</span>
          </div>
          <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.6, margin: '0 0 12px' }}>{p.shortDesc}</p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {p.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: t.tagBg, color: t.tagColor }}>{tag}</span>
            ))}
          </div>
        </div>

      </Link>
    </div>
  )
}


function CreativeCard({ p, mode }: { p: Project; mode: Mode }) {
  return (
    <Link
      data-creative-card
      href={`/work/${p.slug}`}
      style={{
        display: 'flex',
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        background: '#FAF8F5',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.25s ease',
        minHeight: 240,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 40px rgba(0,0,0,0.13)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 20px rgba(0,0,0,0.07)' }}
    >
      {/* Image — left side, inset */}
      <div style={{ width: '44%', flexShrink: 0, padding: '12px 0 12px 12px' }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', height: '100%', background: p.gradient }}>
          {p.mockup ? (
            <img data-card-img src={p.mockup} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 72, fontWeight: 700, color: p.textLight ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.07)', fontFamily: 'puffin-arcade-nerf, sans-serif', letterSpacing: '-2px' }}>{p.title.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content — right side */}
      <div style={{ flex: 1, padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 8px' }}>{p.role}</p>
          <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.2, color: '#1f1f1f' }}>{p.title}</h3>
          <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, margin: 0 }}>{p.shortDesc}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {p.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 10, color: '#bbb', letterSpacing: '0.05em' }}>{tag}</span>
            ))}
          </div>
          <span style={{ fontSize: 20, color: '#ccc', flexShrink: 0 }}>→</span>
        </div>
      </div>
    </Link>
  )
}

function SectionHeader({ label, primary, mode }: { label: string; primary: boolean; mode: Mode }) {
  const t = THEMES[mode]
  const isMobile = useIsMobile()

  if (primary) {
    return (
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <p data-section-primary style={{ fontFamily: 'puffin-arcade-nerf, sans-serif', fontSize: isMobile ? 32 : 48, lineHeight: 1, margin: 0, color: t.muted }}>
            {label}
          </p>
        </div>
        <div style={{ height: 1, width: 64, background: t.border }} />
      </div>
    )
  }
  return (
    <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
      <p style={{ fontFamily: label.toLowerCase().includes('freelance') ? 'Splatink, sans-serif' : 'inherit', fontSize: label.toLowerCase().includes('freelance') ? 28 : 11, letterSpacing: label.toLowerCase().includes('freelance') ? 0 : '0.22em', textTransform: label.toLowerCase().includes('freelance') ? 'none' : 'uppercase', margin: 0, color: t.muted, flexShrink: 0 }}>
        {label}
      </p>
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  )
}

function DebugBadge() {
  const [info, setInfo] = useState('loading')
  useEffect(() => {
    const read = () => `${window.innerWidth}x${window.innerHeight}`
    setInfo(read())
    const id = setTimeout(() => setInfo(read()), 1000)
    return () => clearTimeout(id)
  }, [])
  return <div style={{ position: 'fixed', bottom: 8, right: 8, fontSize: 10, background: 'red', color: 'white', padding: '2px 6px', borderRadius: 4, zIndex: 99999, fontFamily: 'monospace' }}>{info}</div>
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('freelance')
  const isMobile = useIsMobile()
  const t = THEMES[mode]

  const freelance   = projects.filter(p => p.track === 'freelance')
  const engineering = projects.filter(p => p.track === 'engineering')
  const research    = projects.filter(p => p.track === 'research')

  return (
    <div style={{ background: t.bg, minHeight: '100vh', fontFamily: '"sarvatrik-bangla", sans-serif', color: t.text, transition: 'background 0.4s ease, color 0.4s ease' }}>

      {mode === 'freelance' && <CursorTrail />}

      {/* Nav */}
      <nav data-nav style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: isMobile ? '12px 20px' : '16px 48px', position: 'sticky', top: 0, background: t.bg, zIndex: 10, borderBottom: `1px solid ${t.border}`, transition: 'background 0.4s ease' }}>
        <span style={{ fontFamily: 'Splatink, sans-serif', fontSize: 26, fontWeight: 400, lineHeight: 1, color: t.text }}>grace</span>
        <div data-nav-links style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 8 }}>
          {(['work', 'experience', 'contact'] as const).map((link, i) => (
            <React.Fragment key={link}>
              {i > 0 && <span style={{ color: t.border, fontSize: 14 }}>·</span>}
              <a
                href={`#${link}`}
                style={{ fontFamily: 'puffin-arcade-nerf, sans-serif', fontSize: 14, color: t.muted, textDecoration: 'none', padding: '4px 10px', borderRadius: 6, transition: 'color 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = t.text)}
                onMouseLeave={e => (e.currentTarget.style.color = t.muted)}
              >
                {link}
              </a>
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a href="mailto:seay.ad@northeastern.edu" style={{ background: t.emailBg, color: t.emailText, padding: '8px 18px', borderRadius: 999, fontSize: 12, textDecoration: 'none', fontWeight: 500, transition: 'all 0.4s ease' }}>
            say hello
          </a>
        </div>
      </nav>

      <div data-content style={{ maxWidth: 1040, margin: '0 auto', padding: isMobile ? '28px 20px 80px' : '44px 48px 100px' }}>

        {/* Hero */}
        <section style={{ marginBottom: 52, paddingTop: 12 }}>
          {mode === 'freelance' ? (
            <div>
              <div data-hero-grid style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: isMobile ? 24 : 40, alignItems: 'center', marginBottom: 28 }}>
                <div style={{ overflow: 'visible', minWidth: 0 }}>
                  <div style={{ marginBottom: 28 }}>
                    <ModeToggle mode={mode} onChange={setMode} />
                  </div>
                  <h1 data-hero-h1 style={{ fontWeight: 400, margin: '0 0 8px', lineHeight: 1.1, color: '#2E2E2E', paddingBottom: 8, paddingRight: isMobile ? 0 : 12, overflow: 'visible', whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
                    <ScrambleText text="hello, i'm" style={{ fontFamily: 'puffin-arcade-nerf, sans-serif', fontSize: isMobile ? 28 : 36, display: 'block', color: t.muted }} />
                    <span data-particle-name style={{ display: 'block' }}>
                      <ParticleText text="Grace Seay" font="Splatink" fontSize={isMobile ? 68 : 110} color="#2E2E2E" />
                    </span>
                    <span data-particle-name-text style={{ display: 'none', fontFamily: 'Splatink, sans-serif', fontSize: 68, color: '#2E2E2E', lineHeight: 1 }}>Grace Seay</span>
                  </h1>
                  <p style={{ fontFamily: '"sarvatrik-bangla", sans-serif', fontSize: 16, fontWeight: 500, color: t.text, margin: '0 0 5px' }}>Full-Stack Developer & UX Designer</p>
                  <p style={{ fontSize: 13, color: t.faint, margin: '0 0 14px' }}><svg width="11" height="14" viewBox="0 0 11 14" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4, marginTop: -1 }}><path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 9.5 4.5 9.5S10 7.875 10 4.5C10 2.015 7.985 0 5.5 0Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" fill="currentColor"/></svg>Monroe, GA</p>
                  <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.7, margin: 0, maxWidth: 500 }}>I build full-stack products and design the experiences that make them feel human — from clinical research platforms to band websites to fintech tools.</p>
                </div>
                <div data-hero-img style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                  <span data-particle-img-canvas style={{ display: 'block' }}>
                    <ParticleImage src="/grace-profile.jpg" size={isMobile ? 200 : 280} accent={t.accent} />
                  </span>
                  <img data-particle-img-fallback src="/grace-profile.jpg" alt="Grace Seay" style={{ display: 'none', width: 200, height: 200, objectFit: 'cover', objectPosition: 'center 5%', borderRadius: '42% 58% 62% 38% / 55% 35% 65% 45%' }} />
                </div>
              </div>
              <div data-strip style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: isMobile ? 20 : 16, paddingTop: 20, borderTop: `1px solid ${t.border}` }}>
                <FadeUp delay={0}>
                  <div>
                    <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.faint, margin: '0 0 7px' }}>Currently</p>
                    <p style={{ fontSize: 14, color: t.muted, margin: 0, lineHeight: 1.6 }}><span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Software Engineer</span> @ syncIO Labs</p>
                  </div>
                </FadeUp>
                <FadeUp delay={120}>
                  <div>
                    <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.faint, margin: '0 0 7px' }}>Previously</p>
                    <p style={{ fontSize: 14, color: t.muted, margin: 0, lineHeight: 1.6 }}>Full Stack Developer @ <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Harvard Medical School</span></p>
                  </div>
                </FadeUp>
                <FadeUp delay={240}>
                  <div>
                    <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.faint, margin: '0 0 7px' }}>Education</p>
                    <p style={{ fontSize: 14, color: t.muted, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>B.S. Computer Science & Behavioral Neuroscience{'\n'}<span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Northeastern University</span></p>
                  </div>
                </FadeUp>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <img data-prof-photo src="/grace-profile.jpg" alt="Grace Seay" style={{ width: isMobile ? 80 : 110, height: isMobile ? 80 : 110, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 35%', flexShrink: 0 }} />
              <div>
                <div style={{ marginBottom: 10 }}>
                  <ModeToggle mode={mode} onChange={setMode} />
                </div>
                <h1 style={{ fontFamily: 'puffin-arcade-nerf, sans-serif', fontSize: 36, fontWeight: 400, margin: '0 0 4px', lineHeight: 1.1, color: t.text }}>Grace Seay</h1>
                <p style={{ fontSize: 15, fontWeight: 500, color: t.text, margin: '0 0 6px' }}>Full-Stack Developer & UX Designer</p>
                <p style={{ fontSize: 14, color: t.muted, margin: '0 0 3px' }}>Software Engineer @ syncIO Labs</p>
                <p style={{ fontSize: 14, color: t.muted, margin: '0 0 3px' }}>Previously @ Harvard Medical School, CHOIR at MGH</p>
                <p style={{ fontSize: 14, color: t.muted, margin: '0 0 3px' }}>B.S. CS & Behavioral Neuroscience, Northeastern</p>
                <p style={{ fontSize: 13, color: t.faint, margin: 0 }}><svg width="11" height="14" viewBox="0 0 11 14" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4, marginTop: -1 }}><path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 9.5 4.5 9.5S10 7.875 10 4.5C10 2.015 7.985 0 5.5 0Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" fill="currentColor"/></svg>Monroe, GA</p>
              </div>
            </div>
          )}
        </section>

        {/* What I do */}
        {mode === 'professional' && <FadeUp>
        <section data-what-i-do style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 72 }}>
          <div style={{ background: t.cardBg, borderRadius: t.radius, padding: '28px 28px', border: `1px solid ${t.cardBorder}` }}>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.faint, margin: '0 0 14px' }}>Clinical & Technical</p>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: '0 0 10px', lineHeight: 1.3 }}>Research-grade software for high-stakes environments</h3>
            <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.7, margin: '0 0 20px' }}>At Harvard Medical School and MGH, I built tools used in real clinical workflows — data pipelines, research UIs, and systems where accuracy isn't optional.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['React', 'Python', 'PostgreSQL', 'REDCap', 'Figma'].map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: t.tagBg, color: t.tagColor, fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ background: t.cardBg, borderRadius: t.radius, padding: '28px 28px', border: `1px solid ${t.cardBorder}` }}>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.faint, margin: '0 0 14px' }}>Creative & Product</p>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: '0 0 10px', lineHeight: 1.3 }}>Products and experiences people actually enjoy using</h3>
            <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.7, margin: '0 0 20px' }}>From fintech dashboards to band websites, I care about the feel as much as the function — design, motion, and copy included.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Next.js', 'TypeScript', 'Tailwind', 'Sanity', 'Stripe'].map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: t.tagBg, color: t.tagColor, fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
        </section>
        </FadeUp>}

        {/* Work sections */}
        {mode === 'freelance' ? (
          <>
            {/* 1. Freelance Websites */}
            <FadeUp>
            <section id="work" style={{ marginBottom: 72 }}>
              <SectionHeader label="freelance & websites" primary={true} mode={mode} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {freelance.map((p, i) => (
                  <FadeUp key={p.slug} delay={i * 80}>
                    <CreativeCard p={p} mode={mode} />
                  </FadeUp>
                ))}
              </div>
            </section>
            </FadeUp>

            {/* 2. Design & UX */}
            <FadeUp>
            <section style={{ marginBottom: 72 }}>
              <SectionHeader label="Design & UX" primary={false} mode={mode} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
                {engineering.map((p, i) => (
                  <FadeUp key={p.slug} delay={i * 80} style={{ gridColumn: `span ${p.span}` }}>
                    <ProjectCard p={p} mode={mode} angle="creative" index={i} />
                  </FadeUp>
                ))}
              </div>
            </section>
            </FadeUp>

            {/* 3. Research & Projects */}
            <FadeUp>
            <section style={{ marginBottom: 72 }}>
              <SectionHeader label="Research & Projects" primary={false} mode={mode} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
                {research.map((p, i) => (
                  <FadeUp key={p.slug} delay={i * 80}>
                    <ResearchCard p={p} mode={mode} />
                  </FadeUp>
                ))}
              </div>
            </section>
            </FadeUp>
          </>
        ) : (
          <>
            {/* 1. Engineering */}
            <FadeUp>
            <section id="work" style={{ marginBottom: 72 }}>
              <SectionHeader label="Engineering" primary={true} mode={mode} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
                {engineering.map((p, i) => (
                  <FadeUp key={p.slug} delay={i * 80} style={{ gridColumn: `span ${p.span}` }}>
                    <ProjectCard p={p} mode={mode} angle="technical" index={i} />
                  </FadeUp>
                ))}
              </div>
            </section>
            </FadeUp>

            {/* 2. Research & Projects */}
            <FadeUp>
            <section style={{ marginBottom: 72 }}>
              <SectionHeader label="Research & Projects" primary={false} mode={mode} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
                {research.map((p, i) => (
                  <FadeUp key={p.slug} delay={i * 80}>
                    <ResearchCard p={p} mode={mode} />
                  </FadeUp>
                ))}
              </div>
            </section>
            </FadeUp>

            {/* 3. Freelance (secondary) */}
            <FadeUp>
            <section style={{ marginBottom: 72 }}>
              <SectionHeader label="freelance & websites" primary={false} mode={mode} />
              {freelance.map((p, i) => (
                <FadeUp key={p.slug} delay={i * 80}>
                  <Link
                    href={`/work/${p.slug}`}
                    style={{ display: 'block', padding: '16px 0', borderBottom: `1px solid ${t.border}`, textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget.querySelectorAll('p')[0] as HTMLElement).style.textDecoration = 'underline' }}
                    onMouseLeave={e => { (e.currentTarget.querySelectorAll('p')[0] as HTMLElement).style.textDecoration = 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 15, margin: 0, color: t.text }}>{p.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                        <p style={{ fontSize: 13, color: t.faint, margin: 0, whiteSpace: 'nowrap' }}>{p.year}</p>
                        <span style={{ fontSize: 13, color: t.muted }}>→</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: t.muted, margin: '4px 0 0', lineHeight: 1.5 }}>{p.tags.slice(0, 4).join(' · ')}</p>
                  </Link>
                </FadeUp>
              ))}
            </section>
            </FadeUp>
          </>
        )}

        {/* Experience */}
        <FadeUp>
        <section id="experience" style={{ marginTop: 72 }}>
          <h2 style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: t.faint, marginBottom: 28 }}>Experience</h2>
          {[
            { role: 'Software Engineer',                  org: 'syncIO Labs',                          period: 'Jan 2026 – Present' },
            { role: 'UX Designer & Full Stack Developer', org: 'Harvard Medical School, CHOIR at MGH', period: 'Jan 2025 – Jan 2026' },
            { role: 'Frontend Development Co-op',         org: 'City of Pawtucket',                    period: 'Jul – Dec 2023' },
          ].map((e, i) => (
            <FadeUp key={e.org} delay={i * 80}>
            <div data-exp-row style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${t.border}`, gap: isMobile ? 2 : 0 }}>
              <div>
                <p style={{ fontSize: 15, margin: '0 0 3px', color: t.text }}>{e.role}</p>
                <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>{e.org}</p>
              </div>
              <p style={{ fontSize: 13, color: t.faint, whiteSpace: 'nowrap', margin: 0 }}>{e.period}</p>
            </div>
            </FadeUp>
          ))}
        </section>
        </FadeUp>

        {/* Contact */}
        <FadeUp>
        <section id="contact" style={{ marginTop: 72 }}>
          <h2 style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: t.faint, marginBottom: 20 }}>Get In Touch</h2>
          <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.8, marginBottom: 20 }}>
            Whether you need a website for your band, shop, or research lab — let&apos;s talk.
          </p>
          <a href="mailto:seay.ad@northeastern.edu" style={{ fontSize: 15, color: t.text, textDecoration: 'underline' }}>
            seay.ad@northeastern.edu
          </a>
        </section>
        </FadeUp>

      </div>
    </div>
  )
}
