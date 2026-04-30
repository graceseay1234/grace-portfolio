'use client'

import { useEffect, useRef } from 'react'

const SCENE_H = 420

const CANDLES = [
  { xFrac: 0.10, bodyH: 175, bodyW: 11, color: [232, 200, 216], lean: -0.5, off: 0.0 },
  { xFrac: 0.27, bodyH: 248, bodyW: 14, color: [240, 168, 188], lean: 0.3, off: 1.3 },
  { xFrac: 0.42, bodyH: 202, bodyW: 13, color: [200, 180, 232], lean: -0.2, off: 2.7 },
  { xFrac: 0.55, bodyH: 268, bodyW: 16, color: [240, 144, 168], lean: 0.4, off: 0.9 },
  { xFrac: 0.67, bodyH: 188, bodyW: 12, color: [144, 200, 140], lean: -0.3, off: 3.2 },
  { xFrac: 0.83, bodyH: 224, bodyW: 13, color: [208, 192, 234], lean: 0.2, off: 1.9 },
]

function noise(t: number, off: number) {
  return (
    Math.sin(t * 4.1 + off) * 0.35 +
    Math.sin(t * 7.8 + off * 1.7) * 0.20 +
    Math.sin(t * 14.3 + off * 0.9) * 0.10
  )
}

function rgb(r: number, g: number, b: number, a = 1) {
  return `rgba(${r},${g},${b},${a})`
}

