import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type InitScrollOptions = {
  resetToTopOnLoad?: boolean
}

export function initScroll(options: InitScrollOptions = {}): Lenis {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })

  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  lenis.on('scroll', ScrollTrigger.update)

  if (typeof window !== 'undefined' && options.resetToTopOnLoad) {
    const resetToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    window.history.scrollRestoration = 'manual'
    resetToTop()
    window.addEventListener('pageshow', resetToTop)
  }

  // Expose globally so components can hook into the same Lenis instance.
  if (typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).lenis = lenis
  }

  return lenis
}
