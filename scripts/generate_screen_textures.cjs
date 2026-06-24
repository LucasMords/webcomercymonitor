const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, '..', 'public', 'textures')
fs.mkdirSync(OUT, { recursive: true })

function roundRect(ctx, x, y, w, h, r) {
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

function generateTitan45() {
  const W = 1024, H = 512
  const c = createCanvas(W, H)
  const ctx = c.getContext('2d')

  // Dark gaming background
  ctx.fillStyle = '#050510'
  ctx.fillRect(0, 0, W, H)

  // Subtle grid
  ctx.fillStyle = 'rgba(244,63,94,0.03)'
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) ctx.fillRect(x, y, 1, 1)
  }

  // Angular gaming lines
  ctx.strokeStyle = 'rgba(244,63,94,0.15)'
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    ctx.beginPath()
    ctx.moveTo(0, H * 0.2 + i * 35)
    ctx.lineTo(W, H * 0.1 + i * 35)
    ctx.stroke()
  }

  // Central HUD
  const cx = W / 2, cy = H / 2

  // Crosshair
  ctx.strokeStyle = '#f43f5e60'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(cx, cy - 40); ctx.lineTo(cx, cy - 15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, cy + 15); ctx.lineTo(cx, cy + 40); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx - 40, cy); ctx.lineTo(cx - 15, cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 40, cy); ctx.stroke()
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.stroke()

  // FPS counter
  ctx.fillStyle = '#f43f5e'
  ctx.font = 'bold 72px Syne, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('240', W * 0.35, cy - 20)
  ctx.fillStyle = '#f43f5e99'
  ctx.font = '14px Inter, sans-serif'
  ctx.fillText('FPS', W * 0.35, cy + 5)

  // Specs panel
  const panelX = W * 0.6, panelY = H * 0.25
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  roundRect(ctx, panelX, panelY, W * 0.35, H * 0.5, 12)
  ctx.fill()
  ctx.strokeStyle = '#f43f5e30'
  ctx.lineWidth = 1
  ctx.stroke()

  const specs = [
    { label: 'OLED 240Hz', value: '0.03ms' },
    { label: '800R Curvatura', value: 'Imersiva' },
    { label: 'G-Sync', value: 'Compatible' },
    { label: 'HDR10', value: 'Ativado' },
    { label: '45 Polegadas', value: '21:9' },
  ]
  specs.forEach((s, i) => {
    const sy = panelY + 30 + i * 38
    ctx.fillStyle = '#f43f5e'
    ctx.font = 'bold 16px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(s.label, panelX + 20, sy)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(s.value, panelX + W * 0.35 - 20, sy)
  })

  // Brand
  ctx.fillStyle = '#f43f5e60'
  ctx.font = 'bold 36px Syne, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('TITAN 45 OLED', cx, H * 0.9)

  // Scanlines
  for (let y = 0; y < H; y += 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.04)'
    ctx.fillRect(0, y, W, 1)
  }

  fs.writeFileSync(path.join(OUT, 'titan45_screen.png'), c.toBuffer('image/png'))
  console.log('titan45_screen.png')
}

