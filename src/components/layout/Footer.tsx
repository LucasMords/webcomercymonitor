import { scrollToSection } from '../../utils/scrollTo'

export function Footer() {
  const handleLinkClick = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (window.location.pathname !== '/') {
      window.location.href = `/#${hash}`
    } else {
      scrollToSection(hash)
    }
  }

  return (
    <footer className="relative border-t border-white/5 bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">viewep</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Monitores premium para produtividade, gaming e criação. Eleve sua experiência visual com tecnologia de ponta.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium mb-4">Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Home', hash: 'intro' },
                { label: 'Catálogo', hash: 'catalog' },
                { label: 'Showcase', hash: 'showcase' },
              ].map((l) => (
                <a
                  key={l.hash}
                  href={`/#${l.hash}`}
                  onClick={handleLinkClick(l.hash)}
                  className="text-zinc-400 text-sm hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium mb-4">Social</h4>
            <div className="flex flex-col gap-2">
              {['Instagram', 'Twitter', 'YouTube', 'Discord'].map((l) => (
                <span key={l} className="text-zinc-500 text-sm">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-xs">
            &copy; {new Date().getFullYear()} viewep. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <span className="text-zinc-500 text-xs">Privacidade</span>
            <span className="text-zinc-500 text-xs">Termos</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
