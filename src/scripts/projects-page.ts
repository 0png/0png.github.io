import {
  matchesProjectFilter,
  PROJECTS_FOCUS_END,
  PROJECTS_FOCUS_START,
  PROJECTS_MOBILE_BREAKPOINT,
} from '@/lib/projects-page'

export function initProjectsPage(root: ParentNode = document) {
  const reduceProjectsMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const revealTargets = root.querySelectorAll<HTMLElement>('[data-projects-reveal]')
  const depthCards = root.querySelectorAll<HTMLElement>('[data-project-depth]')
  const layerTargets = root.querySelectorAll<HTMLElement>('[data-projects-layer]')
  const filterButtons = root.querySelectorAll<HTMLButtonElement>('[data-project-filter]')
  const projectCards = root.querySelectorAll<HTMLElement>('[data-project-card]')
  const countLabel = root.querySelector<HTMLElement>('[data-project-count]')

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  )

  revealTargets.forEach((target) => revealObserver.observe(target))

  function resetProjectsDepth() {
    layerTargets.forEach((target) => target.style.removeProperty('--layer-y'))
    depthCards.forEach((card) => {
      card.style.transform = ''
      card.classList.remove('is-focused')
      card.querySelector<HTMLElement>('[data-project-lock]')?.style.removeProperty('transform')
      card.querySelector<HTMLElement>('[data-project-media]')?.style.removeProperty('transform')
      card.querySelector<HTMLElement>('[data-project-callout]')?.style.removeProperty('transform')
    })
  }

  function updateProjectsDepth() {
    if (reduceProjectsMotion || window.innerWidth <= PROJECTS_MOBILE_BREAKPOINT) {
      resetProjectsDepth()
      return
    }

    layerTargets.forEach((target) => {
      const speed = Number(target.dataset.speed ?? 0)
      target.style.setProperty('--layer-y', `${window.scrollY * speed}px`)
    })

    depthCards.forEach((card) => {
      if (card.classList.contains('is-hidden')) return

      const rect = card.getBoundingClientRect()
      const travel = Math.max(rect.height - window.innerHeight * 0.36, 1)
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.68 - rect.top) / travel))
      const distance =
        progress < PROJECTS_FOCUS_START
          ? (progress - PROJECTS_FOCUS_START) / PROJECTS_FOCUS_START
          : progress > PROJECTS_FOCUS_END
            ? (progress - PROJECTS_FOCUS_END) / (1 - PROJECTS_FOCUS_END)
            : 0
      const clamped = Math.max(-1, Math.min(1, distance))
      const side = Number(card.style.getPropertyValue('--stack-side') || 1)
      const focus = clamped === 0 ? 1 : Math.max(0, 1 - Math.min(Math.abs(clamped) / 0.72, 1))
      const eased = 1 - focus
      const z = -Math.abs(clamped) * 210 * eased
      const y = 0
      const x = side * clamped * 86 * eased
      const rotateY = side * clamped * -21 * eased
      const rotateX = clamped * 6 * eased
      const scale = 1 - Math.abs(clamped) * 0.12 * eased

      const lock = card.querySelector<HTMLElement>('[data-project-lock]')
      if (lock) {
        lock.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`
      }
      card.classList.toggle('is-focused', focus > 0.36)

      const media = card.querySelector<HTMLElement>('[data-project-media]')
      const callout = card.querySelector<HTMLElement>('[data-project-callout]')

      if (media) {
        media.style.transform = `translate3d(0, ${clamped * 36 * eased}px, ${70 + focus * 24}px)`
      }

      if (callout) {
        callout.style.transform = `translate3d(${side * clamped * -42 * eased}px, ${clamped * -18 * eased}px, ${160 + focus * 32}px) scale(${0.96 + focus * 0.04})`
      }
    })
  }

  function applyProjectFilter(filter: string) {
    let visibleCount = 0

    projectCards.forEach((card) => {
      const tags = (card.dataset.projectTags ?? '').split('|')
      const isVisible = matchesProjectFilter(tags, filter)
      card.classList.toggle('is-hidden', !isVisible)
      if (isVisible) visibleCount += 1
    })

    if (countLabel) {
      countLabel.textContent = String(visibleCount)
    }

    updateProjectsDepth()
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.projectFilter ?? 'all'
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button))
      applyProjectFilter(filter)
    })
  })

  updateProjectsDepth()
  window.addEventListener('scroll', updateProjectsDepth, { passive: true })
  window.addEventListener('resize', updateProjectsDepth)
}
