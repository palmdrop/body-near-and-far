import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "./styles/reset.css";
import "./styles/fonts.css";
import "./styles/global.css";
import { APP_DESCRIPTION, APP_TITLE } from "./constant";

export default function App() {
  return (
    <Router
      base={import.meta.env.SERVER_BASE_URL}
      root={props => (
        <MetaProvider>
          <Title>{APP_TITLE}</Title>
          <Meta name="description" content={APP_DESCRIPTION} />
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
