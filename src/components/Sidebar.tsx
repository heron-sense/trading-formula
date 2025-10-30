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
  ChevronRight,
  Business
} from '@mui/icons-material';
import { SidebarProps, MenuItem } from '../types';
import { brandingConfig } from '../config/branding';
import PortfolioIcon from './icons/PortfolioIcon';
import CustomArrow from './icons/CustomArrow';

const drawerWidth: number = 280;

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: '我的投资',
      icon: <Dashboard />,
      path: '/',
      children: [
        { id: 'portfolio', title: 'Portfolio', path: '/analytics/stocks' },
        { id: 'strategy', title: 'Strategy', path: '/strategy' }
      ]
    },
    {
      id: 'marketplace',
      title: 'Market Place',
      icon: <Analytics />,
      path: '/marketplace',
      children: [
        { id: 'securities', title: 'Watchlist', path: '/marketplace/securities' },
        { id: 'bubble-index', title: '泡沫指数', path: '/marketplace/bubble-index' },
        { id: 'stock-diagnosis', title: '股票诊断', path: '/marketplace/stock-diagnosis' },
        { id: 'events', title: 'Events', path: '/marketplace/events' },
        { id: 'options-analysis', title: '期权分析', path: '/marketplace/options-analysis' }
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
                height: 56,
                minHeight: 56,
                justifyContent: 'initial',
                px: 1.5,
                transition: 'all 0.3s ease',
                backgroundColor: isActiveRoute(item.path) ? 'rgba(192, 192, 192, 0.5)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.25)'
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
              <Box sx={{ 
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CustomArrow sx={{ fontSize: 22 }} />
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
              {item.children?.map((child, childIndex) => (
                <React.Fragment key={child.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        if (child.children && child.children.length > 0) {
                          handleExpandClick(child.id);
                        } else {
                          handleMenuClick(child.path);
                        }
                      }}
                      sx={{
                        height: 42,
                        minHeight: 42,
                        pl: 8,
                        transition: 'all 0.3s ease',
                        backgroundColor: isActiveRoute(child.path) 
                          ? 'rgba(192, 192, 192, 0.5)' 
                          : childIndex % 2 === 0 
                            ? 'rgba(25, 118, 210, 0.03)' 
                            : 'rgba(25, 118, 210, 0.06)',
                        '&:hover': {
                          backgroundColor: isActiveRoute(child.path)
                            ? 'rgba(192, 192, 192, 0.6)'
                            : childIndex % 2 === 0
                              ? 'rgba(25, 118, 210, 0.08)'
                              : 'rgba(25, 118, 210, 0.12)'
                        },
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
                      {child.children && child.children.length > 0 && (
                        <Box sx={{ 
                          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
                          transform: expandedItems[child.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CustomArrow sx={{ fontSize: 18 }} />
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                  {/* 渲染嵌套子菜单 */}
                  {child.children && child.children.length > 0 && (
                    <Collapse in={expandedItems[child.id]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {child.children.map((grandChild, grandChildIndex) => (
                          <ListItem key={grandChild.id} disablePadding>
                            <ListItemButton
                              onClick={() => handleMenuClick(grandChild.path)}
                              sx={{
                                height: 38,
                                minHeight: 38,
                                pl: 12,
                                transition: 'all 0.3s ease',
                                backgroundColor: isActiveRoute(grandChild.path) 
                                  ? 'rgba(192, 192, 192, 0.5)' 
                                  : grandChildIndex % 2 === 0 
                                    ? 'rgba(25, 118, 210, 0.02)' 
                                    : 'rgba(25, 118, 210, 0.04)',
                                '&:hover': {
                                  backgroundColor: isActiveRoute(grandChild.path)
                                    ? 'rgba(192, 192, 192, 0.6)'
                                    : grandChildIndex % 2 === 0
                                      ? 'rgba(25, 118, 210, 0.06)'
                                      : 'rgba(25, 118, 210, 0.08)'
                                },
                              }}
                            >
                              <ListItemText 
                                primary={grandChild.title}
                                sx={{
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.8rem',
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
        alignContent: 'center',
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
          padding: '0 12px',
          height: 64,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 三块布局：Logo + 标题区域 + Slogan区域 */}
        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1, height: '100%', width: '100%' }}>
          {/* 左侧：方形Logo */}
          <Box
            sx={{
              maxWidth:75,
              maxHeight:75,
              width: 75,
              height: 75,
              display:'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 0,
              marginLeft: 0,
              overflow: 'hidden',
              flexShrink: 0,
              p: 0,
              m: 0
            }}
          >
            <img
              src={brandingConfig.getConfig().logo.src}
              alt={brandingConfig.getConfig().logo.alt}
              style={{
                width: '90%',
                height: '90%',
                alignItems: 'left',
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
                  fontWeight: 800,
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
              height: '35%', 
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
                        fontSize: '0.9rem', 
                        fontWeight: brandingConfig.getConfig().slogan.style?.fontWeight || 600,
                        opacity: brandingConfig.getConfig().slogan.style?.opacity || 0.8,
                        letterSpacing: brandingConfig.getConfig().slogan.style?.letterSpacing || '0.2px',
                        lineHeight: 1.2,
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
      <Box sx={{ flexGrow: 1, overflow: 'auto', pt: 0 }}>
        {/* 带子菜单的菜单项 */}
        <List sx={{ pt: 0 }}>
          {menuItems.map(renderMenuItem)}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
