
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VERITY APP ERROR:", error);
    console.error("COMPONENT STACK:", errorInfo.componentStack);

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#FAF3D7",
            color: "#843B62",
            padding: "24px",
            fontFamily: "monospace",
            overflowWrap: "anywhere",
          }}
        >
          <h1>Verity encountered an error</h1>

          <h3>Error message:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error?.message}
          </pre>

          <h3>Component stack:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
