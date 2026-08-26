import { createContext, useContext } from "react";

// stage === null means "not in presentation mode" → everything renders.
// 1 = shutter only, 2 = + aperture, 3 = + ISO (fully revealed).
// Aperture and ISO still drive the preview while hidden — only their
// scales and readout rows are held back.
const PresentationContext = createContext(null);

export const PresentationProvider = PresentationContext.Provider;

export function usePresentation() {
  return useContext(PresentationContext);
}

// Returns true when the requested element should render. `null` context
// (the default, used outside presentation mode) shows everything.
export function showAt(ctx, minStage) {
  if (!ctx) return true;
  return ctx.stage >= minStage;
}
