import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { 
  Code, 
  Palette, 
  Speed,
  Security,
  Devices
} from '@mui/icons-material';
import { Technology } from '../../types';

const AboutPage: React.FC = () => {
  const technologies: string[] = [
    'React 18.3.1',
    'Material UI 7.3.2',
    'React Router 6.28.0',
    'Emotion 11.13.3',
    'TypeScript 5.9.2'
  ];

  const features: Technology[] = [
    {
      icon: <Code />,
      title: '现代化技术栈',
      description: '使用最新的React和Material UI技术'
    },
    {
      icon: <Palette />,
      title: '美观的界面设计',
      description: '基于Material Design设计规范'
    },
    {
      icon: <Speed />,
      title: '高性能',
      description: '优化的组件和渲染性能'
    },
    {
      icon: <Security />,
      title: '安全可靠',
      description: '遵循最佳安全实践'
    },
    {
      icon: <Devices />,
      title: '响应式设计',
      description: '支持各种设备和屏幕尺寸'
    }
  ];

  return (
    <Box>
      {/* 页面标题 */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          关于 HTF Frontend
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          基于 TypeScript 和 Material UI 构建的现代化管理系统
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          这是一个使用 Material UI 框架构建的现代化前端应用程序。
          项目采用了最新的 React + TypeScript 技术栈，提供了美观、响应式的用户界面。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          该应用展示了 Material UI 组件的使用方式，包括导航栏、卡片、按钮等常用组件，
          以及主题配置和响应式布局的实现。
        </Typography>
      </Paper>

      {/* 技术栈卡片 */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        技术栈
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        {technologies.map((tech, index) => (
          <Box key={index}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {tech}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* 主要特性 */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        主要特性
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {features.map((feature, index) => (
          <Box key={index}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ color: 'primary.main', mr: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AboutPage;
