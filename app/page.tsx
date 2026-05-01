'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { projects } from '../lib/projects'
import type { Project } from '../lib/projects'

type Mode = 'freelance' | 'professional'

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
          const alpha = data[i + 3]
          const gray = alpha < 180
            ? 17
            : Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
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
    ctx.clearRect(0, 0, size * SCALE, size * SCALE)
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
      style={{ width: size, height: size, borderRadius: '42% 58% 62% 38% / 55% 35% 65% 45%', cursor: 'crosshair', display: 'block', touchAction: 'none', flexShrink: 0, WebkitMaskImage: 'radial-gradient(ellipse 88% 88% at 50% 50%, black 60%, transparent 100%)', maskImage: 'radial-gradient(ellipse 88% 88% at 50% 50%, black 60%, transparent 100%)' }}
    />
  )
}

function ParticleText({ text, font, fontSize }: { text: string; font: string; fontSize: number; color?: string }) {
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
      canvas.width = w * SCALE; canvas.height = h * SCALE
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      const off = document.createElement('canvas')
      off.width = w; off.height = h
      const octx = off.getContext('2d')!
      octx.font = `${fontSize}px "${font}"`
      octx.fillStyle = '#000'
      octx.fillText(text, 10, fontSize)
      const data = octx.getImageData(0, 0, w, h).data
      const pts: Particle[] = []
      for (let y = 0; y < h; y += STEP) {
        for (let x = 0; x < w; x += STEP) {
          const idx = (y * w + x) * 4
          if (data[idx + 3] > 100) {
            pts.push({ hx: x, hy: y, x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: 46, g: 46, b: 46 })
          }
        }
      }
      particlesRef.current = pts
      cancelAnimationFrame(rafRef.current)
      loop()
    }
    run()
    return () => { cancelled = true; cancelAnimationFrame(rafRef.current) }
  }, [text, font, fontSize])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const { w, h } = dimsRef.current
      const lx = (e.clientX - rect.left) * (w / rect.width)
      const ly = (e.clientY - rect.top) * (h / rect.height)
      mouseRef.current = (lx > -200 && lx < w + 200 && ly > -200 && ly < h + 200)
        ? { x: lx, y: ly } : null
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const loop = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { w, h } = dimsRef.current
    ctx.clearRect(0, 0, w * SCALE, h * SCALE)
    const mouse = mouseRef.current
    const REPEL_R = 90, REPEL_F = 16
    for (const p of particlesRef.current) {
      p.vx += (p.hx - p.x) * 0.07
      p.vy += (p.hy - p.y) * 0.07
      if (mouse) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_R && dist > 0) {
          const f = ((REPEL_R - dist) / REPEL_R) * REPEL_F
          p.vx += (dx / dist) * f; p.vy += (dy / dist) * f
        }
      }
      p.vx *= 0.88; p.vy *= 0.88
      p.x += p.vx; p.y += p.vy
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`
      ctx.fillRect(p.x * SCALE, p.y * SCALE, STEP * SCALE * 0.85, STEP * SCALE * 0.85)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  return (
    <canvas ref={canvasRef}
      width={dimsRef.current.w * SCALE} height={dimsRef.current.h * SCALE}
      style={{ width: dimsRef.current.w, height: dimsRef.current.h, display: 'block', touchAction: 'none' }} />
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
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

function CustomCursor() {
  useEffect(() => {
    // Build everything with vanilla JS appended to body — React never touches these elements
    const styleTag = document.createElement('style')
    styleTag.textContent = '* { cursor: none !important; }'
    document.head.appendChild(styleTag)

    const arrow = document.createElement('img')
    arrow.src = '/cursor-arrow.jpg'
    Object.assign(arrow.style, {
      position: 'fixed', top: '0', left: '0',
      width: '34px', height: '34px', objectFit: 'contain',
      pointerEvents: 'none', zIndex: '99999',
      opacity: '0', mixBlendMode: 'multiply',
      transition: 'opacity 0.2s ease',
      willChange: 'transform',
    })
    document.body.appendChild(arrow)

    const lm = document.createElement('img')
    lm.src = '/cursor-learnmore.png'
    Object.assign(lm.style, {
      position: 'fixed', top: '0', left: '0',
      width: '68px',
      pointerEvents: 'none', zIndex: '99999',
      opacity: '0',
      transform: 'translate(-50%, -50%) scale(0.85)',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    })
    document.body.appendChild(lm)

    let cx = -500, cy = -500, isCard = false

    const onMove = (e: MouseEvent) => {
      cx = e.clientX; cy = e.clientY
      arrow.style.transform = `translate(${cx}px, ${cy}px)`
      lm.style.left = `${cx}px`
      lm.style.top = `${cy}px`
      if (!isCard) arrow.style.opacity = '1'
    }
    const onOver = (e: MouseEvent) => {
      isCard = !!(e.target as HTMLElement).closest('[data-project-card]')
      arrow.style.opacity = isCard ? '0' : '1'
      lm.style.opacity = isCard ? '1' : '0'
      lm.style.transform = `translate(-50%, -50%) scale(${isCard ? 1 : 0.85})`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)

    return () => {
      document.head.removeChild(styleTag)
      document.body.removeChild(arrow)
      document.body.removeChild(lm)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
    }
  }, [])

  return null
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
    bg:         '#FAFAF8',
    border:     '#E8E8E4',
    cardBg:     '#FFFFFF',
    cardBorder: '#EBEBЕ7',
    text:       '#1A1A1A',
    muted:      '#777',
    faint:      '#BBB',
    accent:     '#2E2E2E',
    emailBg:    '#1A1A1A',
    emailText:  'white',
    tagBg:      'rgba(0,0,0,0.05)',
    tagColor:   '#666',
    radius:     12,
  },
  professional: {
    bg:         '#FAFAF8',
    border:     '#EFEFED',
    cardBg:     '#FFFFFF',
    cardBorder: '#EBEBEB',
    text:       '#1A1A1A',
    muted:      '#777',
    faint:      '#BBB',
    accent:     '#9BB898',
    emailBg:    '#1A1A1A',
    emailText:  'white',
    tagBg:      'rgba(0,0,0,0.05)',
    tagColor:   '#666',
    radius:     12,
  },
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div style={{ display: 'inline-flex', position: 'relative', background: 'rgba(0,0,0,0.05)', borderRadius: 999, padding: 3, gap: 0 }}>
      <div style={{
        position: 'absolute', top: 3, bottom: 3,
        left: mode === 'freelance' ? 3 : 'calc(50% + 1px)',
        width: 'calc(50% - 4px)',
        background: '#fff', borderRadius: 999,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'left 0.22s ease',
        pointerEvents: 'none',
      }} />
      {(['freelance', 'professional'] as Mode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            position: 'relative', zIndex: 1,
            padding: '6px 16px', border: 'none', background: 'none', outline: 'none',
            fontSize: 12, letterSpacing: '0.04em',
            color: mode === m ? '#111' : '#999',
            cursor: 'pointer', transition: 'color 0.2s ease', borderRadius: 999,
          }}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

function ProjectCard({ p, mode, coverOnly = false }: { p: Project; mode: Mode; coverOnly?: boolean }) {
  const t = THEMES[mode]
  const slides = p.slides ?? []
  const hasSlides = !coverOnly && slides.length > 1
  const [slideIdx, setSlideIdx] = useState(0)
  const slideIdxRef = useRef(0)
  const imgRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const isExitingRef = useRef(false)
  const exitDirRef = useRef<1 | -1>(1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { slideIdxRef.current = slideIdx }, [slideIdx])

  const advance = useCallback((dir: 1 | -1) => {
    if (isExitingRef.current) return
    const curr = slideIdxRef.current
    const next = curr + dir
    if (next < 0 || next >= slides.length) return
    exitDirRef.current = dir
    isExitingRef.current = true
    setIsExiting(true)
    timerRef.current = setTimeout(() => {
      isExitingRef.current = false
      setIsExiting(false)
      slideIdxRef.current = next
      setSlideIdx(next)
    }, 220)
  }, [slides.length])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  useEffect(() => {
    if (!hasSlides) return
    const el = cardRef.current
    if (!el) return
    const slideCount = slides.length
    const onWheel = (e: WheelEvent) => {
      const curr = slideIdxRef.current
      if (e.deltaY > 3 && curr < slideCount - 1) {
        e.preventDefault(); advance(1)
      } else if (e.deltaY < -3 && curr > 0) {
        e.preventDefault(); advance(-1)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [hasSlides, p.slides, advance])

  const getCardStyle = (i: number): React.CSSProperties => {
    const relIdx = i - slideIdx
    const dir = exitDirRef.current
    const spring = 'transform 0.35s cubic-bezier(0.34, 1.15, 0.64, 1), opacity 0.3s ease'
    const quick  = 'transform 0.2s ease-in, opacity 0.15s ease-in'
    const smooth = 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.28s ease'

    if ((relIdx < 0 && !(isExiting && dir === -1 && relIdx === -1)) || relIdx >= 3) {
      return { opacity: 0, zIndex: 0, pointerEvents: 'none', transition: smooth }
    }
    // Forward exit: front card slips up and off
    if (isExiting && dir === 1 && relIdx === 0) {
      return { zIndex: 10, opacity: 1, transform: 'translateY(-108%) rotate(-4deg)', transition: quick, pointerEvents: 'none' }
    }
    // Backward exit: front card sinks back to second position
    if (isExiting && dir === -1 && relIdx === 0) {
      return { zIndex: 3, opacity: 0.75, transform: 'translateY(8px) scaleX(0.97)', transition: quick, pointerEvents: 'none' }
    }
    // Backward enter: previous card fades in at front
    if (isExiting && dir === -1 && relIdx === -1) {
      return { zIndex: 10, opacity: 1, transform: 'none', transition: spring }
    }

    const eff = (isExiting && dir === 1) ? relIdx - 1 : relIdx
    const tr = isExiting ? spring : smooth

    // Collapsed (rest): back cards peek as thin strips below the front
    // Expanded (hover): back cards fan out revealing more of each card
    switch (eff) {
      case 0: return {
        zIndex: 10, opacity: 1, transform: 'none', transition: tr,
      }
      case 1: return {
        zIndex: 5, opacity: hovered ? 0.85 : 0.72,
        transform: hovered ? 'translateY(38px) scaleX(0.97)' : 'translateY(8px) scaleX(0.97)',
        transition: tr,
      }
      case 2: return {
        zIndex: 2, opacity: hovered ? 0.65 : 0.50,
        transform: hovered ? 'translateY(72px) scaleX(0.94)' : 'translateY(14px) scaleX(0.94)',
        transition: tr,
      }
      default: return { opacity: 0, zIndex: 0, pointerEvents: 'none', transition: smooth }
    }
  }

  const singleSrc = !hasSlides ? (p.mockup ?? slides[0]) : null

  return (
    <Link
      href={`/work/${p.slug}`}
      data-project-card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      {hasSlides ? (
        <div ref={cardRef} style={{ position: 'relative', aspectRatio: '16/10', marginBottom: 86 }}>
          {slides.map((src, i) => {
            const relIdx = i - slideIdx
            if (relIdx < -1 || relIdx >= 4) return null
            return (
              <div
                key={src}
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 16, overflow: 'hidden', background: p.gradient, ...getCardStyle(i) }}
              >
                <img src={src} alt={`${p.title} ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              </div>
            )
          })}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 20, pointerEvents: 'none' }}>
            {slides.map((_, i) => (
              <div key={i} style={{ height: 5, borderRadius: 3, width: i === slideIdx ? 18 : 5, background: 'rgba(255,255,255,0.85)', transition: 'width 0.35s ease' }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <div style={{ position: 'relative', zIndex: 2, width: '100%', aspectRatio: '16/10', borderRadius: 16, overflow: 'hidden', background: p.gradient }}>
            {(p.slug === 'nlp-scam-detection' || p.slug === 'intension') ? (<>
              {/* Back image — slides right on hover */}
              <img src={p.slug === 'intension' ? '/intension-phone.png' : '/nlp-back.png'} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'contain', objectPosition: 'center',
                zIndex: 1,
                transform: p.slug === 'intension'
                  ? (hovered ? 'translateX(-24%) translateY(-4%)' : 'translateX(-20%) translateY(-4%)')
                  : (hovered ? 'translateX(18%) translateY(-6%)' : 'translateX(6%) translateY(-6%)'),
                transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }} />
              {/* Front image — slides left on hover */}
              <img src={p.slug === 'intension' ? '/intension-laptop.png' : '/nlp-front.png'} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'contain', objectPosition: 'center',
                zIndex: 2,
                transform: p.slug === 'intension'
                  ? (hovered ? 'translateX(9%) translateY(2%)' : 'translateX(6%) translateY(2%)')
                  : (hovered ? 'translateX(-18%)' : 'translateX(0)'),
                transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }} />
            </>) : (
              <div ref={imgRef} style={{ width: '100%', height: '100%', transition: 'transform 0.5s ease', transform: p.slug === 'ace-wellness' ? (hovered ? 'scale(1.9)' : 'scale(1.8)') : (hovered ? 'scale(1.03)' : 'scale(1)') }}>
                {singleSrc && <img src={singleSrc} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.slug === 'harvard-choir' ? 'center 20%' : 'center top', display: 'block' }} />}
              </div>
            )}
          </div>
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 3px', color: t.text, lineHeight: 1.3 }}>{p.title}</p>
      <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>{p.role}</p>
    </Link>
  )
}


