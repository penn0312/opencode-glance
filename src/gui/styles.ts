/**
 * The bar is injected as plain CSS instead of relying on Tailwind classes. A plugin bundle is not part of the
 * app's Tailwind source scan, so utility class names that only appear here would not be generated. The
 * `--v2-*` variables below are the same semantic tokens the app's own capsule pills use.
 */
export const css = `
.glance-root {
  display: flex;
  justify-content: center;
  padding: 4px 12px 8px;
  pointer-events: none;
}

.glance-bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1240px;
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: 0.5px solid var(--v2-border-border-muted);
  background: var(--v2-background-bg-base);
  box-shadow: var(--v2-elevation-raised);
  color: var(--v2-text-text-base);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.04px;
  white-space: nowrap;
  overflow: hidden;
}

.glance-group {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.glance-group.center {
  flex: 1;
  justify-content: center;
}

.glance-group.end {
  justify-content: flex-end;
}

.glance-icon {
  display: inline-flex;
  flex: none;
  color: var(--v2-text-text-muted);
}

.glance-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.glance-muted {
  color: var(--v2-text-text-muted);
}

.glance-ring {
  position: relative;
  display: inline-block;
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: var(--v2-icon-icon-base, var(--v2-text-text-muted));
}

.glance-ring::after {
  content: "";
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--v2-background-bg-base);
}

@media (max-width: 760px) {
  .glance-group.center {
    display: none;
  }
}

@media (max-width: 480px) {
  .glance-root {
    padding: 2px 8px 6px;
  }

  .glance-bar {
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
  }
}
`
