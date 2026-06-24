import { useMemo } from 'react'
import * as THREE from 'three'
import type { Monitor } from '../data/monitors'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}

function drawTexture(monitor: Monitor): HTMLCanvasElement {
  const aspectW = monitor.aspect === '32:9' ? 1280 : monitor.aspect === '21:9' ? 1024 : 1024
  const aspectH = monitor.aspect === '32:9' ? 400 : monitor.aspect === '21:9' ? 512 : 600
  const W = aspectW, H = aspectH
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  const accent = monitor.accentColor

  if (monitor.id === 'titan-45' || monitor.id === 'blitz-27') {
    // Gaming theme
    ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = accent + '10'
    ctx.lineWidth = 1
    for (let i = 0; i < 15; i++) {
      ctx.beginPath(); ctx.moveTo(0, H * 0.15 + i * 28)
      ctx.lineTo(W, H * 0.05 + i * 28); ctx.stroke()
    }
    ctx.fillStyle = accent
    ctx.font = `bold ${Math.floor(W * 0.12)}px Syne, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(monitor.refreshRate.replace('Hz', ''), W / 2, H * 0.42)
    ctx.fillStyle = accent + '99'
    ctx.font = `${Math.floor(W * 0.035)}px Inter, sans-serif`
    ctx.fillText('HZ REFRESH RATE', W / 2, H * 0.5)
    ctx.fillStyle = accent + '30'
    ctx.font = `bold ${Math.floor(W * 0.03)}px Inter, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(monitor.responseTime + ' RESPONSE', W * 0.06, H * 0.65)
    ctx.fillText(monitor.panelType, W * 0.06, H * 0.72)
    ctx.textAlign = 'right'
    ctx.fillText(monitor.hdr + ' ACTIVE', W * 0.94, H * 0.72)
    ctx.fillStyle = accent + '60'
    ctx.font = `bold ${Math.floor(W * 0.04)}px Syne, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(monitor.name.toUpperCase(), W / 2, H * 0.9)

  } else if (monitor.id === 'ultra-49') {
    // Multi-window productivity
    ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, W, H)
    const panels = [
      { x: 0.01, y: 0.06, w: 0.38, h: 0.86, title: 'WORKSPACE' },
      { x: 0.41, y: 0.06, w: 0.33, h: 0.42, title: 'TERMINAL' },
      { x: 0.76, y: 0.06, w: 0.23, h: 0.42, title: 'METRICS' },
      { x: 0.41, y: 0.5, w: 0.33, h: 0.42, title: 'BROWSER' },
      { x: 0.76, y: 0.5, w: 0.23, h: 0.42, title: 'CHAT' },
    ]
    panels.forEach(p => {
      const px = W * p.x, py = H * p.y, pw = W * p.w, ph = H * p.h
      ctx.fillStyle = 'rgba(255,255,255,0.02)'
      roundRect(ctx, px, py, pw, ph, 6); ctx.fill()
      ctx.strokeStyle = accent + '30'; ctx.lineWidth = 1; ctx.stroke()
      ctx.fillStyle = accent + '20'; ctx.fillRect(px, py, pw, ph * 0.1)
      ctx.fillStyle = '#e2e8f0'; ctx.font = `bold ${Math.floor(ph * 0.08)}px Inter, sans-serif`
      ctx.textAlign = 'left'; ctx.fillText(p.title, px + 10, py + ph * 0.075)
    })
    ctx.fillStyle = accent + '80'
    ctx.font = `bold ${Math.floor(W * 0.03)}px Syne, sans-serif`
    ctx.textAlign = 'right'
    ctx.fillText('ULTRAVIEW 49', W * 0.98, H * 0.04)

  } else if (monitor.id === 'spectra-32' || monitor.id === 'artisan-27') {
    // Design/creator
    ctx.fillStyle = '#0c0c10'; ctx.fillRect(0, 0, W, H)
    const grid = W * 0.06
    ctx.strokeStyle = accent + '06'; ctx.lineWidth = 0.5
    for (let x = 0; x < W; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    const pal = [accent, '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#14b8a6']
    pal.forEach((c, i) => {
      ctx.fillStyle = c; ctx.beginPath()
      ctx.arc(W * 0.2 + i * W * 0.1, H * 0.55, W * 0.045, 0, Math.PI * 2); ctx.fill()
    })
    ctx.fillStyle = '#e2e8f0'; ctx.font = `bold ${Math.floor(W * 0.04)}px Syne, sans-serif`
    ctx.textAlign = 'center'; ctx.fillText(monitor.name.toUpperCase(), W / 2, H * 0.3)
    ctx.fillStyle = accent + '99'; ctx.font = `${Math.floor(W * 0.025)}px Inter, sans-serif`
    ctx.fillText('DCI-P3 99%  |  Delta E < 1  |  True Tone', W / 2, H * 0.38)

  } else {
    // Professional/productivity
    ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, W, H)
    const bars = [
      { l: 'Performance', v: 0.92, c: accent },
      { l: 'Color Accuracy', v: 0.85, c: '#8b5cf6' },
      { l: 'Brightness', v: 0.78, c: '#14b8a6' },
      { l: 'Contrast', v: 0.95, c: '#ec4899' },
    ]
    bars.forEach((b, i) => {
      const by = H * 0.2 + i * 70, bx = W * 0.15, bw = W * 0.7
      ctx.fillStyle = '#94a3b8'; ctx.font = `bold ${Math.floor(W * 0.022)}px Inter, sans-serif`
      ctx.textAlign = 'left'; ctx.fillText(b.l, bx, by - 8)
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; roundRect(ctx, bx, by, bw, 10, 5); ctx.fill()
      ctx.fillStyle = b.c; roundRect(ctx, bx, by, bw * b.v, 10, 5); ctx.fill()
    })
    ctx.fillStyle = accent + '80'; ctx.font = `bold ${Math.floor(W * 0.04)}px Syne, sans-serif`
    ctx.textAlign = 'center'; ctx.fillText(monitor.name.toUpperCase(), W / 2, H * 0.85)
    ctx.fillStyle = accent + '60'; ctx.font = `${Math.floor(W * 0.025)}px Inter, sans-serif`
    ctx.fillText(monitor.resolution + '  |  ' + monitor.refreshRate, W / 2, H * 0.92)
  }

  for (let y = 0; y < H; y += 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fillRect(0, y, W, 1)
  }

  return canvas
}

export function useScreenTexture(monitor: Monitor | null) {
  return useMemo(() => {
    if (!monitor) return null
    const canvas = drawTexture(monitor)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [monitor])
}
