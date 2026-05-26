import type { CategoryInfo, PresetQuestion } from '@/types';

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'planar-linkage',
    label: '平面连杆机构',
    description: '曲柄滑块、曲柄摇杆、牛头刨床、抽油机、平行四边形、椭圆规等经典平面连杆机构',
  },
  {
    slug: 'cam-drive',
    label: '凸轮与传动',
    description: '凸轮推杆、卷扬机等传动机构的运动学与动力学分析',
  },
  {
    slug: 'serial-robot',
    label: '串联机器人',
    description: '平面4R及空间5-DOF机械臂的运动学正解与逆解',
  },
  {
    slug: 'aerospace',
    label: '航天机构',
    description: '空间站对接、FAST馈源舱等航天器机构运动模拟',
  },
  {
    slug: 'dynamics',
    label: '动力学与振动',
    description: '双摆、单摆、弹簧振子等理论力学动力学专题及用户上传动画',
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
) as Record<string, CategoryInfo>;

export const PRESET_QUESTIONS: PresetQuestion[] = [
  { id: 'q1', text: '这个机构有几个自由度？请用自由度公式计算。', category: 'all' },
  { id: 'q2', text: '请推导该机构的位置正解（几何约束方程）。', category: 'all' },
  { id: 'q3', text: '这个机构满足 Grashof 条件吗？属于哪种类型？', category: 'planar-linkage' },
  { id: 'q4', text: '请解释急回特性机理及行程速比系数 K 的计算。', category: 'planar-linkage' },
  { id: 'q5', text: '请用瞬心法分析关键构件的速度关系。', category: 'all' },
  { id: 'q6', text: '请用 D-H 法建立该机械臂的运动学模型。', category: 'serial-robot' },
  { id: 'q7', text: '请推导滑块的速度和加速度随曲柄转角的变化规律。', category: 'planar-linkage' },
  { id: 'q8', text: '如何进行逆运动学求解（CCD / 雅可比方法）？', category: 'serial-robot' },
  { id: 'q9', text: '请分析卷扬机启动阶段的瞬态动力学响应。', category: 'cam-drive' },
  { id: 'q10', text: '请推导该机构的拉格朗日运动方程。', category: 'all' },
  { id: 'q11', text: '请简要介绍航天器交会对接的轨道力学基础。', category: 'aerospace' },
  { id: 'q12', text: 'Stewart 平台（六自由度并联机构）的运动学原理是什么？', category: 'aerospace' },
];

export const SITE_CONFIG = {
  title: '力拔理力集',
  description: '力学拔尖基地班出品 — 将理论力学的抽象知识点转化为交互式三维动画，涵盖平面连杆机构、凸轮传动、串联机器人、航天机构、动力学与振动等方向的运动学演示。',
  author: '力学拔尖基地班',
  locale: 'zh-CN',
};
