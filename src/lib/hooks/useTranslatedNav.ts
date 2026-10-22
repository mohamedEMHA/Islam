import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  NAV_GROUP_DEFS,
  APP_UTILITY_LINK_DEFS,
  FOOTER_GROUP_DEFS,
  type NavItemDef,
  type NavGroupDef,
  type FooterGroupDef,
} from '@/lib/navConfig'

function mapNavItem(t: (key: string) => string, item: NavItemDef) {
  return {
    path: item.path,
    icon: item.icon,
    label: t(item.labelKey),
    description: item.descriptionKey ? t(item.descriptionKey) : undefined,
  }
}

export function useTranslatedNav() {
  const { t } = useTranslation()

  return useMemo(() => {
    const groups = NAV_GROUP_DEFS.map((group: NavGroupDef) => ({
      id: group.id,
      label: t(group.labelKey),
      items: group.items.map((item) => mapNavItem(t, item)),
    }))

    const utilityLinks = APP_UTILITY_LINK_DEFS.map((item) => mapNavItem(t, item))

    const footerGroups = FOOTER_GROUP_DEFS.map((group: FooterGroupDef) => ({
      id: group.id,
      label: t(group.labelKey),
      items: group.items.map((item) => ({
        path: item.path,
        label: t(item.labelKey),
      })),
    }))

    return { groups, utilityLinks, footerGroups }
  }, [t])
}
