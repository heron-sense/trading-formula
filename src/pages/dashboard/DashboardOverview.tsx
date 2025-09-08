import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  People,
  Assessment
} from '@mui/icons-material';

const DashboardOverview: React.FC = () => {
  const stats = [
    {
      title: '总用户数',
      value: '1,234',
      icon: <People />,
      color: '#1976d2',
      change: '+12%'
    },
    {
      title: '总收入',
      value: '¥45,678',
      icon: <TrendingUp />,
      color: '#388e3c',
      change: '+8%'
    },
    {
      title: '订单数',
      value: '567',
      icon: <Assessment />,
      color: '#f57c00',
      change: '+15%'
    },
    {
      title: '活跃度',
      value: '89%',
      icon: <Dashboard />,
      color: '#7b1fa2',
      change: '+3%'
    }
  ];

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          仪表板概览
        </Typography>
        <Typography variant="body1" color="text.secondary">
          欢迎使用HTF管理系统，这里是您的数据概览中心
        </Typography>
      </Paper>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3 
      }}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                    {stat.change}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: stat.color }}>
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardOverview;
