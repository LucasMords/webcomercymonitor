import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'

export function useScreenCanvas() {
  const frameRef = useRef(0)
  const runningRef = useRef(true)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640

    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.colorSpace = THREE.SRGBColorSpace

    const ctx = canvas.getContext('2d')!

    function draw() {
      if (!runningRef.current) return
      const w = canvas.width
      const h = canvas.height
      const t = frameRef.current * 0.016

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, w, h)

      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = 'rgba(255,255,255,0.015)'
        ctx.fillRect(0, y, w, 1)
      }

      ctx.fillStyle = 'rgba(99,102,241,0.06)'
      for (let x = 0; x < w; x += 40) {
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.fillStyle = 'rgba(10,10,15,0.9)'
      ctx.fillRect(0, 0, w, 52)
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(30, 14, 24, 24)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.fillText('viewep', 62, 32)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px Inter, sans-serif'
      ctx.fillText('Home', w - 310, 32)
      ctx.fillText('Catálogo', w - 240, 32)
      ctx.fillText('Showcase', w - 155, 32)
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(w - 100, 12, 70, 28, 20)
      ctx.stroke()
      ctx.fillStyle = '#f1f5f9'
      ctx.fillText('Contato', w - 86, 32)
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.beginPath()
      ctx.moveTo(0, 52)
      ctx.lineTo(w, 52)
      ctx.stroke()

      const heroY = 140
      const so = Math.sin(t * 0.8) * 6
      ctx.fillStyle = 'rgba(99,102,241,0.12)'
      ctx.beginPath()
      ctx.roundRect(30, heroY + so, 120, 26, 20)
      ctx.fill()
      ctx.strokeStyle = 'rgba(99,102,241,0.3)'
      ctx.stroke()
      ctx.fillStyle = '#a5b4fc'
      ctx.font = '10px Inter, sans-serif'
      ctx.fillText('MONITORES PREMIUM', 42, heroY + 18 + so)
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 52px Syne, sans-serif'
      ctx.fillText('viewep', 30, heroY + 60 + so)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText('Eleve sua experiência visual com monitores', 30, heroY + 90 + so)
      ctx.fillText('de alto desempenho.', 30, heroY + 112 + so)

      ctx.fillStyle = '#6366f1'
      ctx.beginPath()
      ctx.roundRect(30, heroY + 150 + so, 130, 40, 16)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = '13px Inter, sans-serif'
      ctx.fillText('Explorar Catálogo →', 46, heroY + 175 + so)
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath()
      ctx.roundRect(175, heroY + 150 + so, 110, 40, 16)
      ctx.stroke()
      ctx.fillStyle = '#cbd5e1'
      ctx.fillText('Showcase', 200, heroY + 175 + so)

      const cardY = 480
      const cards = [
        { title: '240Hz', desc: 'Refresh Rate' },
        { title: '4K/5K', desc: 'Resolução' },
        { title: 'QD-OLED', desc: 'Tecnologia' },
      ]
      cards.forEach((card, i) => {
        const cx = 30 + i * 320
        ctx.fillStyle = 'rgba(255,255,255,0.02)'
        ctx.beginPath()
        ctx.roundRect(cx, cardY, 300, 80, 14)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.stroke()
        ctx.fillStyle = '#6366f1'
        ctx.beginPath()
        ctx.roundRect(cx + 12, cardY + 14, 36, 36, 10)
        ctx.fill()
        ctx.fillStyle = '#f1f5f9'
        ctx.font = 'bold 18px Inter, sans-serif'
        ctx.fillText(card.title, cx + 60, cardY + 36)
        ctx.fillStyle = '#64748b'
        ctx.font = '11px Inter, sans-serif'
        ctx.fillText(card.desc, cx + 60, cardY + 54)
      })

      const cx = 420 + Math.sin(t * 1.3) * 200
      const cy = heroY + 40 + Math.cos(t * 0.9) * 80 + so
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + 10, cy + 10)
      ctx.lineTo(cx + 4, cy + 10)
      ctx.lineTo(cx + 6, cy + 16)
      ctx.lineTo(cx + 2, cy + 18)
      ctx.lineTo(cx, cy + 12)
      ctx.lineTo(cx - 4, cy + 12)
      ctx.closePath()
      ctx.fillStyle = 'rgba(99,102,241,0.8)'
      ctx.fill()
      ctx.stroke()

      const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.5, w / 2, h / 2, w * 0.75)
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)

      frameRef.current++
      requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)

    return tex
  }, [])

  useEffect(() => {
    runningRef.current = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        runningRef.current = entry.isIntersecting
      },
      { threshold: 0 }
    )
    const el = document.getElementById('intro')
    if (el) observer.observe(el)

    return () => {
      runningRef.current = false
      observer.disconnect()
    }
  }, [])

  return texture
}
