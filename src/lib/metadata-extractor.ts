import * as cheerio from 'cheerio';
import type { Category } from '@/types';

export interface ExtractedMeta {
  title: string;
  subtitle: string;
  mechanismType: string;
  category: Category;
  tags: string[];
}

export function extractMetadata(html: string): ExtractedMeta {
  const $ = cheerio.load(html);

  const title = $('title').text().trim() || '未命名动画';

  const subtitle =
    $('#subtitle').text().trim() ||
    $('[class*="subtitle"]').first().text().trim() ||
    '';

  const mechanismType = guessMechanismType(title, subtitle);

  const category = guessCategory(title, subtitle, mechanismType);

  const tags = generateTags(title, subtitle, mechanismType);

  return { title, subtitle, mechanismType, category, tags };
}

function guessMechanismType(title: string, subtitle: string): string {
  const combined = `${title} ${subtitle}`.toLowerCase();

  if (combined.includes('曲柄滑块') || combined.includes('slider-crank')) return '曲柄滑块机构';
  if (combined.includes('曲柄摇杆') || combined.includes('crank-rocker')) return '曲柄摇杆机构';
  if (combined.includes('平行四边形') || combined.includes('parallelogram')) return '平行四边形机构';
  if (combined.includes('牛头刨') || combined.includes('急回') || combined.includes('shaper') || combined.includes('quick-return'))
    return '曲柄摆动导杆机构';
  if (combined.includes('抽油') || combined.includes('pumpjack') || combined.includes('beam pump'))
    return '游梁式抽油机机构';
  if (combined.includes('卷扬') || combined.includes('winch')) return '卷扬机';
  if (combined.includes('机械臂') || combined.includes('manipulator') || combined.includes('dof'))
    return '串联机械臂';
  if (combined.includes('对接') || combined.includes('docking') || combined.includes('空间站'))
    return '航天器交会对接机构';
  if (combined.includes('fast') || combined.includes('馈源')) return 'FAST馈源舱索牵引并联机构';
  if (combined.includes('四杆') || combined.includes('linkage')) return '四杆机构';

  return '平面机构';
}

function guessCategory(title: string, subtitle: string, mechanismType: string): Category {
  const combined = `${title} ${subtitle} ${mechanismType}`.toLowerCase();

  if (combined.includes('机械臂') || combined.includes('机器人') || combined.includes('manipulator') || combined.includes('dof'))
    return 'serial-robot';
  if (combined.includes('航天') || combined.includes('空间站') || combined.includes('对接') || combined.includes('fast') || combined.includes('馈源') || combined.includes('docking') || combined.includes('cabin'))
    return 'aerospace';
  if (combined.includes('卷扬') || combined.includes('winch') || combined.includes('工程'))
    return 'engineering';
  if (
    combined.includes('曲柄') ||
    combined.includes('连杆') ||
    combined.includes('四杆') ||
    combined.includes('摇杆') ||
    combined.includes('滑块') ||
    combined.includes('刨床') ||
    combined.includes('抽油') ||
    combined.includes('平行四边形') ||
    combined.includes('crank') ||
    combined.includes('rocker') ||
    combined.includes('slider') ||
    combined.includes('linkage')
  )
    return 'four-bar';

  return 'other';
}

function generateTags(title: string, subtitle: string, mechanismType: string): string[] {
  const combined = `${title} ${subtitle} ${mechanismType}`;
  const tags: string[] = [];

  const mapping: [RegExp, string][] = [
    [/曲柄|crank/i, '曲柄'],
    [/滑块|slider|活塞/i, '滑块'],
    [/摇杆|rocker|雨刮/i, '摇杆'],
    [/连杆|connecting rod/i, '连杆'],
    [/四杆|four.?bar|linkage/i, '四杆机构'],
    [/Grashof/i, 'Grashof'],
    [/急回|quick.?return/i, '急回特性'],
    [/导杆|slotted/i, '导杆'],
    [/抽油|pump.?jack|beam pump/i, '抽油机'],
    [/平行四边形|parallelogram/i, '平行四边形'],
    [/机械臂|manipulator|robot/i, '机械臂'],
    [/CCD|运动学逆解|inverse kinematics/i, '逆运动学'],
    [/D.?H/i, 'D-H法'],
    [/卷扬|winch|hoist/i, '卷扬机'],
    [/动力学|dynamics/i, '动力学'],
    [/运动学|kinematics/i, '运动学'],
    [/空间站|对接|docking/i, '空间站'],
    [/FAST|馈源|feed/i, 'FAST'],
    [/Stewart|并联/i, '并联机构'],
    [/自由度|DOF/i, '自由度'],
  ];

  for (const [regex, tag] of mapping) {
    if (regex.test(combined)) {
      tags.push(tag);
    }
  }

  return [...new Set(tags)].slice(0, 8);
}
