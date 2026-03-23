import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import IconSettings from "@salesforce/design-system-react/components/icon-settings";
import Settings from "@salesforce/design-system-react/components/settings";

import type { AppProps } from "next/app";

Settings.setAppElement("#__next");

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <IconSettings iconPath="/icons">
      <Component {...pageProps} />
    </IconSettings>
  );
}

export default MyApp;
