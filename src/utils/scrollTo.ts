export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function navigateAndScroll(path: string, hash: string) {
  if (window.location.pathname === path) {
    scrollToSection(hash)
  } else {
    sessionStorage.setItem('scrollTo', hash)
    window.location.href = path
  }
}
