/* ErrorBoundary — bila ada section yang error, tampilkan fallback jujur
   (bukan layar putih). Pola defensive: tidak pernah bikin produksi blank. */
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Render error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // log ke console (build produksi: tanpa sentry dulu)
    console.error("[Trilux ErrorBoundary]", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">Trilux Design</p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">Halaman belum termuat</h1>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              Ada gangguan saat menampilkan halaman. Muat ulang, atau hubungi kami via WhatsApp.
            </p>
            <p className="mt-4 text-xs text-neutral-400 font-mono break-all">{this.state.message}</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-white bg-neutral-900 rounded-full px-5 py-2.5 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Muat ulang
              </button>
              <a
                href="https://wa.me/6282287348422"
                target="_blank"
                rel="noopener"
                className="text-sm font-semibold text-neutral-900 underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-900"
              >
                Whatsapp →
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
