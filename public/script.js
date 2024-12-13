// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();
    new ChatUI();
    new ProfileModal();
    
    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// 汉堡菜单功能
document.querySelector('.hamburger').addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('.nav-links').classList.toggle('active');
});

class ChatUI {
    constructor() {
        this.chatHistory = document.getElementById('chatHistory');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
        this.toggleThemeButton = document.getElementById('toggleTheme');
        this.isDarkMode = false;
        this.messages = []; // 存储对话历史
        
        this.setupEventListeners();
        this.adjustTextareaHeight();
    }
    
    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => this.adjustTextareaHeight());
        
        // 工具栏功能
        document.getElementById('clearChat').addEventListener('click', () => this.clearChat());
        document.getElementById('exportChat').addEventListener('click', () => this.exportChat());
        
        // 添加主题切换功能
        this.toggleThemeButton.addEventListener('click', () => this.toggleTheme());
        
        // 添加设置保存事件
        document.getElementById('saveSettings')?.addEventListener('click', () => {
            const apiKey = document.getElementById('apiKey').value;
            if (apiKey) {
                this.apiKey = apiKey;
                localStorage.setItem('openai_api_key', apiKey);
                alert('设置已保存');
                // 关闭模态框
                const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
                modal.hide();
            }
        });
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        const chatContainer = document.querySelector('.chat-container');
        
        if (this.isDarkMode) {
            chatContainer.style.background = '#1a1a1a';
            chatContainer.style.color = '#fff';
            this.messageInput.style.background = '#2d2d2d';
            this.messageInput.style.color = '#fff';
            this.messageInput.style.borderColor = '#404040';
        } else {
            chatContainer.style.background = '#fff';
            chatContainer.style.color = '#212529';
            this.messageInput.style.background = '#fff';
            this.messageInput.style.color = '#212529';
            this.messageInput.style.borderColor = '#dee2e6';
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        if (!this.apiKey) {
            alert('请先在设置中配置OpenAI API Key');
            return;
        }
        
        // 添加用户消息
        this.addMessage(message, 'user');
        this.messages.push({ role: 'user', content: message });
        this.messageInput.value = '';
        this.adjustTextareaHeight();
        
        // 显示输入状态
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai typing';
        typingIndicator.innerHTML = '<div class="message-content">AI正在思考...</div>';
        this.chatHistory.appendChild(typingIndicator);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
        
        try {
            const response = await this.callOpenAI(message);
            
            // 移除输入状态指示器
            this.chatHistory.removeChild(typingIndicator);
            
            // 添加AI回复
            if (response) {
                this.addMessage(response, 'ai');
                this.messages.push({ role: 'assistant', content: response });
            }
        } catch (error) {
            console.error('Error:', error);
            this.chatHistory.removeChild(typingIndicator);
            this.addMessage('抱歉，发生了一些错误：' + error.message, 'ai');
        }
    }
    
    async callOpenAI(message) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: '你是一个有帮助的AI助手。' },
                        ...this.messages,
                        { role: 'user', content: message }
                    ]
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '请求失败');
            }
            
            const data = await response.json();
            return data.choices[0]?.message?.content;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const time = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${time}</div>
        `;
        
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
    
    adjustTextareaHeight() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    clearChat() {
        if (confirm('确定要清空所有对话吗？')) {
            this.chatHistory.innerHTML = '';
        }
    }
    
    exportChat() {
        const messages = Array.from(this.chatHistory.children).map(msg => {
            const content = msg.querySelector('.message-content').textContent;
            const time = msg.querySelector('.message-time').textContent;
            const type = msg.classList.contains('user') ? '用户' : 'AI';
            return `[${time}] ${type}: ${content}`;
        }).join('\n');
        
        const blob = new Blob([messages], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat-history.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
}

class ImageSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.slider-dot');
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        // 显示第一张图片
        this.slides[0].classList.add('active');
        
        // 添加点击事件到导航点
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // 开始自动播放
        this.startAutoPlay();
    }
    
    goToSlide(index) {
        // 移除当前活动状态
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        
        // 更新当前索引
        this.currentSlide = index;
        
        // 添加新的活动状态
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }
    
    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(next);
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }
}

// 添加照片轮播弹窗功能
class ProfileModal {
    constructor() {
        this.currentSlide = 0;
        this.modal = document.getElementById('profileModal');
        this.slides = document.querySelectorAll('.modal-slide');
        this.dots = document.querySelectorAll('.modal-dot');
        this.prevBtn = document.querySelector('.modal-prev');
        this.nextBtn = document.querySelector('.modal-next');
        this.closeBtn = document.querySelector('.close-modal');
        
        this.init();
    }
    
    init() {
        // 点击头像打开弹窗
        const profileImage = document.getElementById('profileImage');
        profileImage.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openModal();
        });

        // 关闭按钮事件
        this.closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeModal();
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // 点击背景关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // 切换按钮事件
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextSlide();
        });

        // 导航点事件
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goToSlide(index);
            });
        });

        // 显示第一张图片
        this.goToSlide(0);
    }

    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    goToSlide(index) {
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        
        this.currentSlide = index;
        
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }
    
    prevSlide() {
        const index = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(index);
    }
    
    nextSlide() {
        const index = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(index);
    }
} 