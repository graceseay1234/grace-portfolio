'use client'

import { useEffect, useRef } from 'react'

interface Petal {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  angle: number
  spin: number
  opacity: number
  color: string
  swayOffset: number
  swaySpeed: number
  swayAmp: number
}

const COLORS = [
  'rgba(242,196,206,',  // blush
  'rgba(216,202,232,',  // lavender
  'rgba(184,205,180,',  // sage
  'rgba(232,168,180,',  // blush darker
  'rgba(255,220,230,',  // light pink
  'rgba(200,185,225,',  // lavender mid
]

function drawPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
  ctx.save()
  ctx.translate(petal.x, petal.y)
  ctx.rotate(petal.angle)
  ctx.globalAlpha = petal.opacity

  ctx.beginPath()
  ctx.ellipse(0, 0, petal.size * 0.45, petal.size, 0, 0, Math.PI * 2)
  ctx.fillStyle = petal.color + '0.85)'
  ctx.fill()

  ctx.restore()
}

export default function FloatingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const petals: Petal[] = []

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function spawnPetal(): Petal {
      return {
        x: Math.random() * window.innerWidth,
        y: -20,
        size: 6 + Math.random() * 10,
        speedY: 0.6 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.03,
        opacity: 0.5 + Math.random() * 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.012,
        swayAmp: 20 + Math.random() * 40,
      }
    }

    for (let i = 0; i < 18; i++) {
      const p = spawnPetal()
      p.y = Math.random() * window.innerHeight
      petals.push(p)
    }

    let frame = 0
    function animate() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (frame % 90 === 0 && petals.length < 30) {
        petals.push(spawnPetal())
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]
        p.y += p.speedY
        p.x += p.speedX + Math.sin(frame * p.swaySpeed + p.swayOffset) * 0.4
        p.angle += p.spin
        p.swayOffset += p.swaySpeed

        if (p.y > window.innerHeight + 30) {
          petals.splice(i, 1)
        } else {
          drawPetal(ctx, p)
        }
      }

      frame++
      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}
