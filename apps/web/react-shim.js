// ESM shim for React so Next 14's server runtime always finds React.cache()

// apps/web/react-shim.js
export * from "../../node_modules/react/index.js";
import * as ReactNS from "../../node_modules/react/index.js";
export default ReactNS;

// Provide a no-op cache if not present (for Next internals)
export const cache =
  typeof ReactNS.cache === "function" ? ReactNS.cache : (fn) => fn;