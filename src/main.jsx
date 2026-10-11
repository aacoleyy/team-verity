import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

import AuthGate from "./AuthGate.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-nac5nzheq16q5k1s.us.auth0.com"
      clientId="uOrv43TPaPQZ4YvP1jTZJ3MjfNvVNvyG"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <AuthGate />
    </Auth0Provider>
  </React.StrictMode>
);
