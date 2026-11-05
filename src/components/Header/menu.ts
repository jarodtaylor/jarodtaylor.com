/**
 * The folded nav's popover closes when keyboard focus moves to an element outside it, so Tab never lands behind the
 * open panel (WCAG 2.4.11). Focus going nowhere (a press on the panel's padding, Safari tapping a link, switching
 * apps) keeps it open: closing then would swallow the tap. Light dismiss covers clicks outside; focus moving to the
 * menu button is left to the button itself.
 */
export function initMenu() {
  const list = document.querySelector<HTMLElement>('#nav-list');
  const toggle = document.querySelector('[popovertarget="nav-list"]');
  if (!list) return;
  list.addEventListener('focusout', (e) => {
    const to = e.relatedTarget;
    if (!(to instanceof Node) || list.contains(to) || to === toggle) return;
    if (list.matches(':popover-open')) list.hidePopover();
  });
}
