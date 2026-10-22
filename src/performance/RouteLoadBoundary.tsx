import { Component, useRef, type ReactNode } from 'react';
import { PortfolioAppReady } from '../seo/PortfolioAppReady';
import { useDialogFocus } from '../lib/useDialogFocus';

type Props = { children: ReactNode; routeKey: string; optional?: boolean; onClose?: () => void };
const leaveOpen = () => {};

function LoadFailure({ onClose }: { onClose?: () => void }) {
  const rootRef = useRef<HTMLElement>(null);
  useDialogFocus(rootRef, Boolean(onClose), onClose ?? leaveOpen);
  return <section ref={rootRef} tabIndex={-1} className="portfolio-route-pending portfolio-load-error"
    role={onClose ? 'dialog' : 'alert'} aria-modal={onClose ? true : undefined} aria-label="Page could not finish opening">
    <h1>This page could not finish opening.</h1>
    <p>The connection may have interrupted a download. You can reload the page to try again.</p>
    <button type="button" data-dialog-initial onClick={() => window.location.reload()}>Reload page</button>
    {onClose ? <button type="button" onClick={onClose}>Return to the portfolio</button> : null}
    <p><a href="/">Selected work</a> · <a href="/contact">Contact Ramin</a></p>
    <PortfolioAppReady />
  </section>;
}

/** A failed code download must leave visitors a usable page. Reload retries React's cached lazy import. */
export class RouteLoadBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidUpdate(previous: Props) {
    if (previous.routeKey !== this.props.routeKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.optional) return null;
    return <LoadFailure onClose={this.props.onClose} />;
  }
}
