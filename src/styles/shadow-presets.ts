/**
 * Shadow presets for rn-shadow-2 - minimal/subtle shadows.
 * Use with: <Shadow {...SHADOW_PRESETS.storeCard}>...</Shadow> or <ShadowView preset="storeCard">
 */
export const SHADOW_PRESETS = {
  /** Store card - very soft */
  storeCard: {
    startColor: '#00000008',
    distance: 24,
    offset: [0, 0] as [number, number],
  },

  /** Search bar */
  searchBar: {
    startColor: '#00000006',
    distance: 12,
    offset: [0, 0] as [number, number],
  },

  /** Default card/container */
  default: {
    startColor: '#00000008',
    distance: 12,
    offset: [0, 1] as [number, number],
  },

  /** Input field */
  input: {
    startColor: '#00000006',
    distance: 10,
    offset: [0, 0] as [number, number],
  },

  /** Medium */
  medium: {
    startColor: '#0000000C',
    distance: 6,
    offset: [0, 1] as [number, number],
  },

  /** Low/subtle */
  low: {
    startColor: '#00000006',
    distance: 3,
    offset: [0, 1] as [number, number],
  },

  /** List items - smooth, soft shadow for occasion/group cards */
  listItem: {
    startColor: '#00000006',
    distance: 8,
    offset: [0, 1] as [number, number],
  },

  /** Notification item - 0px 0px 25px #0000000D */
  notification: {
    startColor: '#0000000D',
    distance: 25,
    offset: [0, 0] as [number, number],
  },

  /** QR container - light, shadow below */
  qrContainer: {
    startColor: '#00000006',
    distance: 10,
    offset: [0, 1] as [number, number],
  },

  /** QR item container - light, shadow below */
  qrItemContainer: {
    startColor: '#00000006',
    distance: 10,
    offset: [0, 1] as [number, number],
  },
} as const;

export type ShadowPresetName = keyof typeof SHADOW_PRESETS;
