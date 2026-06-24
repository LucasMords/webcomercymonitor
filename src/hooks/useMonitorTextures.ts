import { useMemo } from 'react'
import * as THREE from 'three'
import type { Monitor } from '../data/monitors'

function drawGamingScreen(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1)

  ctx.strokeStyle = accent + '30'
  ctx.lineWidth = 2
  ctx.strokeRect(w * 0.25, h * 0.3, w * 0.5, h * 0.4)

  ctx.strokeStyle = accent + '20'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(w / 2, h * 0.32)
  ctx.lineTo(w / 2, h * 0.68)
  ctx.moveTo(w * 0.27, h / 2)
  ctx.lineTo(w * 0.73, h / 2)
  ctx.stroke()

  ctx.font = `bold ${Math.floor(w * 0.07)}px Inter, sans-serif`
  ctx.fillStyle = accent
  ctx.textAlign = 'center'
  ctx.fillText('FPS', w * 0.25, h * 0.2)

  ctx.font = `${Math.floor(w * 0.09)}px Syne, sans-serif`
  ctx.fillText('240', w * 0.25, h * 0.28)

  ctx.textAlign = 'left'
  ctx.font = `${Math.floor(w * 0.04)}px Inter, sans-serif`
  ctx.fillStyle = '#64748b'
  ctx.fillText('LATENCY 0.03ms', w * 0.06, h * 0.85)
  ctx.fillText('G-SYNC ON', w * 0.06, h * 0.91)

  ctx.fillStyle = accent + '80'
  ctx.font = `${Math.floor(w * 0.06)}px Syne, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText('GAMING MODE', w * 0.94, h * 0.91)
}

function drawUltrawideScreen(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(99,102,241,0.04)'
  ctx.fillRect(w * 0.03, h * 0.1, w * 0.43, h * 0.53)
  ctx.fillRect(w * 0.49, h * 0.1, w * 0.48, h * 0.38)
  ctx.fillRect(w * 0.49, h * 0.52, w * 0.22, h * 0.35)
  ctx.fillRect(w * 0.73, h * 0.52, w * 0.24, h * 0.35)

  ctx.strokeStyle = accent + '30'
  ctx.lineWidth = 1
  ctx.strokeRect(w * 0.03, h * 0.1, w * 0.43, h * 0.53)
  ctx.strokeRect(w * 0.49, h * 0.1, w * 0.48, h * 0.38)
  ctx.strokeRect(w * 0.49, h * 0.52, w * 0.22, h * 0.35)
  ctx.strokeRect(w * 0.73, h * 0.52, w * 0.24, h * 0.35)

  ctx.fillStyle = accent
  ctx.font = `${Math.floor(w * 0.035)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('MULTI-WINDOW WORKFLOW', w / 2, h * 0.06)

  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = accent + '15'
    const lx = w * 0.06
    ctx.fillRect(lx, h * 0.16 + i * h * 0.075, w * 0.15, h * 0.01)
  }

  ctx.fillStyle = accent
  ctx.font = `bold ${Math.floor(w * 0.05)}px Inter, sans-serif`
  ctx.fillText('KVM', w * 0.5 + w * 0.24, h * 0.62)
  ctx.fillText('PIP', w * 0.73 + w * 0.12, h * 0.62)
}

