import { useRef, useEffect, useState } from 'react'
import type { Monitor } from '../../data/monitors'

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}

/* ========== TITAN 45 OLED ========== */
function drawTitan45(ctx: CanvasRenderingContext2D, w: number, h: number, m: Monitor) {
  const accent = m.accentColor

  // Deep dark studio bg
  const bgG = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, w*1.1)
  bgG.addColorStop(0, '#0e0a10'); bgG.addColorStop(0.5, '#080610'); bgG.addColorStop(1, '#04040a')
  ctx.fillStyle = bgG; ctx.fillRect(0, 0, w, h)

  // Subtle red accent spot behind monitor
  const spot = ctx.createRadialGradient(w/2, h*0.55, 0, w/2, h*0.55, w*0.7)
  spot.addColorStop(0, accent+'15'); spot.addColorStop(1, 'transparent')
  ctx.fillStyle = spot; ctx.fillRect(0, 0, w, h)

  const monW = w * 0.72
  const monH = h * 0.48
  const monX = (w - monW) / 2
  const monY = h * 0.06

  // Desk shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath(); ctx.ellipse(w/2, monY+monH+monH*0.35, monW*0.52, monH*0.06, 0, 0, Math.PI*2); ctx.fill()

  // === V-shaped gaming stand ===
  const legLen = monH * 0.42
  const legAngle = 0.42
  const legBaseY = monY + monH + monH * 0.06

  // Neck
  ctx.fillStyle = '#151515'
  ctx.fillRect(monX + monW*0.42, monY + monH, monW*0.16, legLen*0.25)

  // V legs
  for (const s of [-1, 1]) {
    ctx.save()
    ctx.translate(monX + monW/2, legBaseY)
    ctx.rotate(s * legAngle)
    // Main leg
    ctx.fillStyle = '#1a1a1a'; rr(ctx, -monW*0.02, 0, monW*0.04, legLen*1.05, 3); ctx.fill()
    // Accent stripe
    ctx.fillStyle = accent
    const gradL = ctx.createLinearGradient(-monW*0.02, legLen*0.45, -monW*0.02, legLen*0.75)
    gradL.addColorStop(0, accent+'00'); gradL.addColorStop(0.3, accent+'CC'); gradL.addColorStop(1, accent+'00')
    ctx.fillStyle = gradL; rr(ctx, -monW*0.02, legLen*0.45, monW*0.04, legLen*0.3, 2); ctx.fill()
    // Foot
    ctx.fillStyle = accent; rr(ctx, -monW*0.032, legLen*1.02, monW*0.064, monH*0.025, 2); ctx.fill()
    ctx.restore()
  }

  // Base plate
  ctx.fillStyle = '#151515'; rr(ctx, monX+monW*0.15, legBaseY+legLen*0.95, monW*0.7, monH*0.022, 5); ctx.fill()
  // Accent ring
  ctx.fillStyle = accent; rr(ctx, monX+monW*0.35, legBaseY+legLen*0.95, monW*0.3, monH*0.01, 3); ctx.fill()

  // === Monitor body ===
  // Outer body
  ctx.fillStyle = '#0d0d0d'; rr(ctx, monX-monW*0.01, monY-monH*0.01, monW*1.02, monH*1.02, 10); ctx.fill()
  // Inner screen border (creates depth)
  const ib = monW*0.008
  ctx.fillStyle = '#080808'; rr(ctx, monX-ib, monY-ib, monW+ib*2, monH+ib*2, 8); ctx.fill()

  // Screen
  ctx.save(); ctx.beginPath(); rr(ctx, monX, monY, monW, monH, 6); ctx.clip()

  // Gaming display
  ctx.fillStyle = '#020208'; ctx.fillRect(monX, monY, monW, monH)
  // Dynamic angled lines
  for (let i=0; i<16; i++) {
    ctx.strokeStyle = accent+(6+i).toString(16)
    ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(monX, monY+monH*0.08+i*monH*0.04)
    ctx.lineTo(monX+monW, monY+monH*0.02+i*monH*0.04); ctx.stroke()
  }
  // BIG 240
  ctx.fillStyle = accent; ctx.font = `bold ${Math.floor(monW*0.1)}px Syne`; ctx.textAlign='center'
  ctx.fillText('240', monX+monW/2, monY+monH*0.48)
  ctx.fillStyle = accent+'AA'; ctx.font = `${Math.floor(monW*0.032)}px Inter`
  ctx.fillText('HZ OLED', monX+monW/2, monY+monH*0.56)
  // Crosshair
  ctx.strokeStyle = accent+'40'; ctx.lineWidth=1
  const cx=monX+monW/2, cy=monY+monH*0.38
  ctx.beginPath(); ctx.arc(cx, cy, monW*0.05, 0, Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, cy-monW*0.08); ctx.lineTo(cx, cy-monW*0.02); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, cy+monW*0.02); ctx.lineTo(cx, cy+monW*0.08); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx-monW*0.08, cy); ctx.lineTo(cx-monW*0.02, cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx+monW*0.02, cy); ctx.lineTo(cx+monW*0.08, cy); ctx.stroke()
  // Specs strip
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(monX, monY+monH*0.88, monW, monH*0.12)
  ctx.fillStyle = accent; ctx.font = `bold ${Math.floor(monW*0.022)}px Inter`; ctx.textAlign='center'
  ctx.fillText('OLED 240Hz   |   0.03ms   |   800R   |   G-SYNC   |   HDR10', monX+monW/2, monY+monH*0.96)
  ctx.restore()

  // Screen reflection
  const refl = ctx.createLinearGradient(0, monY, 0, monY+monH*0.45)
  refl.addColorStop(0, 'rgba(255,255,255,0.07)'); refl.addColorStop(0.5, 'rgba(255,255,255,0.01)'); refl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = refl; rr(ctx, monX, monY, monW, monH, 6); ctx.fill()

  // Chin
  const chinH = monH*0.06
  ctx.fillStyle = '#0d0d0d'; ctx.fillRect(monX, monY+monH, monW, chinH)
  ctx.fillStyle = accent; ctx.font = `${Math.floor(monW*0.026)}px Syne`; ctx.textAlign='center'
  ctx.fillText('viewep', monX+monW/2, monY+monH+chinH*0.65)

  // LED power dot
  ctx.fillStyle = accent; ctx.beginPath()
  ctx.arc(monX+monW-monW*0.03, monY+monH+chinH*0.35, monW*0.008, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = accent+'40'; ctx.beginPath()
  ctx.arc(monX+monW-monW*0.03, monY+monH+chinH*0.35, monW*0.016, 0, Math.PI*2); ctx.fill()
}

