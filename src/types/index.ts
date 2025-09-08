// 侧边栏状态类型
export type SidebarState = 'open' | 'hidden';

// 菜单项类型
export interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  children?: SubMenuItem[];
}

// 子菜单项类型
export interface SubMenuItem {
  id: string;
  title: string;
  path: string;
}

// 侧边栏组件Props类型
export interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

// 功能特性类型
export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// 技术栈类型
export interface Technology {
  icon: React.ReactNode;
  title: string;
  description: string;
}
