import React from "react";
import ReactDOM from "react-dom/client";
import App from "../src/pages/streamer/App.tsx";
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.css";
import "../index.css";
import { theme } from "../src/theme";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorSchemeScript forceColorScheme="dark" />
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Notifications position="top-left" zIndex={1000} />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
