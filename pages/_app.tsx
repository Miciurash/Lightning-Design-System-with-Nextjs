import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import IconSettings from "@salesforce/design-system-react/components/icon-settings";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (

    <IconSettings iconPath="/assets/icons">
      <Component {...pageProps} />
    </IconSettings>
  );
}

export default MyApp;
