export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  extractedTitle?: string;
  extractedSubtitle?: string;
}

export function validateAnimationHTML(html: string, fileName: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };

  // Check if it's valid HTML (has basic structure)
  if (!/<html/i.test(html) || !/<body/i.test(html)) {
    result.errors.push('文件不是有效的 HTML 文档（缺少 <html> 或 <body> 标签）');
    result.valid = false;
    return result;
  }

  // Check for Three.js importmap
  if (!/importmap/i.test(html) || !/"three"/i.test(html)) {
    result.errors.push('未找到 Three.js importmap 配置。动画必须通过 importmap 加载 Three.js');
    result.valid = false;
  }

  // Check for WebGL renderer or canvas setup
  if (!/WebGLRenderer|THREE\.|requestAnimationFrame/i.test(html)) {
    result.warnings.push('未检测到 Three.js WebGL 渲染器或动画循环代码');
  }

  // Check for OrbitControls
  if (!/OrbitControls/i.test(html)) {
    result.warnings.push('未检测到 OrbitControls，建议添加鼠标交互支持');
  }

  // Security checks: reject external script sources (except CDNs for three.js)
  const scriptSrcMatches = html.match(/<script\s+[^>]*src\s*=\s*["'][^"']*["'][^>]*>/gi);
  if (scriptSrcMatches) {
    const allowedCDNs = ['unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'esm.sh'];
    for (const tag of scriptSrcMatches) {
      const srcMatch = tag.match(/src\s*=\s*["']([^"']*)["']/i);
      if (srcMatch) {
        const src = srcMatch[1];
        const isAllowed = allowedCDNs.some((cdn) => src.includes(cdn));
        if (!isAllowed && !src.startsWith('/') && !src.startsWith('./')) {
          result.warnings.push(`外部脚本来源: ${src}。请确认该脚本安全可信`);
        }
      }
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    { pattern: /fetch\s*\(/, message: '含 fetch() 网络请求' },
    { pattern: /XMLHttpRequest/, message: '含 XMLHttpRequest 网络请求' },
    { pattern: /eval\s*\(/, message: '含 eval() 动态代码执行' },
    { pattern: /document\.cookie/i, message: '含 cookie 访问' },
  ];

  for (const { pattern, message: msg } of suspiciousPatterns) {
    if (pattern.test(html)) {
      result.warnings.push(`${msg}。请确认该代码行为安全`);
    }
  }

  // Extract title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    result.extractedTitle = titleMatch[1].trim();
  }

  // Try to extract subtitle from #subtitle element
  const subtitleMatch = html.match(/id=["']subtitle["'][^>]*>([^<]*)</i);
  if (subtitleMatch) {
    result.extractedSubtitle = subtitleMatch[1].trim();
  }

  // Check file extension
  if (!fileName.toLowerCase().endsWith('.html') && !fileName.toLowerCase().endsWith('.htm')) {
    result.errors.push('文件必须是 .html 格式');
    result.valid = false;
  }

  return result;
}
