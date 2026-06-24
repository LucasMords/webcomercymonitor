import { useRef, useEffect, useState } from 'react'

interface ProductImageProps {
  colorHex: string
  accentColor: string
  name: string
  className?: string
}

function drawMonitorFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bodyColor: string,
  accentColor: string,
  name: string,
  level: number,
  maxLevel: number
) {
  const bezel = w * 0.04
  const standH = h * 0.35

  if (level >= maxLevel) {
    ctx.fillStyle = accentColor + '30'
    ctx.fillRect(x + bezel, y + bezel, w - bezel * 2, h - bezel * 2)

    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(x + bezel + 4, y + bezel + 4, w - bezel * 2 - 8, h - bezel * 2 - 8)

    ctx.fillStyle = accentColor
    ctx.font = `${Math.floor(w * 0.08)}px Inter, sans-serif`
    ctx.textAlign = 'center'
    const displayName = name.length > 12 ? name.slice(0, 12) : name
    ctx.fillText(displayName, x + w / 2, y + h * 0.5)

    return
  }

  ctx.fillStyle = bodyColor
  ctx.beginPath()
  roundRect(ctx, x, y, w, h, w * 0.05)
  ctx.fill()

  ctx.strokeStyle = accentColor + '60'
  ctx.lineWidth = Math.max(1, w * 0.008)
  ctx.beginPath()
  roundRect(ctx, x, y, w, h, w * 0.05)
  ctx.stroke()

  ctx.fillStyle = '#0a0a0f'
  ctx.beginPath()
  roundRect(ctx, x + bezel, y + bezel, w - bezel * 2, h - bezel * 2, w * 0.03)
  ctx.fill()

  const innerX = x + bezel * 2
  const innerY = y + bezel * 2
  const innerW = w - bezel * 4
  const innerH = h - bezel * 4

  drawMonitorFrame(ctx, innerX, innerY, innerW, innerH, bodyColor, accentColor, name, level + 1, maxLevel)

  // Bottom chin with logo
  const chinY = y + h - standH * 0.4
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  roundRect(ctx, x + w * 0.3, chinY, w * 0.4, standH * 0.15, 3)
  ctx.fill()

  ctx.fillStyle = accentColor
  ctx.font = `${Math.floor(w * 0.05)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('viewep', x + w / 2, chinY + standH * 0.11)

  // Stand
  const standBaseY = y + h
  ctx.fillStyle = bodyColor
  ctx.fillRect(x + w * 0.35, standBaseY, w * 0.3, standH * 0.15)

  ctx.fillStyle = accentColor + '40'
  ctx.fillRect(x + w * 0.2, standBaseY + standH * 0.15, w * 0.6, standH * 0.06)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

export function ProductImage({ colorHex, accentColor, name, className = '' }: ProductImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState(false)
  const frameRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, w, h)

      // Grid background
      ctx.fillStyle = 'rgba(99,102,241,0.03)'
      for (let gx = 0; gx < w; gx += 30) {
        for (let gy = 0; gy < h; gy += 30) {
          ctx.fillRect(gx, gy, 1, 1)
        }
      }

      // Monitor frame at perspective angle
      const monitorW = w * 0.85
      const monitorH = h * 0.7
      const monitorX = (w - monitorW) / 2
      const monitorY = (h - monitorH) / 2 - h * 0.02

      ctx.save()

      drawMonitorFrame(
        ctx,
        monitorX,
        monitorY,
        monitorW,
        monitorH,
        colorHex,
        accentColor,
        name,
        0,
        3
      )

      ctx.restore()

      // Glow under monitor
      const glow = ctx.createRadialGradient(w / 2, h * 0.82, 0, w / 2, h * 0.82, w * 0.3)
      glow.addColorStop(0, accentColor + '25')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, h * 0.65, w, h * 0.35)

      // Hover reflection
      if (hovered) {
        const refl = ctx.createLinearGradient(0, 0, 0, h * 0.5)
        refl.addColorStop(0, 'rgba(255,255,255,0.06)')
        refl.addColorStop(1, 'transparent')
        ctx.fillStyle = refl
        ctx.fillRect(0, 0, w, h * 0.5)
      }

      frameRef.current++
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(rafRef.current)
  }, [colorHex, accentColor, name, hovered])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  )
}
