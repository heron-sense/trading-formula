import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack
} from '@mui/material';
import { 
  Dashboard, 
  People, 
  Settings, 
  Analytics,
  TrendingUp,
  Security,
  Speed,
  Support
} from '@mui/icons-material';
import { Feature } from '../../types';
import BannerCarousel from '../../components/BannerCarousel';
import { bannerConfig } from '../../config/banner';

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

  const stats = [
    { label: '总用户数', value: '1,234', icon: <People />, color: '#1976d2' },
    { label: '活跃项目', value: '56', icon: <TrendingUp />, color: '#388e3c' },
    { label: '系统状态', value: '正常', icon: <Security />, color: '#2e7d32' },
    { label: '响应时间', value: '120ms', icon: <Speed />, color: '#f57c00' }
  ];

  const recentActivities = [
    { title: '新用户注册', time: '2分钟前', type: 'user' },
    { title: '系统更新完成', time: '1小时前', type: 'system' },
    { title: '数据备份成功', time: '3小时前', type: 'backup' },
    { title: '性能优化', time: '昨天', type: 'optimization' }
  ];

  return (
    <Box>
      {/* Banner轮播区域 */}
      <Box sx={{ mb: 4 }}>
        <BannerCarousel 
          config={bannerConfig.getConfig()} 
          height={400}
        />
      </Box>

      {/* 统计卡片区域 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          系统概览
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {stats.map((stat, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%',
                cursor: 'default',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: stat.color, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* 功能模块区域 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          功能模块
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {features.map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%',
                cursor: 'default',
                opacity: 0.7,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: feature.color, mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
                <Chip 
                  label="即将开放" 
                  size="small" 
                  color="default" 
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* 最近活动区域 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          最近活动
        </Typography>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3,
            cursor: 'default',
            opacity: 0.7
          }}
        >
          <Stack spacing={2}>
            {recentActivities.map((activity, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <Typography variant="body1">
                  {activity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* 系统信息区域 */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          系统信息
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              cursor: 'default',
              opacity: 0.7
            }}
          >
            <Typography variant="h6" gutterBottom>
              技术栈
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="React 18" color="primary" />
              <Chip label="Material UI 7" color="secondary" />
              <Chip label="TypeScript" color="default" />
              <Chip label="Zig" color="info" />
            </Stack>
          </Paper>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              cursor: 'default',
              opacity: 0.7
            }}
          >
            <Typography variant="h6" gutterBottom>
              版本信息
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              当前版本: v1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              最后更新: 2024年1月
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
