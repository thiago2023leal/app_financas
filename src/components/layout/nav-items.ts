import {
  LayoutDashboard,
  CreditCard,
  List,
  RefreshCw,
  Target,
  PieChart,
  Bot,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/accounts',     label: 'Contas',       icon: CreditCard },
  { href: '/transactions', label: 'Transações',   icon: List },
  { href: '/recurring',    label: 'Recorrentes',  icon: RefreshCw },
  { href: '/goals',        label: 'Metas',        icon: Target },
  { href: '/budgets',      label: 'Orçamento',    icon: PieChart },
  { href: '/ai',           label: 'Assistente IA', icon: Bot },
]
