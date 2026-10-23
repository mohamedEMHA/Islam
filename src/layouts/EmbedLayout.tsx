import { Outlet } from 'react-router-dom'

/** Chrome-free shell for iframe embeds. */
export function EmbedLayout() {
  return (
    <div className="min-h-dvh bg-surface dark:bg-dark-bg">
      <Outlet />
    </div>
  )
}
