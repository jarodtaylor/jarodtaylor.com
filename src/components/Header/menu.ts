/**
 * The folded nav's popover closes when keyboard focus leaves it, so Tab never moves focus behind the open panel
 * (WCAG 2.4.11). Light dismiss already covers clicks outside; focus moving to the menu button is left to the
 * button itself. Focus going nowhere while the window itself lost focus (switching apps) keeps the menu open.
 */
export function initMenu() {
  const list = document.querySelector<HTMLElement>('#nav-list');
  const toggle = document.querySelector('[popovertarget="nav-list"]');
  if (!list) return;
  list.addEventListener('focusout', (e) => {
    const to = e.relatedTarget;
    if (to instanceof Node && (list.contains(to) || to === toggle)) return;
    if (!to && !document.hasFocus()) return;
    if (list.matches(':popover-open')) list.hidePopover();
  });
}