function drawCandlestick(ctx: CanvasRenderingContext2D, x: number, baseY: number, w: number) {
  const brassGrad = ctx.createLinearGradient(x - w * 3, 0, x + w * 3, 0)
  brassGrad.addColorStop(0, '#6a3e0a')
  brassGrad.addColorStop(0.25, '#f0d060')
  brassGrad.addColorStop(0.5, '#c8941c')
  brassGrad.addColorStop(0.75, '#f0d060')
  brassGrad.addColorStop(1, '#6a3e0a')
  ctx.fillStyle = brassGrad

  // Base plate
  ctx.beginPath()
  ctx.ellipse(x, baseY, w * 2.6, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x, baseY - 5, w * 2.0, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Stem
  ctx.beginPath()
  ctx.rect(x - w * 0.38, baseY - 44, w * 0.76, 40)
  ctx.fill()

  // Middle knob
  ctx.beginPath()
  ctx.ellipse(x, baseY - 46, w * 0.95, 7, 0, 0, Math.PI * 2)
  ctx.fill()

  // Cup
  ctx.beginPath()
  ctx.moveTo(x - w * 0.65, baseY - 54)
  ctx.lineTo(x - w * 0.38, baseY - 70)
  ctx.lineTo(x + w * 0.38, baseY - 70)
  ctx.lineTo(x + w * 0.65, baseY - 54)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x, baseY - 70, w * 0.52, 4, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawCandleBody(
  ctx: CanvasRenderingContext2D,
  x: number, topY: number, botY: number,
  w: number, color: number[]
) {
  const [r, g, b] = color
  const grad = ctx.createLinearGradient(x - w, 0, x + w, 0)
  grad.addColorStop(0,   rgb(r - 40, g - 40, b - 40))
  grad.addColorStop(0.15, rgb(r + 40, g + 40, b + 40))
  grad.addColorStop(0.45, rgb(r + 20, g + 20, b + 20))
  grad.addColorStop(0.75, rgb(r, g, b))
  grad.addColorStop(1,   rgb(r - 50, g - 50, b - 50))
  ctx.fillStyle = grad

  ctx.beginPath()
  ctx.moveTo(x - w * 0.82, topY)
  ctx.lineTo(x + w * 0.82, topY)
  ctx.lineTo(x + w, botY)
  ctx.lineTo(x - w, botY)
  ctx.closePath()
  ctx.fill()

  // Wax pool top
  const poolGrad = ctx.createRadialGradient(x, topY + 2, 0, x, topY + 2, w)
  poolGrad.addColorStop(0, rgb(r + 60, g + 60, b + 60, 0.9))
  poolGrad.addColorStop(1, rgb(r + 20, g + 20, b + 20, 0.5))
  ctx.fillStyle = poolGrad
  ctx.beginPath()
  ctx.ellipse(x, topY + 2, w * 0.75, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Drip
  ctx.fillStyle = rgb(r + 30, g + 30, b + 30, 0.7)
  ctx.beginPath()
  ctx.ellipse(x - w * 0.3, topY + 20, 2.5, 8, 0.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawFlame(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number,
  t: number, off: number, lean: number
) {
  const sway = noise(t, off) * 5 + lean * 2.5
  const hMod = 0.82 + (noise(t * 0.6, off + 5) + 1) * 0.09
  const fh = 30 * hMod
  const fw = 7.5
  const tipY = baseY - fh
  const midY = baseY - fh * 0.45

  // Ambient glow
  const glow = ctx.createRadialGradient(x + sway * 0.5, baseY - fh * 0.4, 0, x + sway * 0.5, baseY - fh * 0.4, 60)
  glow.addColorStop(0, 'rgba(255,195,60,0.20)')
  glow.addColorStop(0.5, 'rgba(255,130,20,0.08)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.ellipse(x + sway * 0.5, baseY - fh * 0.3, 58, 62, 0, 0, Math.PI * 2)
  ctx.fill()

  // Outer flame — orange
  ctx.fillStyle = 'rgba(255,120,15,0.92)'
  ctx.beginPath()
  ctx.moveTo(x, baseY)
  ctx.bezierCurveTo(x - fw, baseY - fh * 0.3, x + sway * 0.7 - fw * 0.7, midY, x + sway * 0.8, tipY)
  ctx.bezierCurveTo(x + sway * 0.7 + fw * 0.7, midY, x + fw, baseY - fh * 0.3, x, baseY)
  ctx.fill()

  // Mid flame — yellow
  ctx.fillStyle = 'rgba(255,215,45,0.95)'
  ctx.beginPath()
  ctx.moveTo(x, baseY - 2)
  ctx.bezierCurveTo(x - fw * 0.55, baseY - fh * 0.32, x + sway * 0.7 - fw * 0.4, midY + 5, x + sway * 0.8, tipY + 6)
  ctx.bezierCurveTo(x + sway * 0.7 + fw * 0.4, midY + 5, x + fw * 0.55, baseY - fh * 0.32, x, baseY - 2)
  ctx.fill()

  // Core — white/cream
  ctx.fillStyle = 'rgba(255,252,225,0.96)'
  ctx.beginPath()
  ctx.moveTo(x, baseY - 4)
  ctx.bezierCurveTo(x - fw * 0.28, baseY - fh * 0.38, x + sway * 0.65 - fw * 0.18, midY + 9, x + sway * 0.65, tipY + 12)
  ctx.bezierCurveTo(x + sway * 0.65 + fw * 0.18, midY + 9, x + fw * 0.28, baseY - fh * 0.38, x, baseY - 4)
  ctx.fill()

  // Wick
  ctx.strokeStyle = '#2a1508'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(x, baseY + 1)
  ctx.quadraticCurveTo(x + sway * 0.2, baseY - 3, x + sway * 0.35, baseY - 6)
  ctx.stroke()
}

export default function CandleScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = SCENE_H
    }
    resize()
    window.addEventListener('resize', resize)

    // Stable star positions
    const stars = Array.from({ length: 22 }, (_, i) => ({
      x: ((i * 137.508) % 1) * 1,
      y: ((i * 97.321) % 1) * 0.65,
      r: 0.8 + (i % 3) * 0.5,
      phase: i * 0.7,
    }))

    function render(ts: number) {
      if (!canvas || !ctx) return
      const t = ts * 0.001
      const W = canvas.width

      ctx.clearRect(0, 0, W, SCENE_H)

      // Background
      ctx.fillStyle = '#070707'
      ctx.fillRect(0, 0, W, SCENE_H)

      // Soft ground glow from all candles combined
      const groundGlow = ctx.createLinearGradient(0, SCENE_H - 60, 0, SCENE_H)
      groundGlow.addColorStop(0, 'rgba(180,120,40,0.06)')
      groundGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = groundGlow
      ctx.fillRect(0, SCENE_H - 60, W, 60)

      // Stars
      stars.forEach(s => {
        const brightness = 0.35 + Math.sin(t * 0.9 + s.phase) * 0.25
        ctx.fillStyle = `rgba(255,248,220,${brightness})`
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * SCENE_H, s.r, 0, Math.PI * 2)
        ctx.fill()
      })

      const BASE_Y = SCENE_H - 28

      CANDLES.forEach(c => {
        const x = W * c.xFrac
        const botY = BASE_Y - 70
        const topY = botY - c.bodyH

        drawCandleBody(ctx, x, topY, botY, c.bodyW, c.color)
        drawCandlestick(ctx, x, BASE_Y, c.bodyW)
        drawFlame(ctx, x, topY, t, c.off, c.lean)
      })

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: SCENE_H }}
    />
  )
}
