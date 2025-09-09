# 品牌配置系统

这个配置系统允许你轻松自定义应用中的品牌元素，包括logo、标题和副标题。

## 使用方法

### 基本配置

```typescript
import { brandingConfig } from './config/branding';

// 获取当前配置
const config = brandingConfig.getConfig();
console.log(config);

// 更新logo
brandingConfig.updateLogo({
  src: '/asset/logo-2.svg',
  alt: 'New Logo',
  width: 56,
  height: 56
});

// 更新文本
brandingConfig.updateText('新标题', '新副标题');

// 更新Slogan
brandingConfig.updateSlogan('新Slogan', {
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'rgba(255, 255, 255, 0.9)',
  opacity: 0.9,
  letterSpacing: '0.3px'
});

// 更新完整配置
brandingConfig.updateConfig({
  logo: {
    src: '/asset/custom-logo.svg',
    alt: 'Custom Logo',
    width: 64,
    height: 64
  },
  title: '自定义标题',
  subtitle: '自定义副标题',
  slogan: {
    text: '自定义Slogan',
    style: {
      fontSize: '0.8rem',
      fontWeight: 500,
      color: 'rgba(255, 255, 255, 0.9)',
      opacity: 0.9,
      letterSpacing: '0.3px'
    }
  }
});
```

### 配置选项

#### Logo配置
- `src`: logo图片路径
- `alt`: 图片alt文本
- `width`: logo宽度（可选，默认48px）
- `height`: logo高度（可选，默认48px）

#### 文本配置
- `title`: 主标题
- `subtitle`: 副标题

#### Slogan配置
- `text`: Slogan文本内容 (最多3个词语，用空格分隔，会自动自适应宽度)
- `style.fontSize`: 字体大小 (可选，默认'0.75rem')
- `style.fontWeight`: 字重 (可选，默认400)
- `style.color`: 字体颜色 (可选，默认'rgba(255, 255, 255, 0.8)')
- `style.opacity`: 透明度 (可选，默认0.8)
- `style.letterSpacing`: 字间距 (可选，默认'0.2px')

**注意**: Slogan会自动分割为最多3个词语，每个词语占据相等的宽度空间，实现自适应布局。

### 默认配置

```typescript
{
  logo: {
    src: '/asset/logo-1.svg',
    alt: 'Heron Sense Logo',
    width: 48,
    height: 48
  },
  title: 'Heron Sense',
  subtitle: '智能分析平台'
}
```

### 在组件中使用

```typescript
import { brandingConfig } from '../config/branding';

const MyComponent = () => {
  const config = brandingConfig.getConfig();
  
  return (
    <div>
      <img src={config.logo.src} alt={config.logo.alt} />
      <h1>{config.title}</h1>
      <p>{config.subtitle}</p>
    </div>
  );
};
```

## 注意事项

1. Logo图片应该放在`public/asset/`目录下
2. 支持SVG、PNG、JPG等格式
3. 在Sidebar中，SVG会自动应用白色滤镜以适配深色背景
4. 配置更改会立即生效，无需重启应用
