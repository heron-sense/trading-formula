import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add,
  Person
} from '@mui/icons-material';

const UserListPage: React.FC = () => {
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            用户管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 2 }}
          >
            新增用户
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          管理系统用户账户，包括用户信息、权限和角色设置
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
            <Person sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            用户列表功能
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            这里将显示用户列表，包括搜索、筛选、编辑等功能
          </Typography>
          <Chip label="开发中" color="primary" variant="outlined" />
        </Box>
      </Paper>
    </Box>
  );
};

export default UserListPage;
