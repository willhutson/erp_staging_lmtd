"use client"

/**
 * RTL-safe spacing helpers
 * Use these instead of hard-coded left/right
 */
export function getStartPadding(value: number): Record<string, number> {
  return {
    paddingInlineStart: value,
  }
}

export function getEndPadding(value: number): Record<string, number> {
  return {
    paddingInlineEnd: value,
  }
}

export function getStartMargin(value: number): Record<string, number> {
  return {
    marginInlineStart: value,
  }
}

export function getEndMargin(value: number): Record<string, number> {
  return {
    marginInlineEnd: value,
  }
}

/**
 * Tailwind RTL class helpers
 */
export const rtlStart = "ps-" // padding-inline-start
export const rtlEnd = "pe-" // padding-inline-end
export const rtlMarginStart = "ms-" // margin-inline-start
export const rtlMarginEnd = "me-" // margin-inline-end
