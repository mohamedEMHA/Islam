import { MobileMegaMenu } from './MegaMenu'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return <MobileMegaMenu open={open} onClose={onClose} />
}
