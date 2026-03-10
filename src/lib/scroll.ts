import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScroll(): Lenis {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })

  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  lenis.on('scroll', ScrollTrigger.update)

  // Expose globally so components can hook into the same Lenis instance
  ;(window as unknown as Record<string, unknown>).lenis = lenis

  return lenis
}