function GroupLabel({ label, mode }: { label: string; mode: Mode }) {
  const t = THEMES[mode]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.02em', color: t.faint, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  )
}

function HScroll({ children, offset }: { children: React.ReactNode; offset: number }) {
  return (
    <div
      data-hscroll
      style={{
        display: 'flex',
        gap: 20,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollPaddingLeft: offset,
        paddingLeft: offset,
        paddingRight: 60,
        paddingTop: 80,
        paddingBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('freelance')
  const isMobile = useIsMobile()
  const t = THEMES[mode]
  const contentRef = useRef<HTMLDivElement>(null)
  const [hscrollOffset, setHscrollOffset] = useState(48)
  const [cardW, setCardW] = useState(560)

  useEffect(() => {
    // offset = centering margin + content padding
    // = max(0, (vw - 960) / 2) + pad
    // = max(pad, vw/2 - 432)   where 432 = 960/2 - 48
    const compute = () => {
      const pad = window.innerWidth < 640 ? 20 : 48
      const offset = Math.max(pad, Math.round(window.innerWidth / 2) - 432)
      setHscrollOffset(offset)
      setCardW(window.innerWidth < 640 ? Math.round(window.innerWidth * 0.82) : 560)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  const websiteOrder = ['intension', 'nlp-scam-detection', 'harvard-choir', 'ace-wellness', 'pawtucket']
  const websites = websiteOrder.flatMap(slug => projects.filter(p => p.slug === slug))
  const engineering = projects.filter(p => p.track === 'engineering' && !['harvard-choir', 'pawtucket'].includes(p.slug))
  const research    = projects.filter(p => p.track === 'research' && p.slug !== 'nlp-scam-detection')
  const branding    = projects.filter(p => p.track === 'branding')

  const groups = [
    { label: 'Websites',            items: websites,    coverOnly: true  },
    { label: 'Presentations',        items: research,    coverOnly: false },
    { label: 'Logo & Branding',     items: branding,    coverOnly: false },
    { label: 'Engineering',         items: engineering, coverOnly: false },
  ]

  return (
    <div style={{ background: t.bg, minHeight: '100vh', fontFamily: '"Satoshi", "Inter", sans-serif', color: t.text, transition: 'background 0.4s ease, color 0.4s ease' }}>

      <CustomCursor />

      {/* Nav */}
      <nav style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: isMobile ? '12px 20px' : '16px 48px', position: 'sticky', top: 0, background: t.bg, zIndex: 10, borderBottom: `1px solid ${t.border}`, transition: 'background 0.4s ease' }}>
        <span style={{ fontFamily: 'Splatink, sans-serif', fontSize: 24, fontWeight: 400, lineHeight: 1, color: t.text }}>grace</span>
        <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 6 }}>
          {(['work', 'experience', 'contact'] as const).map((link, i) => (
            <React.Fragment key={link}>
              {i > 0 && <span style={{ color: t.border, fontSize: 14 }}>·</span>}
              <a
                href={`#${link}`}
                style={{ fontSize: 13, color: t.muted, textDecoration: 'none', padding: '4px 10px', borderRadius: 6, transition: 'color 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = t.text)}
                onMouseLeave={e => (e.currentTarget.style.color = t.muted)}
              >{link}</a>
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a href="mailto:seay.ad@northeastern.edu" style={{ background: t.emailBg, color: t.emailText, padding: '7px 16px', borderRadius: 999, fontSize: 12, textDecoration: 'none', fontWeight: 500, transition: 'opacity 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
          >say hello</a>
        </div>
      </nav>

      {/* Top content: hero + work heading */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '32px 20px 0' : '52px 48px 0' }}>

        {/* Hero */}
        <section style={{ marginBottom: 72 }}>
          {mode === 'freelance' ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 260px', gap: isMobile ? 32 : 48, alignItems: 'center', marginBottom: 40 }}>
                <div style={{ overflow: 'visible', minWidth: 0 }}>
                  <div style={{ marginBottom: 20 }}>
                    <ModeToggle mode={mode} onChange={setMode} />
                  </div>
                  <h1 style={{ fontWeight: 400, margin: '0 0 12px', lineHeight: 1.1, overflow: 'visible', whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
                    <ScrambleText text="hello, i'm" style={{ fontSize: isMobile ? 22 : 26, display: 'block', color: t.muted, letterSpacing: '0.01em' }} />
                    <span style={{ display: 'block' }}>
                      <ParticleText text="Grace Seay" font="Splatink" fontSize={isMobile ? 68 : 108} color="#2E2E2E" />
                    </span>
                  </h1>
                  <p style={{ fontSize: 15, fontWeight: 500, color: t.text, margin: '0 0 5px' }}>Full-Stack Developer & UX Designer</p>
                  <p style={{ fontSize: 13, color: t.faint, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="13" viewBox="0 0 11 14" fill="none"><path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 9.5 4.5 9.5S10 7.875 10 4.5C10 2.015 7.985 0 5.5 0Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" fill="currentColor"/></svg>
                    Monroe, GA
                  </p>
                  <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.75, margin: 0, maxWidth: 480 }}>
                    I build full-stack products and design the experiences that make them feel human — from clinical research platforms to band websites to fintech tools.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                  <ParticleImage src="/grace-profile-nobg.png" size={isMobile ? 180 : 260} accent={t.accent} />
                </div>
              </div>

              {/* Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 10, borderTop: `1px solid ${t.border}`, paddingTop: 24 }}>
                {[
                  { label: 'Currently', body: 'Software Engineer @ syncIO Labs' },
                  { label: 'Previously', body: 'Full Stack Developer @ Harvard Medical School' },
                  { label: 'Education', body: 'B.S. CS & Behavioral Neuroscience, Northeastern' },
                ].map((item, i) => (
                  <FadeUp key={item.label} delay={i * 100}>
                    <div>
                      <p style={{ fontSize: 11, letterSpacing: '0.01em', color: t.faint, margin: '0 0 6px' }}>{item.label}</p>
                      <p style={{ fontSize: 13, color: t.muted, margin: 0, lineHeight: 1.6 }}>{item.body}</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <img src="/grace-profile-nobg.png" alt="Grace Seay" style={{ width: isMobile ? 72 : 100, height: isMobile ? 72 : 100, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 35%', flexShrink: 0 }} />
              <div>
                <div style={{ marginBottom: 12 }}>
                  <ModeToggle mode={mode} onChange={setMode} />
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 500, margin: '0 0 4px', lineHeight: 1.1, color: t.text }}>Grace Seay</h1>
                <p style={{ fontSize: 14, fontWeight: 500, color: t.text, margin: '0 0 6px' }}>Full-Stack Developer & UX Designer</p>
                <p style={{ fontSize: 13, color: t.muted, margin: '0 0 2px' }}>Software Engineer @ syncIO Labs</p>
                <p style={{ fontSize: 13, color: t.muted, margin: '0 0 2px' }}>Previously @ Harvard Medical School, CHOIR at MGH</p>
                <p style={{ fontSize: 13, color: t.muted, margin: '0 0 2px' }}>B.S. CS & Behavioral Neuroscience, Northeastern</p>
                <p style={{ fontSize: 12, color: t.faint, margin: 0, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <svg width="10" height="13" viewBox="0 0 11 14" fill="none"><path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 9.5 4.5 9.5S10 7.875 10 4.5C10 2.015 7.985 0 5.5 0Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" fill="currentColor"/></svg>
                  Monroe, GA
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Work heading */}
        <FadeUp>
          <div id="work">
            <h2 style={{ fontSize: 12, letterSpacing: '0.01em', color: t.faint, margin: '0 0 2px' }}>Work</h2>
            <div style={{ height: 1, width: 40, background: t.border }} />
          </div>
        </FadeUp>

      </div>

      {/* Work groups — outside the maxWidth wrapper so each row is naturally full-width */}
      {groups.map(({ label, items, coverOnly }) => (
        <FadeUp key={label} style={{ marginTop: 40, marginBottom: 8 }}>
          {/* Label aligned to content column */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '0 20px 16px' : '0 48px 16px' }}>
            <GroupLabel label={label} mode={mode} />
          </div>
          {/* Scroll row — full page width, spacer handles left alignment */}
          <HScroll offset={hscrollOffset}>
            {items.map(p => (
              <div key={p.slug} style={{ width: cardW, flexShrink: 0, scrollSnapAlign: 'start' }}>
                <ProjectCard p={p} mode={mode} coverOnly={coverOnly} />
              </div>
            ))}
          </HScroll>
        </FadeUp>
      ))}

      {/* Bottom content: experience + contact */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '60px 20px 100px' : '80px 48px 120px' }}>

        {/* Experience */}
        <FadeUp>
          <section id="experience" style={{ marginBottom: 80 }}>
            <h2 style={{ fontSize: 12, letterSpacing: '0.01em', color: t.faint, margin: '0 0 2px' }}>Experience</h2>
            <div style={{ height: 1, width: 40, background: t.border, marginBottom: 0 }} />
            {[
              { role: 'Software Engineer',                  org: 'syncIO Labs',                          period: 'Jan 2026 – Present' },
              { role: 'UX Designer & Full Stack Developer', org: 'Harvard Medical School, CHOIR at MGH', period: 'Jan 2025 – Jan 2026' },
              { role: 'Frontend Development Co-op',         org: 'City of Pawtucket',                    period: 'Jul – Dec 2023' },
            ].map((e, i) => (
              <FadeUp key={e.org} delay={i * 70}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', padding: '18px 0', borderBottom: `1px solid ${t.border}`, gap: isMobile ? 2 : 0 }}>
                  <div>
                    <p style={{ fontSize: 15, margin: '0 0 3px', color: t.text, fontWeight: 500 }}>{e.role}</p>
                    <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>{e.org}</p>
                  </div>
                  <p style={{ fontSize: 12, color: t.faint, whiteSpace: 'nowrap', margin: 0, paddingTop: isMobile ? 0 : 2 }}>{e.period}</p>
                </div>
              </FadeUp>
            ))}
          </section>
        </FadeUp>

        {/* Contact */}
        <FadeUp>
          <section id="contact">
            <h2 style={{ fontSize: 12, letterSpacing: '0.01em', color: t.faint, margin: '0 0 20px' }}>Get In Touch</h2>
            <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.8, marginBottom: 20, maxWidth: 480 }}>
              Whether you need a website for your band, shop, or research lab — let&apos;s talk.
            </p>
            <a href="mailto:seay.ad@northeastern.edu" style={{ fontSize: 15, color: t.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              seay.ad@northeastern.edu
            </a>
          </section>
        </FadeUp>

      </div>
    </div>
  )
}
