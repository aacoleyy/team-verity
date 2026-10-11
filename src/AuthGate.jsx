import ErrorBoundary from "./ErrorBoundary.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import App from "./App.jsx";
import LoginPage from "./LoginPage.jsx";

export default function AuthGate() {
  const {
    isLoading,
    isAuthenticated,
    error,
  } = useAuth0();

  if (isLoading) {
    return (
      <div style={{ padding: 30, background: "#FAF3D7" }}>
        Checking your login...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        Authentication error: {error.message}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
