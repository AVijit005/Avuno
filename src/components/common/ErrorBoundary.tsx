import { PureComponent, type ReactNode, type ErrorInfo } from "react";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends PureComponent<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    reportLovableError(error, {
      boundary: "ErrorBoundary",
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="py-20">
          <PremiumErrorState
            title="Something unexpected happened"
            description="We've logged the error and our team has been notified."
          />
        </div>
      );
    }

    return this.props.children;
  }
}
