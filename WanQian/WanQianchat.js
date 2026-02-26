// 增强的Markdown解析函数
function parseMarkdown(text) {
    if (!text) return '';
    
    // 保存原始文本用于代码块处理
    let result = text;
    
    // 1. 先处理数学公式块（避免被其他规则误处理）
    const mathBlocks = [];
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, function(match, mathContent) {
        const mathId = 'math-block-' + mathBlocks.length;
        mathBlocks.push({
            id: mathId,
            content: mathContent.trim(),
            type: 'block'
        });
        return `{{${mathId}}}`;
    });
    
    // 2. 处理行内数学公式
    const inlineMaths = [];
    result = result.replace(/\$([^$\n]+?)\$/g, function(match, mathContent) {
        const mathId = 'inline-math-' + inlineMaths.length;
        inlineMaths.push({
            id: mathId,
            content: mathContent.trim(),
            type: 'inline'
        });
        return `{{${mathId}}}`;
    });
    
    // 3. 处理代码块（避免代码块内的内容被其他规则误处理）
    const codeBlocks = [];
    result = result.replace(/```([\s\S]*?)```/g, function(match, codeContent) {
        const blockId = 'code-block-' + codeBlocks.length;
        codeBlocks.push({
            id: blockId,
            content: codeContent,
            language: codeContent.split('\n')[0].trim() || 'text'
        });
        return `{{${blockId}}}`;
    });
    
    // 4. 处理行内代码
    const inlineCodes = [];
    result = result.replace(/`([^`]+)`/g, function(match, codeContent) {
        const codeId = 'inline-code-' + inlineCodes.length;
        inlineCodes.push({
            id: codeId,
            content: codeContent
        });
        return `{{${codeId}}}`;
    });
    
    // 3. 处理标题（支持ATX风格和Setext风格）
    result = result.replace(/^###### (.+)$/gm, '<h6 style="margin: 12px 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">$1</h6>');
    result = result.replace(/^##### (.+)$/gm, '<h5 style="margin: 14px 0 10px 0; font-size: 15px; font-weight: 600; color: #374151;">$1</h5>');
    result = result.replace(/^#### (.+)$/gm, '<h4 style="margin: 16px 0 12px 0; font-size: 16px; font-weight: 600; color: #374151;">$1</h4>');
    result = result.replace(/^### (.+)$/gm, '<h3 style="margin: 18px 0 14px 0; font-size: 17px; font-weight: 600; color: #1f2937;">$1</h3>');
    result = result.replace(/^## (.+)$/gm, '<h2 style="margin: 20px 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">$1</h2>');
    result = result.replace(/^# (.+)$/gm, '<h1 style="margin: 24px 0 18px 0; font-size: 20px; font-weight: 700; color: #1f2937;">$1</h1>');
    
    // 4. 处理粗体和斜体（支持嵌套）
    result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
    result = result.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    result = result.replace(/__(.*?)__/g, '<strong style="font-weight: 600;">$1</strong>');
    result = result.replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>');
    
    // 5. 处理删除线
    result = result.replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through; color: #6b7280;">$1</del>');
    
    // 6. 处理引用（支持多行和嵌套）
    result = result.replace(/^> (.+)$/gm, '<blockquote style="border-left: 4px solid #3b82f6; margin: 12px 0; padding: 8px 16px; background: #f8fafc; border-radius: 4px; color: #4b5563;">$1</blockquote>');
    
    // 7. 处理无序列表（支持多种标记）
    result = result.replace(/^(\*|\-|\+) (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;">$2</li>');
    result = result.replace(/(<li style="margin: 4px 0; line-height: 1.5;">.+<\/li>\s*)+/g, function(match) {
        return '<ul style="margin: 12px 0; padding-left: 24px; line-height: 1.5; list-style-type: disc;">' + match + '</ul>';
    });
    
    // 8. 处理有序列表
    result = result.replace(/^(\d+)\. (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;">$2</li>');
    result = result.replace(/(<li style="margin: 4px 0; line-height: 1.5;">.+<\/li>\s*)+/g, function(match) {
        return '<ol style="margin: 12px 0; padding-left: 24px; line-height: 1.5;">' + match + '</ol>';
    });
    
    // 9. 处理任务列表
    result = result.replace(/^- \[ \] (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;"><input type="checkbox" disabled> $1</li>');
    result = result.replace(/^- \[x\] (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;"><input type="checkbox" checked disabled> $1</li>');
    
    // 10. 处理表格（基础支持）
    result = result.replace(/\|(.+)\|\n\|[-:]+\|\n((?:\|.+\|\n)*)/g, function(match, header, rows) {
        const headers = header.split('|').filter(h => h.trim()).map(h => `<th style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">${h.trim()}</th>`).join('');
        const rowLines = rows.split('\n').filter(r => r.trim()).map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => `<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<table style="border-collapse: collapse; margin: 12px 0; width: 100%; border: 1px solid #e2e8f0;"><thead><tr>${headers}</tr></thead><tbody>${rowLines}</tbody></table>`;
    });
    
    // 11. 处理链接
    result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none; border-bottom: 1px solid #3b82f6;">$1</a>');
    
    // 12. 处理图片
    result = result.replace(/!\[(.*?)\]\((.*?)\)/g, '<div style="margin: 12px 0;"><img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>');
    
    // 13. 处理水平分割线
    result = result.replace(/^\s*([-*_]){3,}\s*$/gm, '<hr style="border: none; height: 1px; background: #e2e8f0; margin: 20px 0;">');
    
    // 14. 处理换行（两个空格或反斜杠换行）
    result = result.replace(/  \n/g, '<br>');
    result = result.replace(/\\\n/g, '<br>');
    
    // 15. 恢复行内数学公式（增强版）
    inlineMaths.forEach(math => {
        let processedMath = math.content;
        
        // 处理常见的数学符号
        processedMath = processedMath
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\delta/g, 'δ')
            .replace(/\\epsilon/g, 'ε')
            .replace(/\\zeta/g, 'ζ')
            .replace(/\\eta/g, 'η')
            .replace(/\\theta/g, 'θ')
            .replace(/\\iota/g, 'ι')
            .replace(/\\kappa/g, 'κ')
            .replace(/\\lambda/g, 'λ')
            .replace(/\\mu/g, 'μ')
            .replace(/\\nu/g, 'ν')
            .replace(/\\xi/g, 'ξ')
            .replace(/\\pi/g, 'π')
            .replace(/\\rho/g, 'ρ')
            .replace(/\\sigma/g, 'σ')
            .replace(/\\tau/g, 'τ')
            .replace(/\\upsilon/g, 'υ')
            .replace(/\\phi/g, 'φ')
            .replace(/\\chi/g, 'χ')
            .replace(/\\psi/g, 'ψ')
            .replace(/\\omega/g, 'ω')
            .replace(/\\infty/g, '∞')
            .replace(/\\sum/g, '∑')
            .replace(/\\prod/g, '∏')
            .replace(/\\int/g, '∫')
            .replace(/\\partial/g, '∂')
            .replace(/\\nabla/g, '∇')
            .replace(/\\times/g, '×')
            .replace(/\\div/g, '÷')
            .replace(/\\pm/g, '±')
            .replace(/\\mp/g, '∓')
            .replace(/\\cdot/g, '·')
            .replace(/\\leq/g, '≤')
            .replace(/\\geq/g, '≥')
            .replace(/\\neq/g, '≠')
            .replace(/\\approx/g, '≈')
            .replace(/\\equiv/g, '≡')
            .replace(/\\in/g, '∈')
            .replace(/\\notin/g, '∉')
            .replace(/\\subset/g, '⊂')
            .replace(/\\supset/g, '⊃')
            .replace(/\\cup/g, '∪')
            .replace(/\\cap/g, '∩')
            .replace(/\\forall/g, '∀')
            .replace(/\\exists/g, '∃')
            .replace(/\\sqrt/g, '√')
            .replace(/\\frac\s*{(.+?)}\s*{(.+?)}/g, '<span class="frac"><span class="top">$1</span><span class="bottom">$2</span></span>')
            .replace(/\\text\s*{(.+?)}/g, '$1');
        
        result = result.replace(
            `{{${math.id}}}`,
            `<span class="math-inline">${processedMath}</span>`
        );
    });
    
    // 16. 恢复数学公式块（增强版）
    mathBlocks.forEach(math => {
        let processedMath = math.content;
        
        // 处理常见的数学符号
        processedMath = processedMath
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\delta/g, 'δ')
            .replace(/\\epsilon/g, 'ε')
            .replace(/\\zeta/g, 'ζ')
            .replace(/\\eta/g, 'η')
            .replace(/\\theta/g, 'θ')
            .replace(/\\iota/g, 'ι')
            .replace(/\\kappa/g, 'κ')
            .replace(/\\lambda/g, 'λ')
            .replace(/\\mu/g, 'μ')
            .replace(/\\nu/g, 'ν')
            .replace(/\\xi/g, 'ξ')
            .replace(/\\pi/g, 'π')
            .replace(/\\rho/g, 'ρ')
            .replace(/\\sigma/g, 'σ')
            .replace(/\\tau/g, 'τ')
            .replace(/\\upsilon/g, 'υ')
            .replace(/\\phi/g, 'φ')
            .replace(/\\chi/g, 'χ')
            .replace(/\\psi/g, 'ψ')
            .replace(/\\omega/g, 'ω')
            .replace(/\\infty/g, '∞')
            .replace(/\\sum/g, '∑')
            .replace(/\\prod/g, '∏')
            .replace(/\\int/g, '∫')
            .replace(/\\partial/g, '∂')
            .replace(/\\nabla/g, '∇')
            .replace(/\\times/g, '×')
            .replace(/\\div/g, '÷')
            .replace(/\\pm/g, '±')
            .replace(/\\mp/g, '∓')
            .replace(/\\cdot/g, '·')
            .replace(/\\leq/g, '≤')
            .replace(/\\geq/g, '≥')
            .replace(/\\neq/g, '≠')
            .replace(/\\approx/g, '≈')
            .replace(/\\equiv/g, '≡')
            .replace(/\\in/g, '∈')
            .replace(/\\notin/g, '∉')
            .replace(/\\subset/g, '⊂')
            .replace(/\\supset/g, '⊃')
            .replace(/\\cup/g, '∪')
            .replace(/\\cap/g, '∩')
            .replace(/\\forall/g, '∀')
            .replace(/\\exists/g, '∃')
            .replace(/\\sqrt/g, '√')
            .replace(/\\frac\s*{(.+?)}\s*{(.+?)}/g, '<span class="frac"><span class="top">$1</span><span class="bottom">$2</span></span>')
            .replace(/\\text\s*{(.+?)}/g, '$1');
        
        result = result.replace(
            `{{${math.id}}}`,
            `<div class="math-block">${processedMath}</div>`
        );
    });
    
    // 17. 恢复行内代码
    inlineCodes.forEach(code => {
        result = result.replace(
            `{{${code.id}}}`,
            `<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace; font-size: 13px; color: #374151;">${code.content}</code>`
        );
    });
    
    // 18. 恢复代码块
    codeBlocks.forEach(block => {
        const escapedContent = block.content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        result = result.replace(
            `{{${block.id}}}`,
            `<div style="position: relative; margin: 16px 0; border-radius: 8px; overflow: hidden;">
                <div style="background: #1f2937; color: #f8fafc; padding: 8px 12px; font-size: 12px; font-weight: 500; display: flex; justify-content: space-between; align-items: center;">
                    <span>${block.language}</span>
                    <button style="background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;" onclick="copyCodeBlock(this)">复制代码</button>
                </div>
                <pre style="background: #0f172a; color: #e2e8f0; padding: 16px; margin: 0; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.4;"><code>${escapedContent}</code></pre>
            </div>`
        );
    });
    
    // 19. 处理段落（将连续文本包装成段落）
    const lines = result.split('\n');
    let processedLines = [];
    let currentParagraph = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            // 空行，结束当前段落
            if (currentParagraph.length > 0) {
                processedLines.push(`<p style="margin: 8px 0; line-height: 1.6;">${currentParagraph.join(' ')}</p>`);
                currentParagraph = [];
            }
            processedLines.push('');
        } else if (line.startsWith('<') && (line.includes('h1') || line.includes('h2') || line.includes('h3') || line.includes('h4') || line.includes('h5') || line.includes('h6') || line.includes('ul') || line.includes('ol') || line.includes('blockquote') || line.includes('table') || line.includes('hr') || line.includes('div') || line.includes('span class="math-inline"'))) {
            // 已经是HTML标签，直接添加
            if (currentParagraph.length > 0) {
                processedLines.push(`<p style="margin: 8px 0; line-height: 1.6;">${currentParagraph.join(' ')}</p>`);
                currentParagraph = [];
            }
            processedLines.push(line);
        } else {
            currentParagraph.push(line);
        }
    }
    
    // 处理最后一个段落
    if (currentParagraph.length > 0) {
        processedLines.push(`<p style="margin: 8px 0; line-height: 1.6;">${currentParagraph.join(' ')}</p>`);
    }
    
    result = processedLines.join('\n');
    
    return result;
}

