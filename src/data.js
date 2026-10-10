import { sitePath } from './sitePath';
// 用户提供的真实个人资料与联系方式。
export const profile = {
  name: '孙嘉伟', englishName: 'SUN JIAWEI', city: '上海',
  phone: '18569971322', email: '26011422@mail.ecust.edu.cn', wechat: 'SpringReverie', qq: '3556127984',
  github: 'https://github.com/SpringReverie',
  school: '华东理工大学', major: '机械智能化实验班',
};
export const projects = [
  { id: '01', title: '星际躲避', en: 'INTO THE UNKNOWN', category: '交互开发', tags: ['JavaScript', 'Canvas', '游戏开发'], image: '星际躲避.gif', description: '从一块画布开始，构建一个可以探索的宇宙。用纯 JavaScript 实现太空射击，支持键盘与触摸操作。', href: '/game.html', action: '进入游戏', className: 'space-project' },
  { id: '02', title: '猫狗分类器', en: 'A LITTLE INTELLIGENCE', category: '人工智能', tags: ['TensorFlow.js', 'MobileNet'], image: '猫猫狗狗.jpg', description: '让机器学习走出概念，成为可体验的应用。基于深度学习识别猫狗图片，探索 AI 与日常生活的连接。', href: '/legacy/index.html#projects', action: '体验分类器', className: 'cat-project' },
  { id: '03', title: '坦克大战', en: 'PLAY. BUILD. REPEAT.', category: '交互开发', tags: ['Canvas', '游戏逻辑'], image: '坦克大战.jpg', description: '在熟悉的游戏里重建交互与逻辑。地图中央的钢墙藏着我的姓名缩写 SJV，每一处细节都来自亲手实践。', href: '/tank-battle.html', action: '开始游戏', className: 'tank-project' },
].map(project => ({ ...project, href: sitePath(project.href) }));
export const strengths = [
  { no: '01', icon: 'code', title: '把想法写成代码', en: 'BUILD WITH CODE', text: '自学 Python，实践面向对象编程与游戏开发。从逻辑拆解到交互实现，在动手中理解技术。', tags: ['Python', 'Pygame', 'JavaScript'] },
  { no: '02', icon: 'orbit', title: '连接机械与智能', en: 'THINK ACROSS DISCIPLINES', text: '以机械工程为起点，持续学习 AI 与机器学习基础。取得达摩院 AI 训练师认证，探索技术在工程场景中的应用。', tags: ['机械工程', 'AI / ML', '数据标注'] },
  { no: '03', icon: 'mic', title: '让表达产生共鸣', en: 'MAKE IDEAS HEARD', text: '累计参与 10 余场校园大型活动主持，参与广播节目策划、文案与播音。善于沟通，也能从容应对现场变化。', tags: ['活动主持', '公开演讲', '团队协作'] },
  { no: '04', icon: 'camera', title: '在细节里发现美', en: 'SEE THE UNEXPECTED', text: '自学摄影与后期，独立完成从拍摄到成片的流程。通过摄影、诗词与汇报设计，把感性观察融入理性思考。', tags: ['摄影与后期', '视觉表达', '文案创作'] },
];
