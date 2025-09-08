import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Container,
  CssBaseline,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Visibility as ShowIcon,
  Logout
} from '@mui/icons-material';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
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
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            HTF Frontend - 管理系统
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
          p: isSidebarHidden ? 2 : 3,
          width: `calc(100% - ${getSidebarWidth()}px)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ml: `${getSidebarWidth()}px`,
          mt: 8, // 为顶部应用栏留出空间
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Container maxWidth={isSidebarHidden ? false : 'xl'} sx={{ px: isSidebarHidden ? 0 : 2 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* 可以在这里添加更多路由 */}
          </Routes>
        </Container>
      </Box>

      {/* 显示侧边栏的浮动按钮 - 仅在隐藏状态下显示 */}
      {isSidebarHidden && (
        <Fab
          color="primary"
          aria-label="show sidebar"
          onClick={handleSidebarShow}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: (theme) => theme.zIndex.speedDial,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        >
          <Tooltip title="显示导航菜单" placement="right">
            <ShowIcon />
          </Tooltip>
        </Fab>
      )}
    </Box>
  );
}

export default App;