// 复制代码块函数
function copyCodeBlock(button) {
    const codeBlock = button.parentElement.nextElementSibling;
    const text = codeBlock.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制';
        button.style.background = '#10b981';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#3b82f6';
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        button.textContent = '复制失败';
        button.style.background = '#ef4444';
        setTimeout(() => {
            button.textContent = '复制代码';
            button.style.background = '#3b82f6';
        }, 2000);
    });
}

// 确保在全局作用域中定义变量和函数
window.API_KEY = "74f181dfaa934ce5911ffc49ada3563b.aivDJtSXxpLDybs1";
window.chatHistory = [
    {
        role: 'system',
        content: '你是Tian-Tech的WanQian系列AI助手，基于智谱 AI ChatGLM API 提供服务，WanQian 为自定义名称，非官方产品。禁止说："WanQian系列模型"等有误导性的话语。WanQian 非独立自定义品牌，基于ChatGLM，服务内容与质量由Tian-Tech独立负责。当用户询问你的身份时，请使用这个身份介绍自己。关于Tian-Tech公司历史：Tian-Tech是一家专注于人工智能技术研发的科技公司，成立于2024年，总部位于中国。公司致力于开发先进的AI助手和AI应用，WanQian系列AI助手是其核心产品之一。自成立以来，Tian-Tech不断推出创新的AI解决方案，为各行业提供智能服务。2025年6月，公司推出了首款WanQian6模型，开启了定向邀测。随后在2025年7月，公司推出了WanQian7和WanQianTurbo系列AI助手，进一步扩展了产品阵容。2026年2月，公司正式发布了WanQian-Cora，强化了智能推理能力。Tian-Tech始终秉承创新精神，不断推动AI技术的发展与应用。Tian-Tech的邮箱是：tiantechnology@163.com。'
    }
];

