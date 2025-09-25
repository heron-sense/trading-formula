import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  CssBaseline,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout,
  Settings,
  Info
} from '@mui/icons-material';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './pages/dashboard/HomePage';
import AboutPage from './pages/dashboard/AboutPage';
import LoginPage from './pages/auth/LoginPage';
import CustomerListPage from './pages/business/CustomerListPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ProductListPage from './pages/business/ProductListPage';
import StockAnalysisPage from './pages/analytics/StockAnalysisPage';
import StrategyPage from './pages/strategy/StrategyPage';
import FavoritesPage from './pages/marketplace/FavoritesPage';
import { SidebarState } from './types';

const drawerWidth: number = 280;
const hiddenWidth: number = 0;

const App: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>('open');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // 默认已登录，方便开发
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  

  const handleSidebarToggle = (): void => {
    setSidebarState(prev => prev === 'open' ? 'hidden' : 'open');
  };

  const handleSidebarShow = (): void => {
    setSidebarState('open');
  };

  const handleLogout = (): void => {
    setIsAuthenticated(false);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string): void => {
    handleMenuClose();
    switch (action) {
      case 'logout':
        handleLogout();
        break;
      case 'settings':
        // 处理配置逻辑
        console.log('打开配置');
        break;
      case 'info':
        // 处理信息逻辑
        console.log('打开信息');
        break;
      default:
        break;
    }
  };

  const getSidebarWidth = (): number => {
    return sidebarState === 'open' ? drawerWidth : hiddenWidth;
  };

  const isSidebarHidden: boolean = sidebarState === 'hidden';

  // 如果未登录，显示登录页面
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* 顶部应用栏 */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: `calc(100% - ${getSidebarWidth()}px)`,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ml: `${getSidebarWidth()}px`
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={handleSidebarToggle}
            edge="start"
            sx={{ 
              mr: 2,
              '& .MuiSvgIcon-root': {
                fontSize: '1.4rem', // 调小菜单icon
                fontWeight: 900, // 更粗的菜单icon
                strokeWidth: 2.5 // 更粗的线条
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            HTF Frontend 管理系统
          </Typography>
          <Tooltip title="用户菜单" arrow>
            <IconButton
              color="inherit"
              onClick={handleAvatarClick}
              sx={{ 
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* 用户菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleMenuAction('settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>配置</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('info')}>
          <ListItemIcon>
            <Info fontSize="small" />
          </ListItemIcon>
          <ListItemText>信息</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('logout')}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>登出</ListItemText>
        </MenuItem>
      </Menu>

      {/* 侧边栏 */}
      {!isSidebarHidden && (
        <Sidebar 
          open={sidebarState === 'open'} 
          onToggle={handleSidebarToggle} 
        />
      )}

      {/* 主要内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${getSidebarWidth()}px)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ml: `${getSidebarWidth()}px`,
          mt: 8, // 为顶部应用栏留出空间
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}
      >
        <Routes>
          <Route path="/" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64, // 顶部应用栏高度
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <HomePage />
              </Box>
              <Footer />
            </Box>
          } />
          <Route path="/about" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64, // 顶部应用栏高度
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <AboutPage />
              </Box>
              <Footer />
            </Box>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/business/customers" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64, // 顶部应用栏高度
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <CustomerListPage />
              </Box>
              <Footer />
            </Box>
          } />
          <Route path="/dashboard/overview" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64,
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <DashboardOverview />
              </Box>
              <Footer />
            </Box>
          } />
          <Route path="/business/products" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64,
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <ProductListPage />
              </Box>
              <Footer />
            </Box>
          } />
          <Route path="/analytics/stocks" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64,
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <StockAnalysisPage />
              </Box>
              <Footer />
            </Box>
          } />
          <Route path="/strategy" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64,
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <StrategyPage />
              </Box>
              <Footer />
            </Box>
          } />
          <Route path="/marketplace/securities" element={
            <Box sx={{ 
              position: 'fixed',
              top: 64,
              left: getSidebarWidth(),
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <FavoritesPage />
              </Box>
              <Footer />
            </Box>
          } />
          {/* 可以在这里添加更多路由 */}
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
