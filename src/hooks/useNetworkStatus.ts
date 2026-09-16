import { useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import { isNativePlatform } from "@/lib/platform";

export type NetworkState = {
  online: boolean;
  connectionType: string;
  weak: boolean;
};

export function useNetworkStatus(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    connectionType: "unknown",
    weak: false,
  });

  useEffect(() => {
    let handle: { remove: () => Promise<void> } | undefined;

    const apply = (online: boolean, connectionType = "unknown") => {
      const weak = connectionType === "cellular" || connectionType === "2g" || connectionType === "slow-2g";
      setState({ online, connectionType, weak });
    };

    if (isNativePlatform()) {
      Network.getStatus()
        .then((s) => apply(s.connected, s.connectionType))
        .catch(() => apply(navigator.onLine));
      Network.addListener("networkStatusChange", (s) => apply(s.connected, s.connectionType)).then((h) => {
        handle = h;
      });
    } else {
      const on = () => apply(true, "wifi");
      const off = () => apply(false, "none");
      window.addEventListener("online", on);
      window.addEventListener("offline", off);
      return () => {
        window.removeEventListener("online", on);
        window.removeEventListener("offline", off);
      };
    }

    return () => {
      void handle?.remove();
    };
  }, []);

  return state;
}