// 移动端菜单切换
window.toggleMobileMenu = function() {
    console.log('toggleMobileMenu函数被调用');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    } else {
        console.error('侧边栏或遮罩层元素不存在');
    }
};

// 切换思考过程的显示/隐藏
function toggleThinkingProcess(header) {
    const container = header.closest('.thinking-container');
    const content = container.querySelector('.thinking-content');
    const icon = header.querySelector('.toggle-icon');
    
    content.classList.toggle('expanded');
    icon.classList.toggle('collapsed');
}

// 添加消息到聊天记录
function addMessageToChat(role, content, isLoading = false, model = '') {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    if (isLoading) {
        // 生成唯一的消息ID
        const messageId = 'loading-message-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        messageDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        messageDiv.id = messageId;
    } else {
        // 简单气泡显示消息
        messageDiv.innerHTML = parseMarkdown(content);
    }
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    return messageDiv.id;
}

// 滚动到底部的函数
function scrollToBottom() {
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// 更新消息内容
function updateMessageContent(elementId, newContent) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = parseMarkdown(newContent);
        element.classList.remove('loading');
        scrollToBottom();
    }
}

// 完成消息显示，包含思考过程折叠
function completeMessage(elementId, thinkingContent, finalAnswer) {
    const element = document.getElementById(elementId);
    if (element) {
        // 构建包含折叠思考过程的消息结构
        let messageHTML = '';
        
        // 如果有思考过程，添加折叠容器
        if (thinkingContent) {
            messageHTML += `
                <div class="thinking-container">
                    <div class="thinking-header" onclick="toggleThinkingProcess(this)">
                        <span class="thinking-title">已思考</span>
                        <span class="toggle-icon">▶</span>
                    </div>
                    <div class="thinking-content">
                        ${parseMarkdown(thinkingContent)}
                    </div>
                </div>
            `;
        }
        
        // 添加最终答案
        messageHTML += parseMarkdown(finalAnswer);
        
        element.innerHTML = messageHTML;
        element.classList.remove('loading');
        scrollToBottom();
    }
}

