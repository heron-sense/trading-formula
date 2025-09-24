import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  CssBaseline,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout
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
import { SidebarState } from './types';

const drawerWidth: number = 280;
const hiddenWidth: number = 0;

const App: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>('open');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // 默认已登录，方便开发
  

  const handleSidebarToggle = (): void => {
    setSidebarState(prev => prev === 'open' ? 'hidden' : 'open');
  };

  const handleSidebarShow = (): void => {
    setSidebarState('open');
  };

  const handleLogout = (): void => {
    setIsAuthenticated(false);
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
                fontSize: '1.8rem' // 调大菜单icon
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
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>
            {sidebarState === 'open' && '侧边栏已展开'}
            {sidebarState === 'hidden' && '全屏模式'}
          </Typography>
          <Tooltip title="登出" arrow>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ 
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

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
          {/* 可以在这里添加更多路由 */}
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
