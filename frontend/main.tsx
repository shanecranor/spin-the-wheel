import React from "react";
import ReactDOM from "react-dom/client";
import App from "./src/pages/viewer/App.tsx";
import { subscribeToAuth } from "@trufflehq/sdk";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.layer.css";
import "./index.css";
import { theme } from "./src/theme";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
subscribeToAuth(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ColorSchemeScript forceColorScheme="dark" />
      <MantineProvider theme={theme} forceColorScheme="dark">
        <App />
      </MantineProvider>
    </React.StrictMode>
  );
});