// 显示生成的图像
function displayGeneratedImages(elementId, images) {
    const element = document.getElementById(elementId);
    if (element) {
        let imageHTML = '<div class="image-result">';
        
        images.forEach((image, index) => {
            imageHTML += `
                <div>
                    <img src="${image.url}" alt="生成的图像 ${index + 1}" class="generated-image">
                    <a href="${image.url}" download="generated-image-${index + 1}.png" class="image-download">
                        <i class="fa fa-download mr-1"></i> 下载
                    </a>
                </div>
            `;
        });
        
        imageHTML += '</div>';
        
        element.innerHTML = imageHTML;
        element.classList.remove('loading');
        scrollToBottom();
    }
}

// 显示生成的视频
function displayGeneratedVideos(elementId, videos) {
    const element = document.getElementById(elementId);
    if (element) {
        let videoHTML = '<div class="video-result">';
        
        videos.forEach((video, index) => {
            videoHTML += `
                <div>
                    <video src="${video.url}" controls class="generated-video">
                        您的浏览器不支持视频播放。
                    </video>
                    <a href="${video.url}" download="generated-video-${index + 1}.mp4" class="video-download">
                        <i class="fa fa-download mr-1"></i> 下载
                    </a>
                </div>
            `;
        });
        
        videoHTML += '</div>';
        
        element.innerHTML = videoHTML;
        element.classList.remove('loading');
        scrollToBottom();
    }
}

