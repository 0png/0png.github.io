import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock is hoisted — use vi.hoisted() for variables referenced in factories
const mocks = vi.hoisted(() => {
  const mockLenisOn = vi.fn()
  const mockLenisRaf = vi.fn()
  const mockLenisInstance = { on: mockLenisOn, raf: mockLenisRaf }
  const MockLenis = vi.fn(() => mockLenisInstance)

  const mockTickerAdd = vi.fn()
  const mockTickerLagSmoothing = vi.fn()
  const mockScrollTriggerUpdate = vi.fn()

  return {
    mockLenisOn,
    mockLenisRaf,
    mockLenisInstance,
    MockLenis,
    mockTickerAdd,
    mockTickerLagSmoothing,
    mockScrollTriggerUpdate,
  }
})

vi.mock('lenis', () => ({ default: mocks.MockLenis }))

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    ticker: {
      add: mocks.mockTickerAdd,
      lagSmoothing: mocks.mockTickerLagSmoothing,
    },
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { update: mocks.mockScrollTriggerUpdate },
}))

import { initScroll } from '@/lib/scroll'

describe('initScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.MockLenis.mockReturnValue(mocks.mockLenisInstance)
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        history: { scrollRestoration: 'auto' },
        scrollTo: vi.fn(),
        addEventListener: vi.fn(),
      },
    })
  })

  it('returns the Lenis instance', () => {
    const result = initScroll()
    expect(result).toBe(mocks.mockLenisInstance)
  })

  it('creates Lenis with lerp: 0.1 and smoothWheel: true', () => {
    initScroll()
    expect(mocks.MockLenis).toHaveBeenCalledWith({ lerp: 0.1, smoothWheel: true })
  })

  it('registers a ticker callback with gsap.ticker.add', () => {
    initScroll()
    expect(mocks.mockTickerAdd).toHaveBeenCalledTimes(1)
    expect(mocks.mockTickerAdd).toHaveBeenCalledWith(expect.any(Function))
  })

  it('ticker callback feeds lenis.raf with time * 1000', () => {
    initScroll()
    const tickerCb = mocks.mockTickerAdd.mock.calls[0][0] as (t: number) => void
    tickerCb(1.5)
    expect(mocks.mockLenisRaf).toHaveBeenCalledWith(1500)
  })

  it('calls gsap.ticker.lagSmoothing(0)', () => {
    initScroll()
    expect(mocks.mockTickerLagSmoothing).toHaveBeenCalledWith(0)
  })

  it('registers ScrollTrigger.update on lenis scroll event', () => {
    initScroll()
    expect(mocks.mockLenisOn).toHaveBeenCalledWith('scroll', mocks.mockScrollTriggerUpdate)
  })

  it('can force the homepage back to the hero on load and pageshow restore', () => {
    initScroll({ resetToTopOnLoad: true })

    expect(window.history.scrollRestoration).toBe('manual')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
    expect(window.addEventListener).toHaveBeenCalledWith('pageshow', expect.any(Function))
  })
})
