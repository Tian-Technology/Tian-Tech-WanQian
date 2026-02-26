// markdown.js - 专门处理模型输出的markdown格式文本

/**
 * 增强的Markdown解析函数
 * @param {string} text - 要解析的Markdown文本
 * @returns {string} - 解析后的HTML文本
 */
function parseMarkdown(text) {
    console.log('parseMarkdown函数被调用');
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
    result = result.replace(/\$([^$]+?)\$/g, function(match, mathContent) {
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
    
    // 5. 处理标题（支持ATX风格）
    result = result.replace(/^###### (.+)$/gm, '<h6 style="margin: 12px 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">$1</h6>');
    result = result.replace(/^##### (.+)$/gm, '<h5 style="margin: 14px 0 10px 0; font-size: 15px; font-weight: 600; color: #374151;">$1</h5>');
    result = result.replace(/^#### (.+)$/gm, '<h4 style="margin: 16px 0 12px 0; font-size: 16px; font-weight: 600; color: #374151;">$1</h4>');
    result = result.replace(/^### (.+)$/gm, '<h3 style="margin: 18px 0 14px 0; font-size: 17px; font-weight: 600; color: #1f2937;">$1</h3>');
    result = result.replace(/^## (.+)$/gm, '<h2 style="margin: 20px 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">$1</h2>');
    result = result.replace(/^# (.+)$/gm, '<h1 style="margin: 24px 0 18px 0; font-size: 20px; font-weight: 700; color: #1f2937;">$1</h1>');
    
    // 6. 处理粗体和斜体（支持嵌套）
    result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
    result = result.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    result = result.replace(/__(.*?)__/g, '<strong style="font-weight: 600;">$1</strong>');
    result = result.replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>');
    
    // 7. 处理删除线
    result = result.replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through; color: #6b7280;">$1</del>');
    
    // 8. 处理引用（支持多行）
    result = result.replace(/^> (.+)$/gm, '<blockquote style="border-left: 4px solid #3b82f6; margin: 12px 0; padding: 8px 16px; background: #f8fafc; border-radius: 4px; color: #4b5563;">$1</blockquote>');
    
    // 9. 处理无序列表（支持多种标记）
    result = result.replace(/^(\*|\-|\+) (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;">$2</li>');
    result = result.replace(/(<li style="margin: 4px 0; line-height: 1.5;">.+<\/li>\s*)+/g, function(match) {
        return '<ul style="margin: 12px 0; padding-left: 24px; line-height: 1.5; list-style-type: disc;">' + match + '</ul>';
    });
    
    // 10. 处理有序列表
    result = result.replace(/^(\d+)\. (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;">$2</li>');
    result = result.replace(/(<li style="margin: 4px 0; line-height: 1.5;">.+<\/li>\s*)+/g, function(match) {
        return '<ol style="margin: 12px 0; padding-left: 24px; line-height: 1.5;">' + match + '</ol>';
    });
    
    // 11. 处理任务列表
    result = result.replace(/^- \[ \] (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;"><input type="checkbox" disabled> $1</li>');
    result = result.replace(/^- \[x\] (.+)$/gm, '<li style="margin: 4px 0; line-height: 1.5;"><input type="checkbox" checked disabled> $1</li>');
    
    // 12. 处理表格（基础支持）
    result = result.replace(/\|(.+)\|\n\|[-:]+\|\n((?:\|.+\|\n)*)/g, function(match, header, rows) {
        const headers = header.split('|').filter(h => h.trim()).map(h => `<th style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">${h.trim()}</th>`).join('');
        const rowLines = rows.split('\n').filter(r => r.trim()).map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => `<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<table style="border-collapse: collapse; margin: 12px 0; width: 100%; border: 1px solid #e2e8f0;"><thead><tr>${headers}</tr></thead><tbody>${rowLines}</tbody></table>`;
    });
    
    // 13. 处理链接
    result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none; border-bottom: 1px solid #3b82f6;">$1</a>');
    
    // 14. 处理图片
    result = result.replace(/!\[(.*?)\]\((.*?)\)/g, '<div style="margin: 12px 0;"><img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>');
    
    // 15. 处理水平分割线
    result = result.replace(/^\s*([-*_]){3,}\s*$/gm, '<hr style="border: none; height: 1px; background: #e2e8f0; margin: 20px 0;">');
    
    // 16. 处理换行（两个空格或反斜杠换行）
    result = result.replace(/  \n/g, '<br>');
    result = result.replace(/\\\n/g, '<br>');
    
    // 17. 恢复行内数学公式
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
            .replace(/\\sqrt\s*{(.+?)}/g, '√($1)')
            .replace(/\\frac\s*{(.+?)}\s*{(.+?)}/g, '<span class="frac"><span class="top">$1</span><span class="bottom">$2</span></span>')
            .replace(/\\text\s*{(.+?)}/g, '$1')
            .replace(/\\gcd\s*{(.+?)}\s*{(.+?)}/g, 'gcd($1, $2)')
            .replace(/\\Rightarrow/g, '⇒')
            .replace(/\\Rightarrow/g, '⇒')
            .replace(/\\Leftrightarrow/g, '⇔')
            .replace(/\\rightarrow/g, '→')
            .replace(/\\leftarrow/g, '←')
            .replace(/\\leftrightarrow/g, '↔')
            .replace(/\\geq/g, '≥')
            .replace(/\\leq/g, '≤')
            .replace(/\\neq/g, '≠')
            .replace(/\\approx/g, '≈')
            .replace(/\\equiv/g, '≡')
            .replace(/\\sim/g, '∼')
            .replace(/\\cong/g, '≅')
            .replace(/\\propto/g, '∝')
            .replace(/\\parallel/g, '∥')
            .replace(/\\perp/g, '⊥')
            .replace(/\\angle/g, '∠')
            .replace(/\\triangle/g, '△')
            .replace(/\\square/g, '□')
            .replace(/\\circle/g, '○')
            .replace(/\\odot/g, '⊙')
            .replace(/\\oplus/g, '⊕')
            .replace(/\\otimes/g, '⊗')
            .replace(/\\ominus/g, '⊖')
            .replace(/\\oslash/g, '⊘')
            .replace(/\\cdot/g, '·')
            .replace(/\\ast/g, '∗')
            .replace(/\\star/g, '⋆')
            .replace(/\\circ/g, '∘')
            .replace(/\\bullet/g, '•')
            .replace(/\\diamond/g, '◇')
            .replace(/\\nabla/g, '∇')
            .replace(/\\partial/g, '∂')
            .replace(/\\infty/g, '∞')
            .replace(/\\aleph/g, 'ℵ')
            .replace(/\\beth/g, 'ℶ')
            .replace(/\\gimel/g, 'ℷ')
            .replace(/\\daleth/g, 'ℸ')
            .replace(/\\prime/g, '′')
            .replace(/\\doubleprime/g, '″')
            .replace(/\\tripleprime/g, '‴')
            .replace(/\\backprime/g, '‵')
            .replace(/\\vec\s*{(.+?)}/g, '$1→')
            .replace(/\\overline\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\underline\s*{(.+?)}/g, '<span style="text-decoration: underline;">$1</span>')
            .replace(/\\widehat\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\widetilde\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\overline\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\underline\s*{(.+?)}/g, '<span style="text-decoration: underline;">$1</span>')
            .replace(/\\bold\s*{(.+?)}/g, '<strong>$1</strong>')
            .replace(/\\mathbf\s*{(.+?)}/g, '<strong>$1</strong>')
            .replace(/\\mathit\s*{(.+?)}/g, '<em>$1</em>')
            .replace(/\\mathbb\s*{(.+?)}/g, '$1')
            .replace(/\\mathcal\s*{(.+?)}/g, '$1')
            .replace(/\\mathscr\s*{(.+?)}/g, '$1')
            .replace(/\\mathfrak\s*{(.+?)}/g, '$1')
            .replace(/\\mathsf\s*{(.+?)}/g, '$1')
            .replace(/\\mathtt\s*{(.+?)}/g, '$1')
            .replace(/\\mathrm\s*{(.+?)}/g, '$1')
            .replace(/\\text\s*{(.+?)}/g, '$1');
        
        result = result.replace(
            `{{${math.id}}}`,
            `<span class="math-inline" style="font-family: 'Cambria Math', 'Times New Roman', serif; font-style: italic; padding: 0 2px;">${processedMath}</span>`
        );
    });
    
    // 18. 恢复数学公式块
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
            .replace(/\\sqrt\s*{(.+?)}/g, '√($1)')
            .replace(/\\frac\s*{(.+?)}\s*{(.+?)}/g, '<span class="frac"><span class="top">$1</span><span class="bottom">$2</span></span>')
            .replace(/\\text\s*{(.+?)}/g, '$1')
            .replace(/\\gcd\s*{(.+?)}\s*{(.+?)}/g, 'gcd($1, $2)')
            .replace(/\\Rightarrow/g, '⇒')
            .replace(/\\Rightarrow/g, '⇒')
            .replace(/\\Leftrightarrow/g, '⇔')
            .replace(/\\rightarrow/g, '→')
            .replace(/\\leftarrow/g, '←')
            .replace(/\\leftrightarrow/g, '↔')
            .replace(/\\geq/g, '≥')
            .replace(/\\leq/g, '≤')
            .replace(/\\neq/g, '≠')
            .replace(/\\approx/g, '≈')
            .replace(/\\equiv/g, '≡')
            .replace(/\\sim/g, '∼')
            .replace(/\\cong/g, '≅')
            .replace(/\\propto/g, '∝')
            .replace(/\\parallel/g, '∥')
            .replace(/\\perp/g, '⊥')
            .replace(/\\angle/g, '∠')
            .replace(/\\triangle/g, '△')
            .replace(/\\square/g, '□')
            .replace(/\\circle/g, '○')
            .replace(/\\odot/g, '⊙')
            .replace(/\\oplus/g, '⊕')
            .replace(/\\otimes/g, '⊗')
            .replace(/\\ominus/g, '⊖')
            .replace(/\\oslash/g, '⊘')
            .replace(/\\cdot/g, '·')
            .replace(/\\ast/g, '∗')
            .replace(/\\star/g, '⋆')
            .replace(/\\circ/g, '∘')
            .replace(/\\bullet/g, '•')
            .replace(/\\diamond/g, '◇')
            .replace(/\\nabla/g, '∇')
            .replace(/\\partial/g, '∂')
            .replace(/\\infty/g, '∞')
            .replace(/\\aleph/g, 'ℵ')
            .replace(/\\beth/g, 'ℶ')
            .replace(/\\gimel/g, 'ℷ')
            .replace(/\\daleth/g, 'ℸ')
            .replace(/\\prime/g, '′')
            .replace(/\\doubleprime/g, '″')
            .replace(/\\tripleprime/g, '‴')
            .replace(/\\backprime/g, '‵')
            .replace(/\\vec\s*{(.+?)}/g, '$1→')
            .replace(/\\overline\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\underline\s*{(.+?)}/g, '<span style="text-decoration: underline;">$1</span>')
            .replace(/\\widehat\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\widetilde\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\overline\s*{(.+?)}/g, '<span style="text-decoration: overline;">$1</span>')
            .replace(/\\underline\s*{(.+?)}/g, '<span style="text-decoration: underline;">$1</span>')
            .replace(/\\bold\s*{(.+?)}/g, '<strong>$1</strong>')
            .replace(/\\mathbf\s*{(.+?)}/g, '<strong>$1</strong>')
            .replace(/\\mathit\s*{(.+?)}/g, '<em>$1</em>')
            .replace(/\\mathbb\s*{(.+?)}/g, '$1')
            .replace(/\\mathcal\s*{(.+?)}/g, '$1')
            .replace(/\\mathscr\s*{(.+?)}/g, '$1')
            .replace(/\\mathfrak\s*{(.+?)}/g, '$1')
            .replace(/\\mathsf\s*{(.+?)}/g, '$1')
            .replace(/\\mathtt\s*{(.+?)}/g, '$1')
            .replace(/\\mathrm\s*{(.+?)}/g, '$1')
            .replace(/\\text\s*{(.+?)}/g, '$1');
        
        result = result.replace(
            `{{${math.id}}}`,
            `<div class="math-block" style="background: #f8fafc; padding: 12px; margin: 8px 0; border-radius: 6px; font-family: 'Cambria Math', 'Times New Roman', serif; font-size: 16px; line-height: 1.5;">${processedMath}</div>`
        );
    });
    
    // 19. 恢复行内代码
    inlineCodes.forEach(code => {
        result = result.replace(
            `{{${code.id}}}`,
            `<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace; font-size: 13px; color: #374151;">${code.content}</code>`
        );
    });
    
    // 20. 恢复代码块
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
                    <button style="background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;" onclick="window.copyCodeBlock(this)">复制代码</button>
                </div>
                <pre style="background: #0f172a; color: #e2e8f0; padding: 16px; margin: 0; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.4;"><code>${escapedContent}</code></pre>
            </div>`
        );
    });
    
    // 21. 处理段落
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

/**
 * 复制代码块函数
 * @param {HTMLElement} button - 触发复制的按钮元素
 */
function copyCodeBlock(button) {
    console.log('copyCodeBlock函数被调用');
    const codeBlock = button.parentElement.nextElementSibling;
    if (codeBlock) {
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
}

// 确保在全局作用域中定义函数
if (typeof window !== 'undefined') {
    window.parseMarkdown = parseMarkdown;
    window.copyCodeBlock = copyCodeBlock;
}

// 导出模块（如果在CommonJS环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseMarkdown,
        copyCodeBlock
    };
}

console.log('markdown.js 加载完成');