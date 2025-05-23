export const navigations = [
  { label: '洞察', type: 'label' },
  { name: '实时分析', path: '/trading-panel/default', icon:"trending_up", iconText: 'P' },
  { name: '洞察', path: '/trading-panel/insight', icon:"settings", iconText: 'P' },

  { label: 'PAGES', type: 'label' },
  { name: '订单', icon:'', path: '/client/order', iconText: 'T' },
  { name: '退款申请', icon:'', path: '/client/payment', iconText: 'T' },
  { name: 'Search', icon:'', path: '/client/list', iconText: 'T' },
  { label: '', type: 'label' },

  {
    name: 'My Group',
    icon: 'group',
    children: [
      { name: '添加成员', icon: '',  iconText: 'SU', path: '/my-group/member/setup' },
      { name: '客户信息模板', icon: '',  iconText: 'SU', path: '/my-group/client-template' },
      { name: '角色权限', icon: '',  iconText: 'SU', path: '/settings/role/permission' },
      { name: 'Forgot Password', iconText: 'FP', path: '/session/forgot-password' },
    ]
  },
  { label: '', type: 'label' },
  { name: 'Echarts', path: '/charts/echarts', iconText: 'E' },

  { name: 'Sign in', iconText: 'SI', path: '/session/signin' },
  { name: 'Sign up', iconText: 'SU', path: '/session/signup' },
  { label: 'Components', type: 'label' },
  { name: 'Auto Complete', path: '/material/autocomplete', iconText: 'A' },
  { name: 'Buttons', path: '/material/buttons', iconText: 'B' },
  { name: 'Checkbox', path: '/material/checkbox', iconText: 'C' },
  { name: 'Dialog', path: '/material/dialog', iconText: 'D' },
  { name: 'Expansion Panel', path: '/material/expansion-panel', iconText: 'E' },
  { name: 'Form', path: '/material/form', iconText: 'F' },
  { name: 'Icons', path: '/material/icons', iconText: 'I' },
  { name: 'Menu', path: '/material/menu', iconText: 'M' },
  { name: 'Progress', path: '/material/progress', iconText: 'P' },
  { name: 'Radio', path: '/material/radio', iconText: 'R' },
  { name: 'Switch', path: '/material/switch', iconText: 'S' },
  { name: 'Slider', path: '/material/slider', iconText: 'S' },
  { name: 'Snackbar', path: '/material/snackbar', iconText: 'S' },
  {
    name: 'Documentation',
    icon: 'launch',
    type: 'extLink',
    path: 'http://demos.ui-lib.com/matx-react-doc/'
  }
];