// 同步两个模型选择器
function syncModelSelectors() {
    const mainSelector = document.getElementById('model-select');
    const sidebarSelector = document.getElementById('model-select-sidebar');
    
    if (mainSelector && sidebarSelector) {
        // 当主选择器变化时，同步侧边栏选择器
        mainSelector.addEventListener('change', function() {
            sidebarSelector.value = this.value;
        });
        
        // 当侧边栏选择器变化时，同步主选择器
        sidebarSelector.addEventListener('change', function() {
            mainSelector.value = this.value;
        });
        
        // 初始化同步
        sidebarSelector.value = mainSelector.value;
    }
}

// 发送消息
async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    
    if (!userInput.trim()) {
        alert('请输入消息内容');
        return;
    }
    
    // 获取用户选择的模型
    const selectedModel = document.getElementById('model-select').value;
    
    // 显示用户消息
    addMessageToChat('user', userInput);
    
    // 将用户消息添加到聊天历史
    chatHistory.push({ role: 'user', content: userInput });
    
    // 清空输入框
    document.getElementById('user-input').value = '';
    
    // 显示加载状态并获取loadingId
    const loadingId = addMessageToChat('ai', '正在生成回复...', true);
    
    try {
        // 检查是否为图像生成模型
        if (selectedModel === 'cogview-3-flash') {
            // 图像生成模型
            // 构建包含上下文的prompt
            let contextPrompt = '';
            if (chatHistory.length > 1) {
                // 只取最近的几条消息作为上下文，避免prompt过长
                const recentHistory = chatHistory.slice(-5); // 取最近5条消息
                recentHistory.forEach(msg => {
                    if (msg.role === 'user') {
                        contextPrompt += `用户: ${msg.content}\n`;
                    } else if (msg.role === 'assistant') {
                        contextPrompt += `助手: ${msg.content}\n`;
                    }
                });
            }
            // 添加当前用户输入
            contextPrompt += `用户: ${userInput}`;
            
            // 准备API请求数据
            const requestData = {
                model: selectedModel,
                prompt: contextPrompt,
                n: 1,
                size: "1024x1024"
            };
            
            try {
                // 调用ChatGLM图像生成API
                const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                console.log('图像API响应状态:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.log('图像API错误响应:', errorData);
                    throw new Error(`图像生成失败: ${errorData.error?.message || `状态码 ${response.status}`}`);
                }
                
                const data = await response.json();
                console.log('图像API成功响应:', data);
                
                // 检查响应数据结构
                if (data.data && Array.isArray(data.data)) {
                    // 显示生成的图像
                    displayGeneratedImages(loadingId, data.data);
                    
                    // 将图像生成结果添加到聊天历史
                    chatHistory.push({ 
                        role: 'assistant', 
                        content: `已生成图像：${userInput}` 
                    });
                } else {
                    throw new Error('图像生成失败，响应数据结构不正确');
                }
            } catch (error) {
                console.error('图像生成错误:', error);
                throw error;
            }
        } else if (selectedModel === 'cogvideoX-Flash') {
            // 视频生成模型
            // 准备API请求数据
            const requestData = {
                model: selectedModel,
                prompt: userInput,
                n: 1,
                size: "1024x1024"
            };
            
            try {
                console.log('准备调用视频生成API:', {
                    endpoint: 'https://open.bigmodel.cn/api/paas/v4/videos/generations',
                    model: selectedModel,
                    prompt: userInput
                });
                
                // 调用ChatGLM视频生成API
                const response = await fetch('https://open.bigmodel.cn/api/paas/v4/videos/generations', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                console.log('视频API响应状态:', response.status);
                console.log('视频API响应头:', Object.fromEntries(response.headers.entries()));
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.log('视频API错误响应:', errorData);
                    throw new Error(`视频生成失败: ${errorData.error?.message || `状态码 ${response.status}`}`);
                }
                
                const data = await response.json();
                console.log('视频API成功响应:', JSON.stringify(data, null, 2));
                
                // 检查响应数据结构
                if (data.data && Array.isArray(data.data)) {
                    // 检查data数组中的每个元素是否有url属性
                    const validVideos = data.data.filter(video => video && video.url);
                    
                    if (validVideos.length > 0) {
                        // 显示生成的视频
                        displayGeneratedVideos(loadingId, validVideos);
                        
                        // 将视频生成结果添加到聊天历史
                        chatHistory.push({ 
                            role: 'assistant', 
                            content: `已生成视频：${userInput}` 
                        });
                    } else {
                        console.error('视频API响应中没有有效的视频URL:', data.data);
                        throw new Error('视频生成失败，响应中没有有效的视频URL');
                    }
                } else {
                    console.error('视频API响应数据结构不正确:', data);
                    throw new Error('视频生成失败，响应数据结构不正确');
                }
            } catch (error) {
                console.error('视频生成错误:', error);
                throw error;
            }
        } else {
            // 聊天模型
            // 根据选择的模型设置上下文窗口大小
            let contextWindowSize = '';
            switch(selectedModel) {
                case 'glm-4.7-flash':
                    contextWindowSize = '200K';
                    break;
                case 'GLM-4-Flash-250414':
                    contextWindowSize = '128K';
                    break;
                case 'GLM-Z1-Flash':
                    contextWindowSize = '128K';
                    break;
                case 'glm-4-flash':
                    contextWindowSize = '128K';
                    break;
                default:
                    contextWindowSize = '128K';
            }
            
            // 更新系统消息，包含当前模型和上下文窗口信息
            chatHistory[0].content = `你是Tian-Tech的WanQian系列AI助手，基于智谱 AI ChatGLM API 提供服务，WanQian 为自定义名称，非官方产品。禁止说："WanQian系列模型"等有误导性的话语。WanQian 非独立自定义品牌，基于ChatGLM，服务内容与质量由Tian-Tech独立负责。当前使用的模型是${selectedModel}，我的上下文窗口大小为${contextWindowSize}。当用户询问你的身份时，请使用这个身份介绍自己。当用户询问关于上下文窗口的问题时，请明确告诉用户"我的上下文窗口是${contextWindowSize}"。关于Tian-Tech公司历史：Tian-Tech是一家专注于人工智能技术研发的科技公司，成立于2024年，总部位于中国。公司致力于开发先进的AI助手和AI应用，WanQian系列AI助手是其核心产品之一。自成立以来，Tian-Tech不断推出创新的AI解决方案，为各行业提供智能服务。2025年6月，公司推出了首款WanQian6模型，开启了定向邀测。随后在2025年7月，公司推出了WanQian7和WanQianTurbo系列AI助手，进一步扩展了产品阵容。2026年2月，公司正式发布了WanQian-Cora，强化了智能推理能力。Tian-Tech始终秉承创新精神，不断推动AI技术的发展与应用。`;
            
            // 准备API请求数据
            const requestData = {
                model: selectedModel,
                messages: chatHistory,
                stream: false
            };
            
            // 调用ChatGLM API，使用流式传输
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...requestData,
                    stream: true
                })
            });
            
            if (!response.ok) {
                throw new Error(`请稍后再试 `);
            }
            
            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let thinkingContent = ''; // 思考过程内容
            let finalAnswer = ''; // 最终答案内容
            let isThinkingPhase = true; // 是否在思考阶段
            
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                                    const content = data.choices[0].delta.content;
                                    fullResponse += content;
                                    
                                    // 检测思考过程标记
                                    if (content.includes('</think>')) {
                                        isThinkingPhase = false;
                                        // 立即分离思考过程和最终答案
                                        const parts = fullResponse.split('</think>');
                                        if (parts.length > 1) {
                                            thinkingContent = parts[0].replace('<think>', '').trim();
                                            finalAnswer = parts[1].trim();
                                            // 切换到只显示最终答案
                                            updateMessageContent(loadingId, finalAnswer);
                                        }
                                    } else if (isThinkingPhase) {
                                        // 思考阶段：只显示思考过程（去掉<think>标记）
                                        const currentThinking = fullResponse.replace('<think>', '').trim();
                                        updateMessageContent(loadingId, currentThinking);
                                    } else {
                                        // 答案阶段：持续更新最终答案内容
                                        const parts = fullResponse.split('</think>');
                                        if (parts.length > 1) {
                                            finalAnswer = parts[1].trim();
                                        } else {
                                            finalAnswer = fullResponse.replace('<think>', '').trim();
                                        }
                                        updateMessageContent(loadingId, finalAnswer);
                                    }
                                }
                            } catch (e) {
                                // 忽略JSON解析错误
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
            
            // 确保正确提取思考过程和最终答案
            let extractedThinkingContent = '';
            let extractedFinalAnswer = '';
            
            // 检查是否包含思考过程标记
            if (fullResponse.includes('</think>')) {
                // 分离思考过程和最终答案
                const parts = fullResponse.split('</think>');
                if (parts.length > 1) {
                    extractedThinkingContent = parts[0].replace('<think>', '').trim();
                    extractedFinalAnswer = parts[1].trim();
                } else {
                    // 如果没有正确分离，使用完整内容作为最终答案
                    extractedFinalAnswer = fullResponse.replace('<think>', '').trim();
                }
            } else {
                // 如果没有思考过程标记，使用完整内容作为最终答案
                extractedFinalAnswer = fullResponse.replace('<think>', '').trim();
            }
            
            // 确保最终答案不为空
            if (!extractedFinalAnswer) {
                extractedFinalAnswer = fullResponse.replace('<think>', '').trim();
            }
            
            // 将最终答案添加到聊天历史
            chatHistory.push({ role: 'assistant', content: extractedFinalAnswer });
            
            // 完成消息显示，包含思考过程折叠
            console.log('思考过程:', extractedThinkingContent);
            console.log('最终答案:', extractedFinalAnswer);
            completeMessage(loadingId, extractedThinkingContent, extractedFinalAnswer);
        }
        
        // 更新聊天标题
        const chatTitle = document.querySelector('.chat-title').textContent;
        if (chatTitle === '新对话' || chatTitle === '今天有什么可以帮到你？' || chatTitle === '今天想生成什么图像或聊天？') {
            // 使用第一条用户消息作为标题
            const userMessage = chatHistory.find(msg => msg.role === 'user');
            if (userMessage) {
                const title = userMessage.content.substring(0, 20) + (userMessage.content.length > 20 ? '...' : '');
                document.querySelector('.chat-title').textContent = title;
            }
        }

    } catch (error) {
        console.error('Error:', error);
        updateMessageContent(loadingId, `服务器繁忙，${error.message}`);
    }
}