/* ========== ULTRAVIEW 49 — luxury ultrawide, premium stand ========== */
function drawUltraView49(ctx: CanvasRenderingContext2D, w: number, h: number, m: Monitor) {
  const accent = m.accentColor

  const bgG = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, w*1.1)
  bgG.addColorStop(0, '#0a0b15'); bgG.addColorStop(1, '#040508')
  ctx.fillStyle = bgG; ctx.fillRect(0, 0, w, h)

  const spot = ctx.createRadialGradient(w/2, h*0.55, 0, w/2, h*0.55, w)
  spot.addColorStop(0, accent+'0C'); spot.addColorStop(1, 'transparent')
  ctx.fillStyle = spot; ctx.fillRect(0, 0, w, h)

  // 32:9 aspect
  const monW = w * 0.88
  const monH = h * 0.42
  const monX = (w - monW) / 2
  const monY = h * 0.1

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath(); ctx.ellipse(w/2, monY+monH+monH*0.4, monW*0.48, monH*0.07, 0, 0, Math.PI*2); ctx.fill()

  // Premium stand
  // Wide rectangular base
  ctx.fillStyle = '#1e1e22'; rr(ctx, monX+monW*0.15, monY+monH+monH*0.06, monW*0.7, monH*0.03, 6); ctx.fill()
  // Secondary layer
  ctx.fillStyle = '#282830'; rr(ctx, monX+monW*0.2, monY+monH+monH*0.06, monW*0.6, monH*0.02, 4); ctx.fill()
  // Accent strip
  ctx.fillStyle = accent; rr(ctx, monX+monW*0.35, monY+monH+monH*0.06, monW*0.3, monH*0.013, 3); ctx.fill()
  // Column
  ctx.fillStyle = '#1e1e22'; ctx.fillRect(monX+monW*0.44, monY+monH, monW*0.12, monH*0.08)
  const colG = ctx.createLinearGradient(0, monY+monH, 0, monY+monH+monH*0.08)
  colG.addColorStop(0, '#1e1e22'); colG.addColorStop(0.5, '#2a2a30'); colG.addColorStop(1, '#1e1e22')
  ctx.fillStyle = colG; ctx.fillRect(monX+monW*0.44, monY+monH, monW*0.12, monH*0.08)

  // Body
  ctx.fillStyle = '#0c0c0c'; rr(ctx, monX-monW*0.005, monY-monH*0.006, monW*1.01, monH*1.012, 8); ctx.fill()
  ctx.fillStyle = '#070707'; rr(ctx, monX-monW*0.003, monY-monH*0.003, monW*1.006, monH*1.006, 6); ctx.fill()

  // Screen
  ctx.save(); ctx.beginPath(); rr(ctx, monX, monY, monW, monH, 5); ctx.clip()
  ctx.fillStyle = '#0a0a0f'; ctx.fillRect(monX, monY, monW, monH)

  // Multi-window layout
  const panels = [
    { px: 0.015, py: 0.06, pw: 0.35, ph: 0.88, c: accent, t: 'WORKSPACE' },
    { px: 0.375, py: 0.06, pw: 0.28, ph: 0.44, c: '#8b5cf6', t: 'TERMINAL' },
    { px: 0.665, py: 0.06, pw: 0.32, ph: 0.44, c: '#14b8a6', t: 'ANALYTICS' },
    { px: 0.375, py: 0.54, pw: 0.28, ph: 0.40, c: '#ec4899', t: 'BROWSER' },
    { px: 0.665, py: 0.54, pw: 0.32, ph: 0.40, c: '#f59e0b', t: 'TERMINAL 2' },
  ]
  panels.forEach(p => {
    const px=monX+monW*p.px, py=monY+monH*p.py, pw=monW*p.pw, ph=monH*p.ph
    ctx.fillStyle = 'rgba(255,255,255,0.025)'; rr(ctx, px, py, pw, ph, 4); ctx.fill()
    ctx.strokeStyle = p.c+'20'; ctx.lineWidth=0.5; ctx.stroke()
    ctx.fillStyle = p.c+'12'; ctx.fillRect(px, py, pw, ph*0.09)
    ctx.fillStyle = '#e2e8f0'; ctx.font = `bold ${Math.floor(ph*0.07)}px Inter`; ctx.textAlign='left'
    ctx.fillText(p.t, px+8, py+ph*0.065)
    // Content lines
    for (let i=0; i<5; i++) {
      ctx.fillStyle = p.c+'08'; ctx.fillRect(px+10, py+ph*0.18+i*ph*0.12, pw*0.6-i*0.08*pw, 3)
    }
  })

  // Top bar
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(monX, monY, monW, monH*0.04)
  ctx.fillStyle = accent+'90'; ctx.font = `bold ${Math.floor(monW*0.018)}px Syne`; ctx.textAlign='right'
  ctx.fillText('ULTRAVIEW 49 • 5120×1440 • 240Hz • QD-OLED', monX+monW*0.98, monY+monH*0.028)
  ctx.restore()

  // Reflection
  const refl = ctx.createLinearGradient(0, monY, 0, monY+monH*0.5)
  refl.addColorStop(0, 'rgba(255,255,255,0.06)'); refl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = refl; rr(ctx, monX, monY, monW, monH, 5); ctx.fill()

  // Chin
  const chinH = monH*0.06
  ctx.fillStyle = '#0c0c0c'; ctx.fillRect(monX, monY+monH, monW, chinH)
  ctx.fillStyle = accent; ctx.font = `${Math.floor(monW*0.024)}px Syne`; ctx.textAlign='center'
  ctx.fillText('viewep', monX+monW/2, monY+monH+chinH*0.65)
  // LED
  ctx.fillStyle = accent+'30'; ctx.beginPath()
  ctx.arc(monX+monW-monW*0.015, monY+monH+chinH*0.4, monW*0.005, 0, Math.PI*2); ctx.fill()
}

