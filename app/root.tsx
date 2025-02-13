import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { useState, useEffect } from "react";
import VirtualTryOnSidePanel from "./components/VirtualTryOnSidePanel";

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message event:", event);
      if (event.data && event.data.type === "OPEN_VIRTUAL_TRY_ON") {
        console.log("Message payload valid, opening side panel.");
        setIsPanelOpen(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {isPanelOpen && (
          <VirtualTryOnSidePanel 
            isOpen={isPanelOpen} 
            onClose={() => {
              console.log("Closing side panel");
              setIsPanelOpen(false);
            }} 
          />
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}