import { PlayerConfig } from "@/utils/Interfaces";

declare global {
  interface Window {
    GA_INITIALIZED: boolean;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    SunbirdPlayers: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "player-config"?: PlayerConfig;
    };
  }
}
