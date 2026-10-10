// 只记录已有资料。空字段留给后续提供的真实内容，不在页面中编造经历。
export const journey = [
  { date: '2023 — 2026', title: '在校园，让表达被听见', text: '大型活动主持、广播节目策划与制作，在文字、声音与舞台之间练习表达。', label: '表达与协作', href: '#strengths' },
  { date: '2026 — 2031 · 预计毕业', title: '从机械出发，走向智能', text: '华东理工大学 · 机械智能化实验班本科，关注机械工程与人工智能的交叉方向。', label: '机械与智能', href: '#projects' },
  { date: '2026.09 — 10', title: '在仿真里，探索游动', text: '参与 RST 个人赛仿真机械鱼赛道，在新的工程场景里继续探索。', label: 'RST · 参赛实践' },
  { date: '持续探索', title: '把好奇心，交给实践', text: '从自学 Python 到 AI 训练师认证，以代码、项目和持续学习理解新技术。', label: '学习与实践', certificate: true },
];

export const projectNotes = {
  '01': [ ['想法', '在一块画布里，探索一个小小的宇宙。'], ['实现', '原生 JavaScript 与 Canvas，组织移动、射击与碰撞。'], ['体验', '用方向键或触摸操作，在挑战中累积得分。'] ],
  '02': [ ['想法', '让图像识别成为可以上手的网页体验。'], ['实现', '使用 TensorFlow.js 与 MobileNet 进行图片分类。'], ['体验', '上传一张图片，看看模型眼中的猫与狗。'] ],
  '03': [ ['想法', '在熟悉的玩法里，重新理解交互与逻辑。'], ['实现', '通过 Canvas 绘制地图，探索游戏逻辑。'], ['细节', '把名字 SJV 藏在地图中央的钢墙里。'] ],
};

export const photoNotes = {
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [String(i + 1).padStart(2, '0'), { location: '', date: '', note: '' }])),
  '03': { location: '信阳市鸡公山', date: '2026 / 06', note: '红月粉霞，氤氲希望' },
  '08': { location: '奉贤东海观景台', date: '2026 / 09', note: '朦胧清月，照见永恒' },
  '09': { location: '朱家角古镇', date: '2026 / 10', note: '绿墙街巷，私私人语' },
};
// 编辑建议以“接下来”呈现，不作为已完成的项目成果。
export const projectSupplements = {
  '01': { difficulty: '', next: '尝试加入难度选择，让每次出发都有不同的节奏。' },
  '02': { difficulty: '', next: '补充更直观的预测说明，让模型的判断容易理解。' },
  '03': { difficulty: '', next: '继续打磨关卡与反馈，让小小的战场更有层次。' },
};
export const credentialGroups = [
  { id: 'all', label: '全部记录', ids: null, description: '沿着不同的方向，积累理解世界的方法。' },
  { id: 'foundation', label: '基础与训练', ids: ['01', '02', '16'], description: '从人工智能基础，到 AI 训练师认证。' },
  { id: 'application', label: '应用与工程', ids: Array.from({ length: 13 }, (_, i) => String(i + 3).padStart(2, '0')), description: '围绕大模型、智能体与应用开发继续探索。' },
  { id: 'code', label: '编程与工具', ids: ['17'], description: '以编程基础，为动手实践打下起点。' },
];

export const evidence = {
  '01': { label: '体验交互项目', href: '#projects' },
  '02': { label: '查看 AI 训练师认证', certificate: true },
  '03': { label: '回看校园实践轨迹', href: '#about' },
  '04': { label: '浏览 9 张摄影作品', href: '#photography' },
};