/* ========== BLITZ 27 — compact eSports, aggressive gaming stand ========== */
function drawBlitz27(ctx: CanvasRenderingContext2D, w: number, h: number, m: Monitor) {
  const accent = m.accentColor

  const bgG = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, w*1.1)
  bgG.addColorStop(0, '#0c0408'); bgG.addColorStop(1, '#040406')
  ctx.fillStyle = bgG; ctx.fillRect(0, 0, w, h)

  const spot = ctx.createRadialGradient(w/2, h*0.55, 0, w/2, h*0.55, w*0.7)
  spot.addColorStop(0, accent+'12'); spot.addColorStop(1, 'transparent')
  ctx.fillStyle = spot; ctx.fillRect(0, 0, w, h)

  // Smaller monitor (27")
  const monW = w * 0.65
  const monH = h * 0.5
  const monX = (w - monW) / 2
  const monY = h * 0.05

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath(); ctx.ellipse(w/2, monY+monH+monH*0.3, monW*0.5, monH*0.07, 0, 0, Math.PI*2); ctx.fill()

  // Gaming stand
  const legLen = monH*0.45, baseY = monY+monH+monH*0.05
  ctx.fillStyle = '#111'; ctx.fillRect(monX+monW*0.42, monY+monH, monW*0.16, legLen*0.2)
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(monX+monW/2, baseY); ctx.rotate(s*0.48)
    ctx.fillStyle = '#151515'; ctx.fillRect(-monW*0.025, 0, monW*0.05, legLen)
    ctx.fillStyle = accent; ctx.fillRect(-monW*0.025, legLen*0.5, monW*0.05, legLen*0.2)
    ctx.fillStyle = accent; ctx.fillRect(-monW*0.04, legLen*0.95, monW*0.08, monH*0.02)
    ctx.restore()
  }
  ctx.fillStyle = '#111'; rr(ctx, monX+monW*0.2, baseY+legLen*0.85, monW*0.6, monH*0.02, 4); ctx.fill()
  ctx.fillStyle = accent; rr(ctx, monX+monW*0.35, baseY+legLen*0.85, monW*0.3, monH*0.008, 3); ctx.fill()

  // Body
  ctx.fillStyle = '#0a0a0a'; rr(ctx, monX-monW*0.012, monY-monH*0.012, monW*1.024, monH*1.024, 10); ctx.fill()
  ctx.fillStyle = '#060606'; rr(ctx, monX-monW*0.006, monY-monH*0.006, monW*1.012, monH*1.012, 7); ctx.fill()

  // Screen
  ctx.save(); ctx.beginPath(); rr(ctx, monX, monY, monW, monH, 6); ctx.clip()
  ctx.fillStyle = '#020206'; ctx.fillRect(monX, monY, monW, monH)

  // eSports HUD
  for (let i=0; i<20; i++) {
    ctx.strokeStyle = accent+'08'; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(monX, monY+monH*0.1+i*monH*0.035)
    ctx.lineTo(monX+monW, monY+monH*0.05+i*monH*0.035); ctx.stroke()
  }
  // 360
  ctx.fillStyle = accent; ctx.font = `bold ${Math.floor(monW*0.14)}px Syne`; ctx.textAlign='center'
  ctx.fillText('360', monX+monW/2, monY+monH*0.45)
  ctx.fillStyle = accent+'AA'; ctx.font = `${Math.floor(monW*0.035)}px Inter`
  ctx.fillText('HZ', monX+monW/2, monY+monH*0.53)

  // Performance bars
  const bars = [{l:'Response',v:0.95},{l:'Precision',v:0.88},{l:'Clarity',v:0.92}]
  const bx = monX+monW*0.15, bw = monW*0.7
  bars.forEach((b,i)=>{
    const by = monY+monH*0.6+i*monH*0.1
    ctx.fillStyle = '#64748b'; ctx.font = `bold ${Math.floor(monW*0.025)}px Inter`; ctx.textAlign='left'
    ctx.fillText(b.l, bx, by-2)
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; rr(ctx, bx, by, bw, monH*0.025, 3); ctx.fill()
    ctx.fillStyle = accent+'BB'; rr(ctx, bx, by, bw*b.v, monH*0.025, 3); ctx.fill()
  })
  // Specs
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(monX, monY+monH*0.88, monW, monH*0.12)
  ctx.fillStyle = accent; ctx.font = `bold ${Math.floor(monW*0.025)}px Inter`; ctx.textAlign='center'
  ctx.fillText('IPS  |  0.5ms  |  G-SYNC  |  ULMB 2  |  eSPORTS MODE', monX+monW/2, monY+monH*0.96)
  ctx.restore()

  // Reflection
  const refl = ctx.createLinearGradient(0, monY, 0, monY+monH*0.45)
  refl.addColorStop(0, 'rgba(255,255,255,0.07)'); refl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = refl; rr(ctx, monX, monY, monW, monH, 6); ctx.fill()

  // Chin + LED
  const chinH = monH*0.06
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(monX, monY+monH, monW, chinH)
  ctx.fillStyle = accent; ctx.font = `${Math.floor(monW*0.028)}px Syne`; ctx.textAlign='center'
  ctx.fillText('viewep', monX+monW/2, monY+monH+chinH*0.65)
  ctx.fillStyle = accent; ctx.beginPath()
  ctx.arc(monX+monW-monW*0.035, monY+monH+chinH*0.4, monW*0.01, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = accent+'30'; ctx.beginPath()
  ctx.arc(monX+monW-monW*0.035, monY+monH+chinH*0.4, monW*0.02, 0, Math.PI*2); ctx.fill()
}

