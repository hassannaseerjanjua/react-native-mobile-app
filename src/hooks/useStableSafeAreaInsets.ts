import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns safe area insets frozen after first render.
 * Prevents layout jumps when insets recalculate (e.g. cached data triggers
 * re-render). Use for screens prone to header jerk (Orders, FAQ, InboxOutbox).
 */
export function useStableSafeAreaInsets() {
  const liveInset = useSafeAreaInsets();
  const stableRef = useRef(liveInset);
  return stableRef.current;
}
