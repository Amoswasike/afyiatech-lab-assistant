// The private single-source-of-truth state
const _state = {
  value: null,
  unit: "mgdl",
  test: "phosphate"
};

/**
 * Returns a read-only copy of the current state.
 * This prevents other modules from accidentally mutating it directly.
 */
export function getState() {
  return { ..._state };
}

/**
 * Updates the state and ensures structural sanity.
 */
export function updateState(updates) {
  // 1. Assign the updates to our state object
  Object.assign(_state, updates);

  // 2. Clear out the value if the test changes
  // (Prevents a Phosphate number from being interpreted as a Magnesium number)
  if (updates.test) {
    _state.value = null;
  }

  console.log("State updated:", _state); // Helpful for debugging your app
  return { ..._state };
}
