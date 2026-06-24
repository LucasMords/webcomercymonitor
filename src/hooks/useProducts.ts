import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Monitor } from '../data/monitors'

function mapRow(row: Record<string, unknown>): Monitor {
  return {
    id: row.id as string,
    name: row.name as string,
    tagline: (row.tagline as string) || '',
    price: row.price as number,
    screenSize: (row.screen_size as string) || '',
    resolution: (row.resolution as string) || '',
    refreshRate: (row.refresh_rate as string) || '',
    panelType: (row.panel_type as string) || '',
    responseTime: (row.response_time as string) || '',
    curvature: (row.curvature as string) || 'Flat',
    hdr: (row.hdr as string) || '',
    color: (row.color as string) || '',
    colorHex: (row.color_hex as string) || '#1a1a1a',
    accentColor: (row.accent_color as string) || '#6366f1',
    features: (row.features as string[]) || [],
    featured: (row.featured as boolean) || false,
    aspect: (row.aspect as Monitor['aspect']) || '16:9',
    sizeInches: (row.size_inches as number) || 27,
    curved: (row.curved as boolean) || false,
    stand: (row.stand as Monitor['stand']) || 'fixed',
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Monitor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: false })

      if (!error && data) {
        setProducts((data as Record<string, unknown>[]).map(mapRow))
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return { products, loading }
}