function drawDesignScreen(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = '#0c0c0c'
  ctx.fillRect(0, 0, w, h)

  const gridSize = w * 0.08
  ctx.strokeStyle = accent + '08'
  ctx.lineWidth = 0.5
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#14b8a6']
  palette.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.roundRect(w * 0.12 + i * w * 0.13, h * 0.35, w * 0.1, w * 0.1, 8)
    ctx.fill()
  })

  const cx = w * 0.45
  const cy = h * 0.6
  const r = w * 0.15
  const grad = ctx.createConicGradient(cx, cy, 0)
  grad.addColorStop(0, '#f43f5e')
  grad.addColorStop(0.25, '#f59e0b')
  grad.addColorStop(0.5, '#14b8a6')
  grad.addColorStop(0.75, '#6366f1')
  grad.addColorStop(1, '#f43f5e')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = accent
  ctx.font = `${Math.floor(w * 0.04)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('DCI-P3 98%', w * 0.7, h * 0.8)
  ctx.fillText('Delta E < 1', w * 0.7, h * 0.86)
}

function drawProductivityScreen(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = accent + '08'
  ctx.font = `bold ${Math.floor(w * 0.06)}px Inter, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText('DASHBOARD', w * 0.06, h * 0.12)

  const barWidth = w * 0.8
  const barStart = w * 0.1
  const charts = [
    { label: 'Revenue', value: 0.85, color: accent },
    { label: 'Users', value: 0.62, color: '#8b5cf6' },
    { label: 'Growth', value: 0.93, color: '#14b8a6' },
    { label: 'Churn', value: 0.28, color: '#f43f5e' },
  ]
  charts.forEach((c, i) => {
    const y = h * 0.31 + i * h * 0.14
    ctx.fillStyle = '#64748b'
    ctx.font = `${Math.floor(w * 0.028)}px Inter, sans-serif`
    ctx.fillText(c.label, barStart, y - 4)
    ctx.fillStyle = '#1e1e2e'
    ctx.beginPath(); ctx.roundRect(barStart, y, barWidth, h * 0.04, 4); ctx.fill()
    ctx.fillStyle = c.color
    ctx.beginPath(); ctx.roundRect(barStart, y, barWidth * c.value, h * 0.04, 4); ctx.fill()
  })

  ctx.fillStyle = accent + '60'
  ctx.font = `${Math.floor(w * 0.05)}px Syne, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText('REAL-TIME', w * 0.94, h * 0.91)
}

function drawEsportsScreen(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = '#050508'
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 20; i++) {
    const rx = Math.random() * w
    const ry = Math.random() * h
    ctx.fillStyle = accent + `${Math.floor(Math.random() * 10 + 5)}`
    ctx.fillRect(rx, ry, w * 0.04, 1)
  }

  ctx.font = `bold ${Math.floor(w * 0.09)}px Syne, sans-serif`
  ctx.fillStyle = accent
  ctx.textAlign = 'center'
  ctx.fillText('540', w / 2, h * 0.35)

  ctx.font = `${Math.floor(w * 0.05)}px Inter, sans-serif`
  ctx.fillText('HZ REFRESH RATE', w / 2, h * 0.42)

  ctx.fillStyle = accent + '40'
  ctx.font = `bold ${Math.floor(w * 0.04)}px Inter, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText('DAC+ DYNAMIC ACCURACY', w * 0.06, h * 0.6)
  ctx.fillText('0.3ms RESPONSE TIME', w * 0.06, h * 0.66)
  ctx.fillText('NVIDIA REFLEX ON', w * 0.06, h * 0.72)

  ctx.strokeStyle = accent + '30'
  ctx.lineWidth = 1
  ctx.beginPath()
  const pulseY = h * 0.55
  for (let x = 0; x < w; x += 2) {
    const y = pulseY + Math.sin(x * 0.02 + Date.now() * 0.001) * h * 0.04
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

function drawScreenForMonitor(ctx: CanvasRenderingContext2D, w: number, h: number, monitor: Monitor) {
  const accent = monitor.accentColor

  if (monitor.id === 'titan-45' || monitor.curved && monitor.sizeInches >= 45) {
    drawGamingScreen(ctx, w, h, accent)
  } else if (monitor.aspect === '32:9' || (monitor.aspect === '21:9' && monitor.sizeInches >= 38)) {
    drawUltrawideScreen(ctx, w, h, accent)
  } else if (monitor.id === 'spectra-32' || monitor.id === 'artisan-27' || monitor.panelType.includes('OLED') || monitor.resolution.includes('5120')) {
    drawDesignScreen(ctx, w, h, accent)
  } else if (monitor.id === 'pro-32' || monitor.id === 'panorama-38' || monitor.id === 'luxview-27') {
    drawProductivityScreen(ctx, w, h, accent)
  } else {
    drawEsportsScreen(ctx, w, h, accent)
  }
}

function generateBodyTexture(colorHex: string, sizeInches: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  const s = 256
  canvas.width = s
  canvas.height = s
  const ctx = canvas.getContext('2d')!

  const baseColor = new THREE.Color(colorHex)
  baseColor.convertSRGBToLinear()

  ctx.fillStyle = `rgb(${Math.floor(baseColor.r * 255)},${Math.floor(baseColor.g * 255)},${Math.floor(baseColor.b * 255)})`
  ctx.fillRect(0, 0, s, s)

  for (let i = 0; i < s * s * 0.08; i++) {
    const x = Math.random() * s
    const y = Math.random() * s
    const v = (Math.random() - 0.5) * 20
    const r = Math.max(0, Math.min(255, Math.floor(baseColor.r * 255 + v)))
    const g = Math.max(0, Math.min(255, Math.floor(baseColor.g * 255 + v)))
    const b = Math.max(0, Math.min(255, Math.floor(baseColor.b * 255 + v)))
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(x, y, 2, 2)
  }

  if (sizeInches <= 27) {
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    for (let x = 0; x < s; x += 3) {
      ctx.fillRect(x, 0, 1, s)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  return tex
}

export function useMonitorTextures(monitor: Monitor | null) {
  const screenTexture = useMemo(() => {
    if (!monitor) return null
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = monitor.aspect === '32:9' ? 360 : monitor.aspect === '21:9' ? 512 : 640
    const ctx = canvas.getContext('2d')!
    drawScreenForMonitor(ctx, canvas.width, canvas.height, monitor)

    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [monitor])

  const bodyTexture = useMemo(() => {
    if (!monitor) return null
    return generateBodyTexture(monitor.colorHex, monitor.sizeInches)
  }, [monitor])

  const envPreset = useMemo(() => {
    if (!monitor) return 'city' as const
    if (monitor.stand === 'gaming') return 'night' as const
    if (monitor.stand === 'professional' || monitor.stand === 'minimalist') return 'studio' as const
    if (monitor.stand === 'arm') return 'dawn' as const
    return 'city' as const
  }, [monitor])

  return { screenTexture, bodyTexture, envPreset }
}
