/**
 * ============================================================
 * 流式渲染演示 (Streaming Rendering Demo)
 * 核心功能：
 * 1. 逐字/逐词流式输出
 * 2. SSE (Server-Sent Events) 实时数据推送
 * 3. 代码块流式高亮渲染
 * 4. Markdown 富文本实时流式渲染 —— 每个字输出时都即时排版
 * ============================================================
 */

/* ============================
   Demo 1: 聊天助手逐字流式回复
   ============================ */

const demo1Text = `你好！我是一个 AI 助手演示程序。\n\n我正在向你展示什么是「流式渲染」。\n\n与传统一次性显示整段文本不同，流式渲染会将内容像打字一样，逐个字符、逐词地实时呈现给用户。这种方式能带来更自然的交互体验，让用户感受到"对方正在思考"和"正在输出"的过程。\n\n优点包括：\n• 减少用户等待的焦虑感\n• 更早地呈现可用信息\n• 提升产品的智能感和科技感`;

let demo1Timer = null;
let demo1Index = 0;

function startDemo1() {
  const contentEl = document.getElementById('messageContent1');
  const statusEl = document.getElementById('status1');
  const startBtn = document.getElementById('startDemo1');

  if (demo1Timer) return;

  // 重置状态
  contentEl.innerHTML = '<span class="typing-cursor">|</span>';
  demo1Index = 0;
  statusEl.textContent = '正在流式输出...';
  statusEl.style.color = '#4F46E5';
  startBtn.disabled = true;

  const cursorSpan = '<span class="typing-cursor">|</span>';

  demo1Timer = setInterval(() => {
    if (demo1Index >= demo1Text.length) {
      clearInterval(demo1Timer);
      demo1Timer = null;
      contentEl.innerHTML = escapeHtml(demo1Text);
      statusEl.textContent = '流式渲染完成';
      statusEl.style.color = '#10B981';
      startBtn.disabled = false;
      return;
    }

    const char = demo1Text[demo1Index];
    const currentText = escapeHtml(demo1Text.slice(0, demo1Index + 1));
    contentEl.innerHTML = currentText + cursorSpan;
    demo1Index++;
  }, 35);
}

function clearDemo1() {
  if (demo1Timer) {
    clearInterval(demo1Timer);
    demo1Timer = null;
  }
  const contentEl = document.getElementById('messageContent1');
  const statusEl = document.getElementById('status1');
  const startBtn = document.getElementById('startDemo1');
  contentEl.innerHTML = '<span class="typing-cursor">|</span>';
  statusEl.textContent = '等待开始...';
  statusEl.style.color = '#4F46E5';
  startBtn.disabled = false;
  demo1Index = 0;
}

/* ============================
   Demo 2: SSE 服务器推送
   ============================ */

let eventSource = null;

function connectSSE() {
  const outputEl = document.getElementById('sseOutput');
  const statusEl = document.getElementById('sseStatus');
  const connectBtn = document.getElementById('connectSSE');

  if (eventSource) {
    outputEl.innerHTML += '<div class="output-line"><span class="timestamp">[' + getTimeString() + ']</span><span class="label">[警告]</span> 已存在连接，请先断开</div>';
    return;
  }

  outputEl.innerHTML = '';
  statusEl.textContent = '正在连接...';
  statusEl.style.color = '#FBBF24';
  connectBtn.disabled = true;

  // 模拟 SSE 数据流（纯前端模拟，不依赖真实后端）
  simulateSSEStream();
}