function generateUltraView49() {
  const W = 1280, H = 400
  const c = createCanvas(W, H)
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, W, H)

  // Multi-window layout
  const panels = [
    { x: 0.01, y: 0.08, w: 0.38, h: 0.84, color: '#6366f1', title: 'CODE EDITOR' },
    { x: 0.41, y: 0.08, w: 0.33, h: 0.40, color: '#8b5cf6', title: 'TERMINAL' },
    { x: 0.76, y: 0.08, w: 0.23, h: 0.40, color: '#14b8a6', title: 'METRICS' },
    { x: 0.41, y: 0.52, w: 0.33, h: 0.40, color: '#ec4899', title: 'PREVIEW' },
    { x: 0.76, y: 0.52, w: 0.23, h: 0.40, color: '#f59e0b', title: 'CHAT' },
  ]

  panels.forEach(p => {
    const px = W * p.x, py = H * p.y, pw = W * p.w, ph = H * p.h
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    roundRect(ctx, px, py, pw, ph, 8)
    ctx.fill()
    ctx.strokeStyle = p.color + '40'
    ctx.lineWidth = 1
    ctx.stroke()

    // Title bar
    ctx.fillStyle = p.color + '20'
    ctx.fillRect(px, py, pw, ph * 0.12)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 11px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(p.title, px + 10, py + ph * 0.085)

    // Content lines
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = p.color + '10'
      ctx.fillRect(px + 15, py + ph * 0.22 + i * ph * 0.13, pw * 0.6 - i * 0.08 * pw, 4)
    }
  })

  // Bottom specs bar
  const barY = H * 0.95
  ctx.fillStyle = 'rgba(10,10,15,0.9)'
  ctx.fillRect(0, barY, W, H * 0.05)
  ctx.fillStyle = '#6366f1'
  ctx.font = 'bold 13px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('49" QD-OLED | 5120x1440 | 240Hz | 1800R | HDR10+ | KVM Switch', W / 2, barY + H * 0.033)

  // Brand
  ctx.fillStyle = '#6366f180'
  ctx.font = 'bold 28px Syne, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('ULTRAVIEW 49', W * 0.98, H * 0.06)

  fs.writeFileSync(path.join(OUT, 'ultraview49_screen.png'), c.toBuffer('image/png'))
  console.log('ultraview49_screen.png')
}

function generateBlitz27() {
  const W = 1024, H = 600
  const c = createCanvas(W, H)
  const ctx = c.getContext('2d')

  // eSports competitive theme
  ctx.fillStyle = '#04080c'
  ctx.fillRect(0, 0, W, H)

  // Speed lines
  ctx.strokeStyle = '#f43f5e10'
  ctx.lineWidth = 2
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * H
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W * (0.3 + Math.random() * 0.7), y)
    ctx.stroke()
  }

  // BIG 360
  ctx.fillStyle = '#f43f5e'
  ctx.font = 'bold 160px Syne, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('360', W / 2, H * 0.4)

  // Subtitle
  ctx.fillStyle = '#f43f5e99'
  ctx.font = '28px Inter, sans-serif'
  ctx.fillText('HZ REFRESH RATE', W / 2, H * 0.48)

  // Performance bars
  const barX = W * 0.2
  const barW = W * 0.6
  const bars = [
    { label: 'Response', value: 0.95, color: '#f43f5e' },
    { label: 'Precision', value: 0.88, color: '#ec4899' },
    { label: 'Motion Clarity', value: 0.92, color: '#8b5cf6' },
  ]
  bars.forEach((b, i) => {
    const by = H * 0.62 + i * 50
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(b.label, barX, by - 6)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    roundRect(ctx, barX, by, barW, 6, 3)
    ctx.fill()
    ctx.fillStyle = b.color
    roundRect(ctx, barX, by, barW * b.value, 6, 3)
    ctx.fill()
  })

  // Features
  const featY = H * 0.82
  const feats = ['NVIDIA Reflex', 'ULMB 2', 'eSports Mode', 'IPS Panel']
  feats.forEach((f, i) => {
    const fx = barX + i * (barW / 4)
    ctx.fillStyle = '#f43f5e20'
    roundRect(ctx, fx, featY, barW / 4 - 10, 36, 8)
    ctx.fill()
    ctx.strokeStyle = '#f43f5e40'
    ctx.lineWidth = 0.5
    ctx.stroke()
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(f, fx + (barW / 4 - 10) / 2, featY + 24)
  })

  // Brand
  ctx.fillStyle = '#f43f5e80'
  ctx.font = 'bold 32px Syne, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('BLITZ 27', W / 2, H * 0.96)

  fs.writeFileSync(path.join(OUT, 'blitz27_screen.png'), c.toBuffer('image/png'))
  console.log('blitz27_screen.png')
}

generateTitan45()
generateUltraView49()
generateBlitz27()
console.log('Done!')
