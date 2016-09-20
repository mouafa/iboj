export function isReady (state) {
  return state.timeline.loaded
}

export function timelineData ({timeline}) {
  return timeline.data
}