function simulateSSEStream() {
  const outputEl = document.getElementById('sseOutput');
  const statusEl = document.getElementById('sseStatus');
  const connectBtn = document.getElementById('connectSSE');

  const messages = [
    { type: 'info', text: '连接已建立，等待服务端推送...' },
    { type: 'data', text: '收到心跳包: ping' },
    { type: 'data', text: '实时数据更新 - 用户数: 1,024' },
    { type: 'data', text: '实时数据更新 - 订单数: 512' },
    { type: 'event', text: '新订单通知: #ORD-20240511-001' },
    { type: 'data', text: '实时数据更新 - 在线人数: 1,028' },
    { type: 'info', text: '接收到批处理消息 (3条)' },
    { type: 'data', text: '批处理 [1/3]: 订单状态变更为 shipping' },
    { type: 'data', text: '批处理 [2/3]: 库存扣减成功' },
    { type: 'data', text: '批处理 [3/3]: 通知邮件已发送' },
    { type: 'event', text: '系统通知: 每日报表已生成' },
    { type: 'data', text: '实时监控 - CPU使用率: 34%' },
    { type: 'data', text: '实时监控 - 内存使用率: 56%' },
    { type: 'info', text: '保持长连接中...' },
    { type: 'data', text: '实时数据更新 - 用户数: 1,035' },
    { type: 'event', text: '告警: 某接口响应时间超过阈值 (1.2s)' },
    { type: 'data', text: '告警已自动恢复' },
    { type: 'info', text: '连接正常，持续接收数据流' },
  ];

  let index = 0;
  eventSource = { active: true, close: () => { eventSource = null; } };
  statusEl.textContent = '已连接 (模拟)';
  statusEl.style.color = '#10B981';

  function pushNext() {
    if (!eventSource || !eventSource.active) return;

    if (index >= messages.length) {
      // 循环播放
      index = 1;
    }

    const msg = messages[index];
    const colorMap = {
      info: '#61AFEF',
      data: '#98C379',
      event: '#E06C75',
      error: '#EF4444'
    };
    const labelMap = {
      info: '信息',
      data: '数据',
      event: '事件',
      error: '错误'
    };

    const line = document.createElement('div');
    line.className = 'output-line';
    line.innerHTML = `<span class="timestamp">[${getTimeString()}]</span><span class="label" style="color:${colorMap[msg.type]}">[${labelMap[msg.type]}]</span> ${escapeHtml(msg.text)}`;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;

    index++;

    // 随机间隔模拟真实推送
    const delay = 600 + Math.random() * 1200;
    eventSource._timer = setTimeout(pushNext, delay);
  }

  pushNext();
}

function disconnectSSE() {
  const statusEl = document.getElementById('sseStatus');
  const connectBtn = document.getElementById('connectSSE');
  const outputEl = document.getElementById('sseOutput');

  if (eventSource) {
    if (eventSource._timer) clearTimeout(eventSource._timer);
    eventSource.active = false;
    eventSource = null;

    statusEl.textContent = '已断开';
    statusEl.style.color = '#EF4444';
    connectBtn.disabled = false;

    const line = document.createElement('div');
    line.className = 'output-line';
    line.style.color = '#9CA3AF';
    line.innerHTML = `<span class="timestamp">[${getTimeString()}]</span> --- 连接已关闭 ---`;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }
}

function clearSSE() {
  const outputEl = document.getElementById('sseOutput');
  outputEl.innerHTML = '<div class="output-line placeholder">等待连接...</div>';
}

/* ============================
   Demo 3: 代码块流式高亮渲染
   ============================ */

const codeSnippet = `// 定义一个异步流式渲染函数
async function streamRender(element, dataSource) {
  const decoder = new TextDecoder();
  const reader = dataSource.getReader();

  // 逐块读取数据流
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // 解码并追加到 DOM
    const chunk = decoder.decode(value, { stream: true });
    element.textContent += chunk;

    // 自动滚动到底部
    element.scrollTop = element.scrollHeight;
  }

  console.log('流式渲染完成！');
}`;

let codeTimer = null;
let codeIndex = 0;

