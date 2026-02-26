// WanQiannewchat.js - 简化版聊天脚本，确保在网站上正常工作

// 确保在全局作用域中定义变量和函数
window.API_KEY = "74f181dfaa934ce5911ffc49ada3563b.aivDJtSXxpLDybs1";
window.chatHistory = [
    {
        role: 'system',
        content: '你是Tian-Tech的WanQian系列AI助手，基于智谱 AI ChatGLM API 提供服务，WanQian 为自定义名称，非官方产品。WanQian 非独立自定义品牌，基于ChatGLM，服务内容与质量由Tian-Tech独立负责。'
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

// 添加消息到聊天记录
window.addMessageToChat = function(role, content, isLoading = false) {
    console.log('addMessageToChat函数被调用', { role, content, isLoading });
    const chatHistoryEl = document.getElementById('chat-history');
    if (!chatHistoryEl) {
        console.error('聊天记录元素不存在');
        return null;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    if (isLoading) {
        const messageId = 'loading-message-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        messageDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        messageDiv.id = messageId;
    } else {
        messageDiv.textContent = content;
    }
    
    chatHistoryEl.appendChild(messageDiv);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
    
    return messageDiv.id;
};

// 更新消息内容
window.updateMessageContent = function(elementId, newContent) {
    console.log('updateMessageContent函数被调用', { elementId, newContent });
    const element = document.getElementById(elementId);
    if (element) {
        // 解析Markdown内容
        if (window.parseMarkdown) {
            element.innerHTML = window.parseMarkdown(newContent);
        } else {
            element.textContent = newContent;
        }
        element.classList.remove('loading');
        const chatHistoryEl = document.getElementById('chat-history');
        if (chatHistoryEl) {
            chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
        }
    }
};

// 同步两个模型选择器
window.syncModelSelectors = function() {
    console.log('syncModelSelectors函数被调用');
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
    } else {
        console.error('模型选择器元素不存在');
    }
};

// 切换思考过程的显示/隐藏
window.toggleThinkingProcess = function(header) {
    console.log('toggleThinkingProcess函数被调用');
    const container = header.closest('.thinking-container');
    const content = container.querySelector('.thinking-content');
    const icon = header.querySelector('.toggle-icon');
    
    if (container && content && icon) {
        content.classList.toggle('expanded');
        icon.classList.toggle('collapsed');
    } else {
        console.error('思考过程容器元素不存在');
    }
};

// 完成消息显示，包含思考过程折叠
window.completeMessage = function(elementId, thinkingContent, finalAnswer) {
    console.log('completeMessage函数被调用', { elementId, thinkingContent, finalAnswer });
    const element = document.getElementById(elementId);
    if (element) {
        // 构建包含折叠思考过程的消息结构
        let messageHTML = '';
        
        // 如果有思考过程，添加折叠容器
        if (thinkingContent) {
            // 解析思考过程的Markdown
            const parsedThinking = window.parseMarkdown ? window.parseMarkdown(thinkingContent) : thinkingContent;
            messageHTML += `
                <div class="thinking-container">
                    <div class="thinking-header" onclick="window.toggleThinkingProcess(this)">
                        <span class="thinking-title">已思考</span>
                        <span class="toggle-icon">▶</span>
                    </div>
                    <div class="thinking-content">
                        ${parsedThinking}
                    </div>
                </div>
            `;
        }
        
        // 添加最终答案（解析Markdown）
        const parsedAnswer = window.parseMarkdown ? window.parseMarkdown(finalAnswer) : finalAnswer;
        messageHTML += parsedAnswer;
        
        element.innerHTML = messageHTML;
        element.classList.remove('loading');
        
        // 滚动到底部
        const chatHistoryEl = document.getElementById('chat-history');
        if (chatHistoryEl) {
            chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
        }
    }
};

// 清空对话
window.clearChat = function() {
    console.log('clearChat函数被调用');
    const chatHistoryEl = document.getElementById('chat-history');
    if (chatHistoryEl) {
        chatHistoryEl.innerHTML = '';
        
        // 添加欢迎消息
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-icon">🎨</div>
            <div class="welcome-text">今天想生成什么图像或聊天？</div>
            <div class="welcome-subtext">我是WanQian，你的智能助手</div>
        `;
        chatHistoryEl.appendChild(welcomeMessage);
    }
    
    // 重置聊天历史
    window.chatHistory = [
        {
            role: 'system',
            content: '你是Tian-Tech的WanQian系列AI助手，基于智谱 AI ChatGLM API 提供服务，WanQian 为自定义名称，非官方产品。WanQian 非独立自定义品牌，基于ChatGLM，服务内容与质量由Tian-Tech独立负责。'
        }
    ];
    
    // 重置聊天标题
    const chatTitle = document.querySelector('.chat-title');
    if (chatTitle) {
        chatTitle.textContent = '新对话';
    }
};

// 发送消息
window.sendMessage = async function() {
    console.log('sendMessage函数被调用');
    const userInputEl = document.getElementById('user-input');
    if (!userInputEl) {
        console.error('用户输入元素不存在');
        alert('系统错误：输入框不存在');
        return;
    }
    
    const userInput = userInputEl.value;
    console.log('用户输入:', userInput);
    
    if (!userInput.trim()) {
        alert('请输入消息内容');
        return;
    }
    
    // 获取用户选择的模型
    const modelSelectEl = document.getElementById('model-select');
    if (!modelSelectEl) {
        console.error('模型选择元素不存在');
        alert('系统错误：模型选择器不存在');
        return;
    }
    
    const selectedModel = modelSelectEl.value;
    console.log('选择的模型:', selectedModel);
    
    // 显示用户消息
    window.addMessageToChat('user', userInput);
    
    // 将用户消息添加到聊天历史
    window.chatHistory.push({ role: 'user', content: userInput });
    
    // 清空输入框
    userInputEl.value = '';
    
    // 显示加载状态并获取loadingId
    const loadingId = window.addMessageToChat('ai', '正在生成回复...', true);
    
    try {
        // 准备API请求数据
        const requestData = {
            model: selectedModel,
            messages: window.chatHistory,
            stream: true
        };
        
        console.log('准备调用API:', {
            endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: selectedModel,
            messageCount: window.chatHistory.length
        });
        
        // 调用ChatGLM API，使用流式传输
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('API错误响应:', errorData);
            throw new Error(`API调用失败: ${errorData.error?.message || `状态码 ${response.status}`}`);
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
                                        window.updateMessageContent(loadingId, finalAnswer);
                                    }
                                } else if (isThinkingPhase) {
                                    // 思考阶段：只显示思考过程（去掉<think>标记）
                                    const currentThinking = fullResponse.replace('<think>', '').trim();
                                    window.updateMessageContent(loadingId, currentThinking);
                                } else {
                                    // 答案阶段：持续更新最终答案内容
                                    const parts = fullResponse.split('</think>');
                                    if (parts.length > 1) {
                                        finalAnswer = parts[1].trim();
                                    } else {
                                        finalAnswer = fullResponse.replace('<think>', '').trim();
                                    }
                                    window.updateMessageContent(loadingId, finalAnswer);
                                }
                            }
                        } catch (e) {
                            // 忽略JSON解析错误
                            console.error('JSON解析错误:', e);
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
        window.chatHistory.push({ role: 'assistant', content: extractedFinalAnswer });
        
        // 完成消息显示，包含思考过程折叠
        console.log('思考过程:', extractedThinkingContent);
        console.log('最终答案:', extractedFinalAnswer);
        window.completeMessage(loadingId, extractedThinkingContent, extractedFinalAnswer);
        
        // 更新聊天标题
        const chatTitleEl = document.querySelector('.chat-title');
        if (chatTitleEl) {
            const chatTitle = chatTitleEl.textContent;
            if (chatTitle === '新对话' || chatTitle === '今天有什么可以帮到你？' || chatTitle === '今天想生成什么图像或聊天？') {
                // 使用第一条用户消息作为标题
                const userMessage = window.chatHistory.find(msg => msg.role === 'user');
                if (userMessage) {
                    const title = userMessage.content.substring(0, 20) + (userMessage.content.length > 20 ? '...' : '');
                    chatTitleEl.textContent = title;
                }
            }
        }

    } catch (error) {
        console.error('发送消息错误:', error);
        window.updateMessageContent(loadingId, `服务器繁忙，${error.message || '请稍后再试'}`);
    }
};

// 输入框自动调整高度
window.autoResizeTextarea = function() {
    console.log('autoResizeTextarea函数被调用');
    const textarea = document.getElementById('user-input');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
};

// 初始化函数
window.initChat = function() {
    console.log('initChat函数被调用');
    
    // 清空聊天记录
    const chatHistoryEl = document.getElementById('chat-history');
    if (chatHistoryEl) {
        chatHistoryEl.innerHTML = '';
        
        // 添加欢迎消息
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-icon">🎨</div>
            <div class="welcome-text">今天想生成什么图像或聊天？</div>
            <div class="welcome-subtext">我是WanQian，你的智能助手</div>
        `;
        chatHistoryEl.appendChild(welcomeMessage);
    }
    
    // 同步模型选择器
    window.syncModelSelectors();
    
    // 绑定事件监听器
    const userInputEl = document.getElementById('user-input');
    if (userInputEl) {
        console.log('绑定事件监听器到用户输入元素');
        
        // 回车键发送消息
        userInputEl.addEventListener('keydown', function(e) {
            console.log('键盘事件:', e.key, e.shiftKey);
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('回车键发送消息');
                window.sendMessage();
            }
        });
        
        // 监听输入框输入事件，自动调整高度
        userInputEl.addEventListener('input', window.autoResizeTextarea);
        
        // 监听输入框聚焦事件，初始调整高度
        userInputEl.addEventListener('focus', window.autoResizeTextarea);
        
        // 监听输入框粘贴事件，自动调整高度
        userInputEl.addEventListener('paste', function() {
            setTimeout(window.autoResizeTextarea, 10);
        });
    } else {
        console.error('用户输入元素不存在，无法绑定事件监听器');
    }
};

// 页面加载完成后初始化
let initChatCalled = false;

function initChatOnce() {
    if (!initChatCalled) {
        initChatCalled = true;
        console.log('初始化聊天系统（仅执行一次）');
        window.initChat();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatOnce);
} else {
    initChatOnce();
}

// 确保window.onload也能触发初始化
window.onload = initChatOnce;

console.log('WanQiannewchat.js 加载完成');
console.log('全局函数检查:', {
    sendMessage: typeof window.sendMessage,
    clearChat: typeof window.clearChat,
    toggleMobileMenu: typeof window.toggleMobileMenu,
    autoResizeTextarea: typeof window.autoResizeTextarea,
    initChat: typeof window.initChat
});