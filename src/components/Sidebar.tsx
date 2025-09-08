import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  Dashboard,
  People,
  Settings,
  Analytics,
  ExpandLess,
  ExpandMore,
  Business,
  Close
} from '@mui/icons-material';
import { SidebarProps, MenuItem } from '../types';

const drawerWidth: number = 280;

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: '仪表板',
      icon: <Dashboard />,
      path: '/',
      children: [
        { id: 'overview', title: '概览', path: '/dashboard/overview' },
        { id: 'reports', title: '报告', path: '/dashboard/reports' },
        { id: 'analytics', title: '分析', path: '/dashboard/analytics' }
      ]
    },
    {
      id: 'users',
      title: '用户管理',
      icon: <People />,
      path: '/users',
      children: [
        { id: 'user-list', title: '用户列表', path: '/users/list' },
        { id: 'user-roles', title: '角色管理', path: '/users/roles' },
        { id: 'permissions', title: '权限设置', path: '/users/permissions' }
      ]
    },
    {
      id: 'business',
      title: '业务管理',
      icon: <Business />,
      path: '/business',
      children: [
        { id: 'products', title: '产品管理', path: '/business/products' },
        { id: 'orders', title: '订单管理', path: '/business/orders' },
        { id: 'customers', title: '客户管理', path: '/business/customers' }
      ]
    },
    {
      id: 'analytics',
      title: '数据分析',
      icon: <Analytics />,
      path: '/analytics',
      children: [
        { id: 'sales', title: '销售分析', path: '/analytics/sales' },
        { id: 'performance', title: '性能分析', path: '/analytics/performance' },
        { id: 'trends', title: '趋势分析', path: '/analytics/trends' }
      ]
    },
    {
      id: 'system',
      title: '系统设置',
      icon: <Settings />,
      path: '/settings',
      children: [
        { id: 'general', title: '常规设置', path: '/settings/general' },
        { id: 'security', title: '安全设置', path: '/settings/security' },
        { id: 'notifications', title: '通知设置', path: '/settings/notifications' }
      ]
    }
  ];

  const singleItems: MenuItem[] = [];

  const handleExpandClick = (itemId: string): void => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderMenuItem = (item: MenuItem): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
            <ListItemButton
              onClick={hasChildren ? () => handleExpandClick(item.id) : undefined}
              sx={{
                height: 48,
                minHeight: 48,
                justifyContent: 'initial',
                px: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.15)'
                }
              }}
            >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: 'center',
                color: 'primary.main',
                transition: 'all 0.3s ease'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }
              }}
            />
            {hasChildren && (
              <Box sx={{ transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse 
            in={isExpanded} 
            timeout="auto" 
            unmountOnExit
            sx={{
              '& .MuiCollapse-wrapper': {
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          >
            <List component="div" disablePadding>
              {item.children?.map((child) => (
                <ListItem key={child.id} disablePadding>
                  <ListItemButton
                    sx={{
                      height: 40,
                      minHeight: 40,
                      pl: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)'
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        opacity: 0.6
                      }
                    }}
                  >
                    <ListItemText 
                      primary={child.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                          fontWeight: 400
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: '#fafafa',
          overflowX: 'hidden'
        },
      }}
    >
      {/* 顶部Branding区域 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: 64,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 背景装饰 */}
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -15,
            left: -15,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 0
          }}
        />
        
        {/* Logo和标题 - 左侧 */}
        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>
              H
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="subtitle1" 
              sx={{
                fontWeight: 600,
                color: 'white',
                fontSize: '0.9rem',
                letterSpacing: '0.3px',
                lineHeight: 1.2
              }}
            >
              HTF Frontend
            </Typography>
            <Typography 
              variant="caption" 
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.65rem',
                fontWeight: 400,
                lineHeight: 1,
                display: 'block'
              }}
            >
              Management System
            </Typography>
          </Box>
        </Box>

        {/* 关闭按钮 - 右侧 */}
        <IconButton 
          onClick={onToggle}
          sx={{
            color: 'white',
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* 菜单列表 */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* 带子菜单的菜单项 */}
        <List>
          {menuItems.map(renderMenuItem)}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