function startCodeDemo() {
  const codeEl = document.getElementById('codeContent');
  const cursorEl = document.getElementById('codeCursor');
  const startBtn = document.getElementById('startCodeDemo');

  if (codeTimer) return;

  codeEl.innerHTML = '';
  codeIndex = 0;
  cursorEl.style.display = 'inline';
  startBtn.disabled = true;

  codeTimer = setInterval(() => {
    if (codeIndex >= codeSnippet.length) {
      clearInterval(codeTimer);
      codeTimer = null;
      codeEl.innerHTML = highlightCode(codeSnippet);
      cursorEl.style.display = 'none';
      startBtn.disabled = false;
      return;
    }

    codeEl.textContent = codeSnippet.slice(0, codeIndex + 1);
    codeIndex++;
  }, 25);
}

function clearCodeDemo() {
  if (codeTimer) {
    clearInterval(codeTimer);
    codeTimer = null;
  }
  document.getElementById('codeContent').innerHTML = '';
  document.getElementById('codeCursor').style.display = 'inline';
  document.getElementById('startCodeDemo').disabled = false;
  codeIndex = 0;
}

/* ============================
   Demo 4: Markdown 实时流式渲染
   【核心改进】：每输出一个字符，就即时将已输出的全部文本
   重新渲染为 Markdown HTML。光标始终定位在文本末尾。
   ============================ */

const markdownText = `# 流式渲染技术介绍

## 什么是流式渲染？

流式渲染（**Streaming Rendering**）是一种将内容**逐步、实时**呈现给用户的技术。

### 核心优势

1. **即时反馈**：用户无需等待全部内容加载完成
2. **降低感知延迟**：逐步显示让用户感觉速度更快
3. **提升交互体验**：模拟真实对话的打字效果

> "流式渲染是现代 AI 产品（如 ChatGPT）的核心交互体验之一。"

### 实现方式对比

- **SSE (Server-Sent Events)**：服务器单向推送
- **WebSocket**：全双工双向通信
- **Fetch + ReadableStream**：基于流的现代 API

### 简单代码示例

你可以使用 \`fetch\` 和 \`ReadableStream\`：

\`\`\`javascript
const response = await fetch('/api/stream');
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  appendText(decoder.decode(value));
}
\`\`\`

---

## 总结

流式渲染让 Web 应用变得更有生命力！🚀`;

let mdTimer = null;
let mdIndex = 0;

/**
 * 启动 Markdown 实时流式渲染
 * 每输出一个字符就立即把当前已累积的全部文本
 * 重新渲染为 Markdown HTML，实现“边打字边排版”的效果。
 */
function startMarkdownDemo() {
  const outputEl = document.getElementById('markdownOutput');
  const startBtn = document.getElementById('startMarkdownDemo');

  if (mdTimer) return;

  outputEl.innerHTML = '';
  mdIndex = 0;
  startBtn.disabled = true;

  mdTimer = setInterval(() => {
    if (mdIndex >= markdownText.length) {
      clearInterval(mdTimer);
      mdTimer = null;
      // 最终完整渲染（确保光标消失）
      outputEl.innerHTML = renderMarkdown(markdownText);
      placeCursorAtEnd(outputEl);
      startBtn.disabled = false;
      return;
    }

    // 当前已累积的全部文本
    const currentText = markdownText.slice(0, mdIndex + 1);

    // 实时渲染为 Markdown，并在末尾追加光标
    const renderedHtml = renderMarkdown(currentText);
    outputEl.innerHTML = renderedHtml;

    // 在最后一个可见文本节点末尾追加闪烁光标
    appendCursorToLastText(outputEl);

    mdIndex++;
  }, 18);
}

function clearMarkdownDemo() {
  if (mdTimer) {
    clearInterval(mdTimer);
    mdTimer = null;
  }
  const outputEl = document.getElementById('markdownOutput');
  outputEl.innerHTML = '<span class="typing-cursor" id="markdownCursor">|</span>';
  document.getElementById('startMarkdownDemo').disabled = false;
  mdIndex = 0;
}

