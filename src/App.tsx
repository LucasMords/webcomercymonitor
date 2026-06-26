import { useEffect, lazy, Suspense, Component } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from './store/useAuthStore'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollProgress } from './components/layout/ScrollProgress'
import { MonitorViewer } from './components/catalog/MonitorViewer'
import { ToastContainer } from './components/ui/Toast'
import { scrollToSection } from './utils/scrollTo'
import { useCartAutoSync } from './hooks/useCartAutoSync'

const IntroSection = lazy(() => import('./components/intro/IntroSection').then(m => ({ default: m.IntroSection })))
const HeroSection = lazy(() => import('./components/hero/HeroSection').then(m => ({ default: m.HeroSection })))
const FeaturesSection = lazy(() => import('./components/features/FeaturesSection').then(m => ({ default: m.FeaturesSection })))
const CatalogSection = lazy(() => import('./components/catalog/CatalogSection').then(m => ({ default: m.CatalogSection })))
const ShowcaseSection = lazy(() => import('./components/showcase/ShowcaseSection').then(m => ({ default: m.ShowcaseSection })))
const CheckoutPage = lazy(() => import('./pages/Checkout').then(m => ({ default: m.CheckoutPage })))
const ConfirmationPage = lazy(() => import('./pages/Confirmation').then(m => ({ default: m.ConfirmationPage })))
const OrdersPage = lazy(() => import('./pages/Orders').then(m => ({ default: m.OrdersPage })))

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-5xl font-display font-bold text-white/10 mb-4">!</p>
            <h1 className="text-xl font-display font-bold text-white mb-3">Algo deu errado</h1>
            <p className="text-zinc-400 mb-8 text-sm">Ocorreu um erro inesperado. Tente recarregar a pagina.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function SectionFallback() {
  return <div className="h-screen bg-surface" />
}

function ScrollRestoration() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const stored = sessionStorage.getItem('scrollTo')
    if (stored) {
      sessionStorage.removeItem('scrollTo')
      setTimeout(() => scrollToSection(stored), 150)
      return
    }
    if (hash) {
      setTimeout(() => scrollToSection(hash.replace('#', '')), 150)
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

function HomePage() {
  return (
    <main>
      <Suspense fallback={<SectionFallback />}>
        <IntroSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CatalogSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ShowcaseSection />
      </Suspense>
    </main>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-white/5 mb-4">404</p>
        <h1 className="text-2xl font-display font-bold text-white mb-3">Pagina nao encontrada</h1>
        <p className="text-zinc-400 mb-8">A pagina que voce procura nao existe ou foi movida.</p>
        <a
          href="/"
          className="inline-flex px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          Voltar para Home
        </a>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
      >
        <Suspense fallback={<SectionFallback />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  useCartAutoSync()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface text-white">
        <ScrollRestoration />
        <ScrollProgress />
        <Navbar />
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
        <Footer />
        <MonitorViewer />
        <ToastContainer />
      </div>
    </BrowserRouter>
  )
}
