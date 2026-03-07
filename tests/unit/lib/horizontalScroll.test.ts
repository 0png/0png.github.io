// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- mocks ---

const { mockGsapTo, mockGsapFromTo, mockToArrayFn } = vi.hoisted(() => ({
  mockGsapTo: vi.fn(),
  mockGsapFromTo: vi.fn(),
  mockToArrayFn: vi.fn(),
}))

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    to: mockGsapTo,
    fromTo: mockGsapFromTo,
    utils: {
      toArray: mockToArrayFn,
    },
    ticker: {
      add: vi.fn(),
      lagSmoothing: vi.fn(),
    },
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { update: vi.fn() },
}))

import { initHorizontalScroll } from '@/lib/horizontalScroll'

function makeFakeTrack(scrollWidth: number, cardCount = 2) {
  const cards = Array.from({ length: cardCount }, (_, i) => ({
    querySelector: vi.fn(() => ({ dataset: {} })),
    dataset: { index: String(i) },
  }))

  const track = {
    scrollWidth,
    querySelectorAll: vi.fn(() => cards),
  } as unknown as Element

  return { track, cards }
}

function makeFakeSection() {
  return document.createElement('div') as unknown as Element
}

describe('initHorizontalScroll', () => {
  const fakeInnerWidth = 1024

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'innerWidth', {
      value: fakeInnerWidth,
      writable: true,
    })
  })

  it('calls gsap.to on the track element', () => {
    const { track, cards } = makeFakeTrack(3072)
    const section = makeFakeSection()
    mockToArrayFn.mockReturnValue(cards)
    mockGsapTo.mockReturnValue({ scrollTrigger: {} })

    initHorizontalScroll(section, track)

    expect(mockGsapTo).toHaveBeenCalledTimes(1)
    expect(mockGsapTo).toHaveBeenCalledWith(track, expect.any(Object))
  })

  it('tweens x to -(scrollWidth - innerWidth)', () => {
    const scrollWidth = 3072
    const expectedX = -(scrollWidth - fakeInnerWidth)
    const { track, cards } = makeFakeTrack(scrollWidth)
    const section = makeFakeSection()
    mockToArrayFn.mockReturnValue(cards)
    mockGsapTo.mockReturnValue({ scrollTrigger: {} })

    initHorizontalScroll(section, track)

    const callArgs = mockGsapTo.mock.calls[0][1] as Record<string, unknown>
    expect(callArgs.x).toBe(expectedX)
  })

  it('passes pin: true to the ScrollTrigger config', () => {
    const { track, cards } = makeFakeTrack(3072)
    const section = makeFakeSection()
    mockToArrayFn.mockReturnValue(cards)
    mockGsapTo.mockReturnValue({ scrollTrigger: {} })

    initHorizontalScroll(section, track)

    const callArgs = mockGsapTo.mock.calls[0][1] as Record<string, unknown>
    const st = callArgs.scrollTrigger as Record<string, unknown>
    expect(st.pin).toBe(true)
  })

  it('passes scrub: 1 to the ScrollTrigger config', () => {
    const { track, cards } = makeFakeTrack(3072)
    const section = makeFakeSection()
    mockToArrayFn.mockReturnValue(cards)
    mockGsapTo.mockReturnValue({ scrollTrigger: {} })

    initHorizontalScroll(section, track)

    const callArgs = mockGsapTo.mock.calls[0][1] as Record<string, unknown>
    const st = callArgs.scrollTrigger as Record<string, unknown>
    expect(st.scrub).toBe(1)
  })

  it('passes invalidateOnRefresh: true to the ScrollTrigger config', () => {
    const { track, cards } = makeFakeTrack(3072)
    const section = makeFakeSection()
    mockToArrayFn.mockReturnValue(cards)
    mockGsapTo.mockReturnValue({ scrollTrigger: {} })

    initHorizontalScroll(section, track)

    const callArgs = mockGsapTo.mock.calls[0][1] as Record<string, unknown>
    const st = callArgs.scrollTrigger as Record<string, unknown>
    expect(st.invalidateOnRefresh).toBe(true)
  })
})
