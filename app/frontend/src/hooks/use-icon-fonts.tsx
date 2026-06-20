import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";

// Hook to prewarm Ionicons font family used by @expo/vector-icons.
// Returns [loaded, error] so callers can hide the native splash until
// the font registration completes — matching _layout.tsx behavior.
export function useIconFonts(): readonly [boolean, Error | null] {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Ionicons.font is the mapping expected by expo-font
        await Font.loadAsync(Ionicons.font as any);
        if (mounted) setLoaded(true);
      } catch (e) {
        if (mounted) setError(e as Error);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return [loaded, error] as const;
}