/* ========== COMPONENT ========== */
export function ProductImageRealistic({ monitor, className = '' }: { monitor: Monitor; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState(false)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const cw = rect.width, ch = rect.height
      if (canvas.width !== cw*dpr || canvas.height !== ch*dpr) {
        canvas.width = cw*dpr; canvas.height = ch*dpr; ctx.scale(dpr, dpr)
      }
      ctx.clearRect(0, 0, cw, ch)
      const t = frameRef.current * 0.006

      ctx.save()
      if (hovered) ctx.translate(cw*0.008*Math.sin(t), ch*0.004*Math.cos(t*0.6))

      if (monitor.id === 'titan-45') drawTitan45(ctx, cw, ch, monitor)
      else if (monitor.id === 'ultra-49') drawUltraView49(ctx, cw, ch, monitor)
      else if (monitor.id === 'blitz-27') drawBlitz27(ctx, cw, ch, monitor)
      else {
        // Generic fallback using Titan style
        drawTitan45(ctx, cw, ch, {...monitor, id: 'titan-45'})
      }
      ctx.restore()

      if (hovered) {
        const g = ctx.createLinearGradient(0, 0, 0, ch*0.4)
        g.addColorStop(0, 'rgba(255,255,255,0.04)'); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch*0.4)
      }
      frameRef.current++; raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [monitor, hovered])

  return (
    <canvas ref={canvasRef} className={`w-full h-full ${className}`} style={{display:'block'}}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} />
  )
}
