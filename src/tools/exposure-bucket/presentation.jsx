import { createContext, useContext } from 'react';

// stage === null means "not in presentation mode" → everything renders normally.
// 0 = title screen, 1 = bucket, 2 = + shutter, 3 = + aperture,
// 4 = + rain control, 5 = + bucket-width control (fully revealed).
const PresentationContext = createContext(null);

export const PresentationProvider = PresentationContext.Provider;

export function usePresentation() {
  return useContext(PresentationContext);
}

// Returns true when the requested element should render. `null` context
// (default — used by the non-presentation page) shows everything.
export function showAt(ctx, minStage, opts = {}) {
  if (!ctx) return true;
  if (ctx.stage < minStage) return false;
  if (opts.requireRevealed && !ctx.controlsRevealed) return false;
  return true;
}
