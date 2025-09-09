import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Analytics,
  ExpandLess,
  ExpandMore,
  Business
} from '@mui/icons-material';
import { SidebarProps, MenuItem } from '../types';
import { brandingConfig } from '../config/branding';

const drawerWidth: number = 280;

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: '仪表板',
      icon: <Dashboard />,
      path: '/',
      children: [
        { id: 'portfolio', title: 'Portfolio', path: '/analytics/stocks' }
      ]
    },
    {
      id: 'business',
      title: '客户配置',
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
    }
  ];

  // const singleItems: MenuItem[] = []; // 暂时不使用

  const handleExpandClick = (itemId: string): void => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleMenuClick = (path: string): void => {
    navigate(path);
  };

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
            <ListItemButton
              onClick={hasChildren ? () => handleExpandClick(item.id) : () => handleMenuClick(item.path)}
              sx={{
                height: 48,
                minHeight: 48,
                justifyContent: 'initial',
                px: 1.5,
                transition: 'all 0.3s ease',
                backgroundColor: isActiveRoute(item.path) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
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
                transition: 'all 0.3s ease',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem' // 调大icon尺寸
                }
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
                    onClick={() => handleMenuClick(child.path)}
                    sx={{
                      height: 40,
                      minHeight: 40,
                      pl: 8,
                      transition: 'all 0.3s ease',
                      backgroundColor: isActiveRoute(child.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)'
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 32, // 调整小圆点位置，与新的缩进保持一致
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
        
        {/* 三块布局：Logo + 标题区域 + Slogan区域 */}
        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1, height: '100%', width: '100%' }}>
          {/* 左侧：方形Logo */}
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 2,
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <img
              src={brandingConfig.getConfig().logo.src}
              alt={brandingConfig.getConfig().logo.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)' // 将SVG转为白色
              }}
            />
          </Box>
          
          {/* 右侧：上下平分区域 */}
          <Box sx={{ 
            flex: 1, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* 上半部分：标题 */}
            <Box sx={{ 
              height: '60%', 
              display: 'flex', 
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              pb: 0.5
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{
                  fontWeight: 600,
                  color: 'white',
                  fontSize: '1.05rem',
                  letterSpacing: '0.1px',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {brandingConfig.getConfig().title}
              </Typography>
            </Box>
            
            {/* 下半部分：Slogan */}
            <Box sx={{ 
              height: '40%', 
              display: 'flex', 
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              width: '100%',
              pt: 0.5
            }}>
              {brandingConfig.getConfig().slogan.text.split(' ').slice(0, 3).map((word, index) => {
                let alignment = 'left';
                if (index === 1) alignment = 'center';
                if (index === 2) alignment = 'right';
                
                return (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      textAlign: alignment as 'left' | 'center' | 'right',
                      minWidth: 0, // 允许收缩
                      px: 0.5
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{
                        color: brandingConfig.getConfig().slogan.style?.color || 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.75rem', // 从 0.9rem 调小到 0.75rem
                        fontWeight: brandingConfig.getConfig().slogan.style?.fontWeight || 400,
                        opacity: brandingConfig.getConfig().slogan.style?.opacity || 0.8,
                        letterSpacing: brandingConfig.getConfig().slogan.style?.letterSpacing || '0.2px',
                        lineHeight: 1,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {word}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
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
