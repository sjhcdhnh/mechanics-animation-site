export type SupportType = 'pin' | 'roller' | null;

export interface TrussNode {
  id: number;
  x: number;
  y: number;
  support: SupportType;
  Fx: number;
  Fy: number;
}

export interface TrussMember {
  id: number;
  start: number;
  end: number;
}

export interface TrussModel {
  nodes: TrussNode[];
  members: TrussMember[];
}

export interface TrussResult {
  memberForces: Record<number, number>;
  reactions: Record<number, { Rx: number; Ry: number }>;
  residual: number;
}

export const SAMPLE_TRUSS: TrussModel = {
  nodes: [
    { id: 0, x: 2, y: 1, support: 'pin', Fx: 0, Fy: 0 },
    { id: 1, x: 10, y: 1, support: 'roller', Fx: 0, Fy: 0 },
    { id: 2, x: 6, y: 6, support: null, Fx: 0, Fy: -10 },
  ],
  members: [
    { id: 0, start: 0, end: 1 },
    { id: 1, start: 0, end: 2 },
    { id: 2, start: 1, end: 2 },
  ],
};

function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  const a = matrix.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-10) {
      throw new Error('方程组奇异：请检查杆件连接、共线节点或支座约束。');
    }
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = a[col][col];
    for (let j = col; j <= n; j += 1) a[col][j] /= scale;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = col; j <= n; j += 1) a[row][j] -= factor * a[col][j];
    }
  }
  return a.map((row) => row[n]);
}

export function checkTruss(model: TrussModel) {
  const pins = model.nodes.filter((node) => node.support === 'pin');
  const rollers = model.nodes.filter((node) => node.support === 'roller');
  const unknowns = model.members.length + pins.length * 2 + rollers.length;
  return {
    equations: model.nodes.length * 2,
    unknowns,
    determinate: unknowns === model.nodes.length * 2,
    supportsValid: pins.length === 1 && rollers.length === 1,
  };
}

export function solveTruss(model: TrussModel): TrussResult {
  const check = checkTruss(model);
  if (!check.supportsValid) throw new Error('当前求解器需要恰好 1 个铰支座和 1 个滚动支座。');
  if (!check.determinate) {
    throw new Error(`静定条件不满足：未知量 ${check.unknowns}，平衡方程 ${check.equations}。`);
  }

  const nodeIndex = new Map(model.nodes.map((node, index) => [node.id, index]));
  const pin = model.nodes.find((node) => node.support === 'pin')!;
  const roller = model.nodes.find((node) => node.support === 'roller')!;
  const size = model.nodes.length * 2;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const rhs = Array(size).fill(0);

  model.nodes.forEach((node, index) => {
    rhs[index * 2] = -node.Fx;
    rhs[index * 2 + 1] = -node.Fy;
  });

  model.members.forEach((member, column) => {
    const start = model.nodes[nodeIndex.get(member.start) ?? -1];
    const end = model.nodes[nodeIndex.get(member.end) ?? -1];
    if (!start || !end) throw new Error('存在连接到缺失节点的杆件。');
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 1e-8) throw new Error('存在长度为零的杆件。');
    const cx = dx / length;
    const cy = dy / length;
    const si = nodeIndex.get(start.id)! * 2;
    const ei = nodeIndex.get(end.id)! * 2;
    matrix[si][column] += cx;
    matrix[si + 1][column] += cy;
    matrix[ei][column] -= cx;
    matrix[ei + 1][column] -= cy;
  });

  let reactionColumn = model.members.length;
  const pinRow = nodeIndex.get(pin.id)! * 2;
  matrix[pinRow][reactionColumn] = 1;
  const pinRxColumn = reactionColumn++;
  matrix[pinRow + 1][reactionColumn] = 1;
  const pinRyColumn = reactionColumn++;
  const rollerRow = nodeIndex.get(roller.id)! * 2;
  matrix[rollerRow + 1][reactionColumn] = 1;
  const rollerRyColumn = reactionColumn;

  const solution = solveLinearSystem(matrix, rhs);
  const memberForces = Object.fromEntries(model.members.map((member, i) => [member.id, solution[i]]));
  const reactions = {
    [pin.id]: { Rx: solution[pinRxColumn], Ry: solution[pinRyColumn] },
    [roller.id]: { Rx: 0, Ry: solution[rollerRyColumn] },
  };
  const residual = Math.max(...matrix.map((row, i) => Math.abs(row.reduce((sum, v, j) => sum + v * solution[j], 0) - rhs[i])));
  return { memberForces, reactions, residual };
}

export function normalizeTruss(input: unknown): TrussModel {
  if (!input || typeof input !== 'object') throw new Error('模型必须是 JSON 对象。');
  const raw = input as { nodes?: unknown[]; members?: unknown[] };
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.members)) throw new Error('JSON 需要包含 nodes 和 members 数组。');
  const nodes = raw.nodes.map((item, index) => {
    const node = item as Partial<TrussNode>;
    const support: SupportType = node.support === 'pin' || node.support === 'roller' ? node.support : null;
    return {
      id: Number.isFinite(Number(node.id)) ? Number(node.id) : index,
      x: Number(node.x), y: Number(node.y), support,
      Fx: Number(node.Fx || 0), Fy: Number(node.Fy || 0),
    };
  });
  if (nodes.some((node) => !Number.isFinite(node.x) || !Number.isFinite(node.y))) throw new Error('节点坐标必须是数字。');
  const ids = new Set(nodes.map((node) => node.id));
  const members = raw.members.map((item, index) => {
    const member = item as Partial<TrussMember>;
    return { id: Number.isFinite(Number(member.id)) ? Number(member.id) : index, start: Number(member.start), end: Number(member.end) };
  });
  if (members.some((member) => !ids.has(member.start) || !ids.has(member.end) || member.start === member.end)) {
    throw new Error('杆件端点必须引用两个不同的现有节点。');
  }
  return { nodes, members };
}
