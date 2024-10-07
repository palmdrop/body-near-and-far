// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="sv" xml:lang="sv">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
          <link rel="manifest" href="./site.webmanifest" />
          <link rel="mask-icon" href="./safari-pinned-tab.svg" color="#e6dfb2" />
          <meta name="msapplication-TileColor" content="#00aba9" />
          <meta name="theme-color" content="#ffffff"></meta>
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
