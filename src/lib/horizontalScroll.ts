import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initHorizontalScroll(sectionEl: Element, trackEl: Element): void {
  const totalScrollWidth = (trackEl as HTMLElement).scrollWidth - window.innerWidth

  const tween = gsap.to(trackEl, {
    x: -totalScrollWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: sectionEl,
      pin: true,
      scrub: 1,
      end: () => `+=${totalScrollWidth}`,
      invalidateOnRefresh: true,
    },
  })

  const cards = gsap.utils.toArray<HTMLElement>('.project-card', trackEl)
  cards.forEach((card) => {
    const inner = card.querySelector('.card-inner')
    if (!inner) return
    gsap.fromTo(
      inner,
      { x: 60 },
      {
        x: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          scrub: true,
        },
      },
    )
  })
}
