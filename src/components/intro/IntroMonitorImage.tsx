import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawSiteOnScreen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0a0a0f'
  roundRect(ctx, x, y, w, h, 3)
  ctx.fill()

  const navH = h * 0.08
  ctx.fillStyle = 'rgba(10,10,15,0.95)'
  ctx.fillRect(x, y, w, navH)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(x, y + navH)
  ctx.lineTo(x + w, y + navH)
  ctx.stroke()

  ctx.fillStyle = '#6366f1'
  const logoSize = Math.max(4, navH * 0.45)
  roundRect(ctx, x + w * 0.03, y + navH * 0.25, logoSize, logoSize, 3)
  ctx.fill()

  ctx.fillStyle = '#f1f5f9'
  ctx.font = `${Math.max(6, navH * 0.4)}px Inter, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText('viewep', x + w * 0.06, y + navH * 0.65)

  const links = ['Home', 'Catálogo', 'Showcase']
  const linkStart = x + w * 0.35
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${Math.max(5, navH * 0.28)}px Inter, sans-serif`
  links.forEach((l, i) => {
    ctx.fillText(l, linkStart + i * w * 0.1, y + navH * 0.65)
  })

  const heroY = y + navH + h * 0.06
  ctx.fillStyle = '#6366f1'
  ctx.font = `bold ${Math.max(7, w * 0.025)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('NOVA COLEÇÃO 2026', x + w / 2, heroY)

  ctx.fillStyle = '#f1f5f9'
  ctx.font = `bold ${Math.max(10, w * 0.04)}px Syne, sans-serif`
  ctx.fillText('Seu Monitor.', x + w / 2, heroY + h * 0.08)
  ctx.fillStyle = '#6366f1'
  ctx.fillText('Sua Visão.', x + w / 2, heroY + h * 0.15)

  const cardY = heroY + h * 0.3
  const cardW = w * 0.22
  const cardH = h * 0.14
  const cardGap = w * 0.03
  const cards = 3
  const cardStart = x + (w - (cardW * cards + cardGap * (cards - 1))) / 2

  const features = [
    { title: '240Hz', desc: 'Refresh Rate', color: '#6366f1' },
    { title: '4K/5K', desc: 'Resolução', color: '#8b5cf6' },
    { title: 'QD-OLED', desc: 'Tecnologia', color: '#14b8a6' },
  ]

  features.forEach((f, i) => {
    const cx = cardStart + i * (cardW + cardGap)
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, cx, cardY, cardW, cardH, 4)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.5
    ctx.stroke()
    ctx.fillStyle = f.color + '30'
    roundRect(ctx, cx + cardW * 0.1, cardY + cardH * 0.2, cardW * 0.2, cardW * 0.2, 3)
    ctx.fill()
    ctx.fillStyle = '#e2e8f0'
    ctx.font = `bold ${Math.max(6, cardW * 0.14)}px Inter, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(f.title, cx + cardW * 0.35, cardY + cardH * 0.42)
    ctx.fillStyle = '#64748b'
    ctx.font = `${Math.max(5, cardW * 0.1)}px Inter, sans-serif`
    ctx.fillText(f.desc, cx + cardW * 0.35, cardY + cardH * 0.68)
  })

  const ctaY = cardY + cardH + h * 0.08
  ctx.fillStyle = '#6366f1'
  roundRect(ctx, x + w * 0.28, ctaY, w * 0.28, h * 0.06, 6)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.max(6, w * 0.022)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('Explorar Catálogo', x + w * 0.42, ctaY + h * 0.042)

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 0.5
  roundRect(ctx, x + w * 0.58, ctaY, w * 0.18, h * 0.06, 6)
  ctx.stroke()
  ctx.fillStyle = '#cbd5e1'
  ctx.font = `bold ${Math.max(6, w * 0.022)}px Inter, sans-serif`
  ctx.fillText('Showcase', x + w * 0.67, ctaY + h * 0.042)
}

export function IntroMonitorImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)
      }

      ctx.clearRect(0, 0, w, h)

      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'rgba(99,102,241,0.02)'
      for (let gx = 0; gx < w; gx += 35) {
        for (let gy = 0; gy < h; gy += 35) {
          ctx.fillRect(gx, gy, 1, 1)
        }
      }

      const monW = w * 0.72
      const monH = h * 0.58
      const monX = (w - monW) / 2
      const monY = (h - monH) / 2 - h * 0.04

      // Shadow under monitor
      ctx.fillStyle = 'rgba(99,102,241,0.08)'
      ctx.beginPath()
      ctx.ellipse(w / 2, monY + monH + monH * 0.2, monW * 0.55, monH * 0.06, 0, 0, Math.PI * 2)
      ctx.fill()

      // Monitor bezel
      const bezelW = monW * 0.005
      ctx.fillStyle = '#1a1a1a'
      roundRect(ctx, monX - bezelW, monY - bezelW, monW + bezelW * 2, monH + bezelW * 2, 8)
      ctx.fill()

      // Screen
      ctx.fillStyle = '#0d0d0d'
      roundRect(ctx, monX, monY, monW, monH, 6)
      ctx.fill()

      // Screen content
      ctx.save()
      ctx.beginPath()
      roundRect(ctx, monX, monY, monW, monH, 6)
      ctx.clip()
      drawSiteOnScreen(ctx, monX + monW * 0.015, monY + monH * 0.015, monW * 0.97, monH * 0.97)
      ctx.restore()

      // Screen reflection
      const refl = ctx.createLinearGradient(0, monY, 0, monY + monH * 0.5)
      refl.addColorStop(0, 'rgba(255,255,255,0.04)')
      refl.addColorStop(0.5, 'rgba(255,255,255,0.01)')
      refl.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = refl
      roundRect(ctx, monX, monY, monW, monH, 6)
      ctx.fill()

      // Bottom chin
      const chinH = monH * 0.06
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(monX, monY + monH, monW, chinH)
      ctx.fillStyle = '#6366f1'
      ctx.font = `${Math.max(8, monW * 0.025)}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('viewep', monX + monW / 2, monY + monH + chinH * 0.65)

      // Stand
      const standY = monY + monH + chinH
      ctx.fillStyle = '#1e1e1e'
      ctx.fillRect(monX + monW * 0.42, standY, monW * 0.16, monH * 0.14)
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(monX + monW * 0.45, standY, monW * 0.1, monH * 0.14)

      // Stand base
      const baseY = standY + monH * 0.14
      ctx.fillStyle = '#1e1e1e'
      roundRect(ctx, monX + monW * 0.2, baseY, monW * 0.6, monH * 0.025, 4)
      ctx.fill()
      ctx.fillStyle = '#6366f1'
      roundRect(ctx, monX + monW * 0.4, baseY, monW * 0.2, monH * 0.01, 2)
      ctx.fill()

      // Accent glow
      const accGlow = ctx.createRadialGradient(w / 2, monY + monH * 0.4, monW * 0.1, w / 2, monY + monH * 0.4, monW * 0.8)
      accGlow.addColorStop(0, 'rgba(99,102,241,0.05)')
      accGlow.addColorStop(1, 'rgba(99,102,241,0)')
      ctx.fillStyle = accGlow
      ctx.fillRect(0, 0, w, h)

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="absolute inset-0"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </motion.div>
  )
}
