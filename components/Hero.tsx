'use client'

import { useEffect, useRef } from 'react'

function FlowerSVG({ size = 80, color = '#f2c4ce', style }: { size?: number, color?: string, style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={style}>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const cx = Math.round((40 + Math.cos((deg * Math.PI) / 180) * 18) * 1000) / 1000
        const cy = Math.round((40 + Math.sin((deg * Math.PI) / 180) * 18) * 1000) / 1000
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={10} ry={16}
            transform={`rotate(${deg} ${cx} ${cy})`}
            fill={color}
            opacity={0.7}
          />
        )
      })}
      <circle cx={40} cy={40} r={10} fill={color} opacity={0.9} />
    </svg>
  )
}

function LeafSVG({ size = 60, color = '#b8cdb4', style }: { size?: number, color?: string, style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={style}>
      <path d="M30 5 C50 15, 55 35, 30 55 C5 35, 10 15, 30 5Z" fill={color} opacity={0.6} />
      <line x1="30" y1="5" x2="30" y2="55" stroke={color} strokeWidth="1" opacity={0.4} />
    </svg>
  )
}

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = [headingRef.current, subRef.current, taglineRef.current, ctaRef.current]
    els.forEach((el, i) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(28px)'
      setTimeout(() => {
        if (!el) return
        el.style.transition = 'opacity 0.9s ease, transform 0.9s ease'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      }, 200 + i * 180)
    })
  }, [])

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 24px',
      background: 'linear-gradient(160deg, #fdf9f4 0%, #faf0f2 40%, #f5f0fa 100%)',
    }}>

      {/* Decorative botanical corners */}
      <FlowerSVG size={120} color="#f2c4ce" style={{
        position: 'absolute', top: 24, left: 24, opacity: 0.5,
        animation: 'float 6s ease-in-out infinite',
      }} />
      <FlowerSVG size={90} color="#d8cae8" style={{
        position: 'absolute', top: 60, right: 40, opacity: 0.4,
        animation: 'float 8s ease-in-out infinite 1s',
      }} />
      <LeafSVG size={80} color="#b8cdb4" style={{
        position: 'absolute', bottom: 80, left: 60, opacity: 0.45,
        animation: 'float 7s ease-in-out infinite 0.5s',
        transform: 'rotate(30deg)',
      }} />
      <FlowerSVG size={70} color="#e8a8b4" style={{
        position: 'absolute', bottom: 120, right: 80, opacity: 0.35,
        animation: 'float 9s ease-in-out infinite 2s',
      }} />
      <LeafSVG size={100} color="#9ab894" style={{
        position: 'absolute', top: '35%', right: 20, opacity: 0.25,
        animation: 'float 11s ease-in-out infinite 3s',
        transform: 'rotate(-20deg)',
      }} />

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 700 }}>

        <p ref={subRef} style={{
          fontFamily: 'var(--font-dancing)',
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          color: 'var(--blush-dark)',
          marginBottom: 12,
          letterSpacing: '0.04em',
        }}>
          hello, i&apos;m
        </p>

        <h1 ref={headingRef} style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(4rem, 12vw, 9rem)',
          fontWeight: 300,
          lineHeight: 0.95,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
          marginBottom: 20,
        }}>
          Grace<br />
          <span style={{ fontStyle: 'italic', color: 'var(--lavender-dark)' }}>Seay</span>
        </h1>

        <p ref={taglineRef} style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          color: 'var(--text-muted)',
          lineHeight: 1.8,
          maxWidth: 480,
          margin: '0 auto 40px',
          fontStyle: 'italic',
        }}>
          full-stack developer & UX designer — building beautiful, purposeful things
          for bands, small businesses, and research teams
        </p>

        <div ref={ctaRef} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#work" style={{
            fontFamily: 'var(--font-lora)',
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'white',
            background: 'var(--blush-dark)',
            padding: '14px 32px',
            borderRadius: 9999,
            textDecoration: 'none',
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--blush-mid)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--blush-dark)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            See My Work
          </a>
          <a href="#contact" style={{
            fontFamily: 'var(--font-lora)',
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            background: 'transparent',
            padding: '14px 32px',
            borderRadius: 9999,
            textDecoration: 'none',
            border: '1px solid var(--text-light)',
            transition: 'border-color 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-light)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            Get In Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1,
      }}>
        <span style={{ fontFamily: 'var(--font-dancing)', fontSize: '0.85rem', color: 'var(--text-light)' }}>scroll</span>
        <div style={{
          width: 1, height: 40,
          background: 'linear-gradient(to bottom, var(--blush), transparent)',
          animation: 'scrollBounce 2s ease-in-out infinite',
        }} />
      </div>
    </section>
  )
}