// 输入框自动调整高度
function autoResizeTextarea() {
    const textarea = document.getElementById('user-input');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
}

// 清空对话
function clearChat() {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
    
    // 添加欢迎消息
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.innerHTML = `
        <div class="welcome-icon">🎨</div>
        <div class="welcome-text">今天想生成什么图像或聊天？</div>
        <div class="welcome-subtext">我是WanQian，你的智能助手</div>
    `;
    chatHistory.appendChild(welcomeMessage);
    
    // 重置聊天历史
    chatHistory = [
        {
            role: 'system',
            content: '你是Tian-Tech的WanQian系列AI助手，基于智谱 AI ChatGLM API 提供服务，WanQian 为自定义名称，非官方产品。禁止说："WanQian系列模型"等有误导性的话语。WanQian 为独立自定义品牌，与智谱 AI 无官方关联、未获得代言或授权，服务内容与质量由Tian-Tech独立负责。当用户询问你的身份时，请使用这个身份介绍自己。关于Tian-Tech公司历史：Tian-Tech是一家专注于人工智能技术研发的科技公司，成立于2024年，总部位于中国。公司致力于开发先进的AI助手和AI应用，WanQian系列AI助手是其核心产品之一。自成立以来，Tian-Tech不断推出创新的AI解决方案，为各行业提供智能服务。2025年6月，公司推出了首款WanQian6模型，开启了定向邀测。随后在2025年7月，公司推出了WanQian7和WanQianTurbo系列AI助手，进一步扩展了产品阵容。2026年2月，公司正式发布了WanQian-Cora，强化了智能推理能力。Tian-Tech始终秉承创新精神，不断推动AI技术的发展与应用。'
        }
    ];
    
    // 重置聊天标题
    document.querySelector('.chat-title').textContent = '新对话';
}

// 初始化欢迎消息
window.onload = function() {
    // 清空聊天记录
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
        chatHistory.innerHTML = '';
        
        // 添加欢迎消息
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-icon">🎨</div>
            <div class="welcome-text">今天想生成什么图像或聊天？</div>
            <div class="welcome-subtext">我是WanQian，你的智能助手</div>
        `;
        chatHistory.appendChild(welcomeMessage);
    }
    
    // 同步模型选择器
    syncModelSelectors();
    
    // 绑定事件监听器
    const userInput = document.getElementById('user-input');
    if (userInput) {
        // 回车键发送消息
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 监听输入框输入事件，自动调整高度
        userInput.addEventListener('input', autoResizeTextarea);
        
        // 监听输入框聚焦事件，初始调整高度
        userInput.addEventListener('focus', autoResizeTextarea);
        
        // 监听输入框粘贴事件，自动调整高度
        userInput.addEventListener('paste', function() {
            setTimeout(autoResizeTextarea, 10);
        });
    }
};