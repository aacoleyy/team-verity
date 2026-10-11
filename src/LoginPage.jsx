
import { useAuth0 } from "@auth0/auth0-react";
import "./LoginPage.css";

export default function LoginPage() {
  const { loginWithRedirect, error } = useAuth0();

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  return (
    <div className="verity-login">
      <div className="login-logo">
        <h1>verity<span>.</span></h1>
        <p>find your people. find your place.</p>
      </div>

      <div className="login-card">
        <div className="login-sparkles">✳ ✦ ✳</div>

        <h2>Welcome to Verity!</h2>

        <p>
          Your campus, your community.
          Discover events and find your people.
        </p>

        {error && (
          <p role="alert" className="login-error">
            {error.message}
          </p>
        )}

        <button
          className="verity-login-button"
          onClick={() => loginWithRedirect()}
        >
          Log in
        </button>

        <button
          className="verity-signup-button"
          onClick={handleSignup}
        >
          Create an account
        </button>

        <small>Made for campus life ✦</small>
      </div>
    </div>
  );
}
