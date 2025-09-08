# HTF Frontend

一个基于 React 和 Material UI 构建的现代化前端应用程序。

## 技术栈

- **React 18.3.1** - 用户界面库
- **TypeScript 5.9.2** - 强类型 JavaScript 超集
- **Material UI 7.3.2** - React 组件库
- **React Router 6.28.0** - 客户端路由
- **Emotion 11.13.3** - CSS-in-JS 库

## 功能特性

- 🎨 美观的 Material Design 界面
- 📱 响应式设计，支持各种设备
- 🚀 现代化的 React + TypeScript 技术栈
- 🛣️ 客户端路由支持
- 🎯 组件化架构
- ⚡ 高性能优化
- 🔒 强类型支持，更好的开发体验
- 📝 完整的类型定义和接口

## 项目结构

```
htf-frontend/
├── public/
│   ├── index.html          # HTML 模板
│   └── manifest.json       # PWA 配置
├── src/
│   ├── components/         # React 组件
│   │   ├── HomePage.tsx    # 首页组件
│   │   ├── AboutPage.tsx   # 关于页面组件
│   │   └── Sidebar.tsx     # 侧边栏组件
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 类型定义文件
│   ├── App.tsx             # 主应用组件
│   └── index.tsx           # 应用入口
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目配置和依赖
└── README.md              # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm test
```

### 类型检查

```bash
npm run type-check
```

## 主要页面

- **首页** (`/`) - 应用主页，展示主要功能
- **关于** (`/about`) - 项目介绍和技术栈信息

## 开发说明

### 添加新页面

1. 在 `src/components/` 目录下创建新的组件文件
2. 在 `src/App.js` 中添加路由配置
3. 在导航栏中添加对应的链接

### 自定义主题

在 `src/index.js` 中修改 `theme` 对象来自定义 Material UI 主题：

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
    },
  },
});
```

### 添加新组件

使用 Material UI 组件库中的组件来构建界面：

```typescript
import { Button, Card, Typography } from '@mui/material';
```

### TypeScript 开发

项目使用 TypeScript 进行开发，提供强类型支持：

```typescript
// 定义组件 Props 类型
interface MyComponentProps {
  title: string;
  count: number;
  onUpdate: (value: string) => void;
}

// 使用类型定义
const MyComponent: React.FC<MyComponentProps> = ({ title, count, onUpdate }) => {
  // 组件实现
};
```

### 类型定义

所有类型定义都在 `src/types/index.ts` 文件中：

- `SidebarState` - 侧边栏状态类型
- `MenuItem` - 菜单项类型
- `SubMenuItem` - 子菜单项类型
- `SidebarProps` - 侧边栏组件 Props 类型
- `Feature` - 功能特性类型
- `Technology` - 技术栈类型

## 许可证

MIT License
