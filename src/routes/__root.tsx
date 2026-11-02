import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";

import appCss from "../styles.css?url";
import { initMockEngine } from "../mock/initMock";

// Initialize autonomous mock engine for portfolio demonstration
initMockEngine();

export const Route = createRootRoute({
  notFoundComponent: () => <h1>404 Not Found</h1>,
  head: () => ({
    title: "PartsFlow CRM - B2B Distribution Platform",
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <Outlet />
        <Toaster position="top-right" />
        <Scripts />
      </body>
    </html>
  );
}