/**
 * 在容器最后一个文本节点末尾追加闪烁光标
 */
function appendCursorToLastText(container) {
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '|';

  // 深度优先遍历，找到最后一个文本节点
  let lastTextNode = null;
  function findLastTextNode(node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.length > 0) {
      lastTextNode = node;
      return;
    }
    // 跳过 <style>、<script>、光标本身
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'STYLE' || node.tagName === 'SCRIPT') return;
    }
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      findLastTextNode(node.childNodes[i]);
      if (lastTextNode) return;
    }
  }
  findLastTextNode(container);

  if (lastTextNode) {
    const parent = lastTextNode.parentNode;
    if (parent.lastChild === lastTextNode) {
      parent.appendChild(cursor);
    } else {
      parent.insertBefore(cursor, lastTextNode.nextSibling);
    }
  } else {
    container.appendChild(cursor);
  }
}

/**
 * 将光标定位到容器末尾（用于最终渲染后）
 */
function placeCursorAtEnd(container) {
  appendCursorToLastText(container);
}

/* ============================
   Utility Functions
   ============================ */

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeString() {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

/**
 * 简单的语法高亮实现
 */
function highlightCode(code) {
  let result = escapeHtml(code);

  // 关键字
  const keywords = ['const', 'let', 'var', 'function', 'async', 'await', 'if', 'else', 'while', 'true', 'false', 'break', 'return', 'new'];
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    result = result.replace(regex, '<span class="code-keyword">$1</span>');
  });

  // 字符串
  result = result.replace(/'([^']*)'/g, '<span class="code-string">\'$1\'</span>');
  result = result.replace(/`([^`]*)`/g, '<span class="code-string">`$1`</span>');

  // 函数名
  result = result.replace(/(\w+)(?=\()/g, '<span class="code-function">$1</span>');

  // 注释
  result = result.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>');

  // 数字
  result = result.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

  return result;
}

/**
 * 简单的 Markdown 渲染实现
 * 改进版：处理不规则片段时更健壮
 */
function renderMarkdown(text) {
  if (!text) return '';

  let html = escapeHtml(text);

  // 1. 代码块（注意：转义后换行是 \n）
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // 2. 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 3. 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 4. 标题
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 5. 引用
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

  // 6. 有序列表
  html = html.replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');

  // 7. 无序列表（排除已经被转义的 h1/h2/h3/h4 等）
  html = html.replace(/^[-*]\s+(.*$)/gim, '<li>$1</li>');

  // 8. 包裹 li 为 ul/ol
  html = html.replace(/(<li>.*<\/li>\s*)+/g, match => `<ul>${match}</ul>`);

  // 9. 分隔线
  html = html.replace(/^---$/gim, '<hr>');

  // 10. 段落：双换行分段
  // 先把连续的\n\n替换成段落分隔
  html = html.replace(/\n\n/g, '</p><p>');
  // 单换行改为 <br>
  html = html.replace(/\n/g, '<br>');

  // 11. 收尾包裹
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}

/* ============================
   Event Bindings
   ============================ */

function initEvents() {
  // Demo 1
  document.getElementById('startDemo1').addEventListener('click', startDemo1);
  document.getElementById('clearDemo1').addEventListener('click', clearDemo1);

  // Demo 2
  document.getElementById('connectSSE').addEventListener('click', connectSSE);
  document.getElementById('disconnectSSE').addEventListener('click', disconnectSSE);
  document.getElementById('clearSSE').addEventListener('click', clearSSE);

  // Demo 3
  document.getElementById('startCodeDemo').addEventListener('click', startCodeDemo);
  document.getElementById('clearCodeDemo').addEventListener('click', clearCodeDemo);

  // Demo 4
  document.getElementById('startMarkdownDemo').addEventListener('click', startMarkdownDemo);
  document.getElementById('clearMarkdownDemo').addEventListener('click', clearMarkdownDemo);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initEvents);
