import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function copyStyles(sourceDoc, targetDoc) {
  [...sourceDoc.querySelectorAll('link[rel="stylesheet"], style')]
    .forEach(node => targetDoc.head.appendChild(node.cloneNode(true)));
}

/**
 * Opens a new browser window and portals `children` into it.
 * React 18 attaches its event listeners to the portal container's ownerDocument,
 * so all event handlers, state updates, and refs work normally cross-window.
 */
export default function PopoutPanel({ children, title = 'Panneau', onClose }) {
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const w = window.open(
      '',
      'plan_analysis_panel',
      [
        'width=420',
        `height=${screen.availHeight}`,
        `left=${screen.availWidth - 440}`,
        'top=0',
        'resizable=yes',
        'scrollbars=no',
        'toolbar=no',
        'menubar=no',
        'location=no',
        'status=no',
      ].join(',')
    );

    if (!w) {
      // Popup blocked by browser
      onClose?.();
      return;
    }

    w.document.title = title;
    w.document.documentElement.style.cssText = 'height:100%;';
    w.document.body.style.cssText = 'margin:0;height:100%;overflow:hidden;';

    // Bring styles into the new window (Tailwind + any injected <style> tags)
    copyStyles(document, w.document);

    // Mount container
    const el = w.document.createElement('div');
    el.id = 'popout-root';
    el.style.cssText = 'height:100%;display:flex;flex-direction:column;';
    w.document.body.appendChild(el);

    // Poll for user closing the popup window
    const check = setInterval(() => {
      if (w.closed) { clearInterval(check); onClose?.(); }
    }, 400);

    w.addEventListener('beforeunload', () => {
      clearInterval(check);
      onClose?.();
    });

    setMountNode(el);

    return () => {
      clearInterval(check);
      if (!w.closed) w.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mountNode) return null;
  return createPortal(children, mountNode);
}
