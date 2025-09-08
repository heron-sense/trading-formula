import React from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Paper
} from '@mui/material';
import { 
  Dashboard, 
  People, 
  Settings, 
  Analytics 
} from '@mui/icons-material';
import { Feature } from '../types';

const HomePage: React.FC = () => {
  const features: Feature[] = [
    {
      title: '仪表板',
      description: '查看系统概览和关键指标',
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      title: '用户管理',
      description: '管理系统用户和权限',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#388e3c'
    },
    {
      title: '系统设置',
      description: '配置系统参数和选项',
      icon: <Settings sx={{ fontSize: 40 }} />,
      color: '#f57c00'
    },
    {
      title: '数据分析',
      description: '查看详细的数据报告',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: '#7b1fa2'
    }
  ];

  return (
    <Box>
      {/* 欢迎标题 */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          欢迎使用 HTF Frontend
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          基于 Material UI 7.3.2 构建的现代化管理系统
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          现在您可以使用左侧菜单导航到不同的功能模块，菜单支持两种模式：展开和完全隐藏
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          💡 提示：点击顶部菜单按钮可以切换模式，完全隐藏模式适合需要最大显示区域的情况
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ mt: 2 }}
          href="/about"
        >
          了解更多
        </Button>
      </Paper>

      {/* 功能卡片 */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        主要功能
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {features.map((feature, index) => (
          <Box key={index}>
            <Paper 
              elevation={2}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <Box sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ color: feature.color, mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HomePage;
