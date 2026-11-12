import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Result } from "antd";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isChunkError?: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorMessage = error?.message || error?.toString() || "";
    const isChunkError =
      errorMessage.includes("Failed to fetch dynamically imported module") ||
      errorMessage.includes("Importing a module script failed") ||
      errorMessage.includes("Loading chunk");

    return { hasError: true, error, isChunkError };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, isChunkError: false });
    window.location.href = "/";
  };

  private handleReload = () => {
    sessionStorage.removeItem("page_refreshed_for_chunk");
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isChunkError = this.state.isChunkError;

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <Result
            status={isChunkError ? "info" : "error"}
            title={isChunkError ? "New Version Available" : "Something went wrong"}
            subTitle={
              isChunkError
                ? "A new version of the application is available. Please reload the page to load the latest features."
                : "Sorry, an unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
            }
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                {isChunkError ? "Update & Reload" : "Refresh Page"}
              </Button>,
              <Button key="home" onClick={this.handleReset}>
                Back Home
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
