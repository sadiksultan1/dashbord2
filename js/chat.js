// AI Chat functionality
class ChatManager {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.setupEventListeners();
        this.initializeChat();
    }

    setupEventListeners() {
        const chatBtn = document.getElementById('ai-chat-btn');
        const chatModal = document.getElementById('chat-modal');
        const closeBtn = chatModal.querySelector('.close');
        const sendBtn = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input-field');

        // Open chat
        chatBtn.addEventListener('click', () => {
            this.openChat();
        });

        // Close chat
        closeBtn.addEventListener('click', () => {
            this.closeChat();
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === chatModal) {
                this.closeChat();
            }
        });

        // Send message
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send on Enter
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    initializeChat() {
        // Add welcome message
        this.messages = [{
            type: 'bot',
            content: 'Hello! I\'m your AI learning assistant. I can help you with:\n\n• Course recommendations\n• AI concepts and explanations\n• Learning path guidance\n• Technical questions\n• Career advice in AI\n\nWhat would you like to know?',
            timestamp: new Date()
        }];
    }

    openChat() {
        const chatModal = document.getElementById('chat-modal');
        chatModal.style.display = 'block';
        this.isOpen = true;
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chat-input-field').focus();
        }, 100);
    }

    closeChat() {
        const chatModal = document.getElementById('chat-modal');
        chatModal.style.display = 'none';
        this.isOpen = false;
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input-field');
        const message = chatInput.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response (replace with actual AI API call)
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(message);
            this.addMessage('bot', response);
        }, 1000 + Math.random() * 2000);
    }

    addMessage(type, content) {
        const message = {
            type,
            content,
            timestamp: new Date()
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.type === 'bot' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = this.formatMessage(message.content);

        if (message.type === 'user') {
            messageDiv.appendChild(content);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
        }

        messagesContainer.appendChild(messageDiv);
    }

    formatMessage(content) {
        // Convert line breaks to HTML
        content = content.replace(/\n/g, '<br>');
        
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        
        // Convert **bold** to <strong>
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return content;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '🤖';

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(indicator);
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Course recommendations
        if (message.includes('course') || message.includes('recommend') || message.includes('learn')) {
            return `Based on your interest, I recommend starting with our **Machine Learning Fundamentals** course. It covers:\n\n• Supervised and unsupervised learning\n• Popular algorithms (linear regression, decision trees, etc.)\n• Hands-on projects with real datasets\n• Python programming for ML\n\nWould you like me to explain any specific ML concept or help you choose between our courses?`;
        }
        
        // Machine Learning questions
        if (message.includes('machine learning') || message.includes('ml')) {
            return `Machine Learning is a subset of AI that enables computers to learn and make decisions from data without being explicitly programmed. Key concepts include:\n\n• **Supervised Learning**: Learning from labeled examples\n• **Unsupervised Learning**: Finding patterns in unlabeled data\n• **Reinforcement Learning**: Learning through trial and error\n\nWhich aspect would you like to explore further?`;
        }
        
        // Deep Learning questions
        if (message.includes('deep learning') || message.includes('neural network')) {
            return `Deep Learning uses artificial neural networks with multiple layers to model complex patterns. Key topics include:\n\n• **Neural Networks**: Basic building blocks\n• **CNNs**: For image recognition\n• **RNNs**: For sequential data\n• **Transformers**: For language processing\n\nOur Deep Learning Mastery course covers all these topics with practical projects!`;
        }
        
        // Career advice
        if (message.includes('career') || message.includes('job') || message.includes('work')) {
            return `AI careers are booming! Popular roles include:\n\n• **Machine Learning Engineer**: Build and deploy ML models\n• **Data Scientist**: Extract insights from data\n• **AI Research Scientist**: Develop new AI techniques\n• **AI Product Manager**: Guide AI product development\n\nOur certification program can help you prepare for these roles. What specific area interests you most?`;
        }
        
        // Pricing questions
        if (message.includes('price') || message.includes('cost') || message.includes('payment')) {
            return `Our courses are competitively priced:\n\n• **Machine Learning Fundamentals**: $99\n• **Deep Learning Mastery**: $149\n• **NLP Course**: $129\n• **Complete AI Certification**: $299\n\nWe offer multiple payment options including PayPal, bank transfer, and installment plans. Would you like to know more about any specific course?`;
        }
        
        // Technical questions
        if (message.includes('python') || message.includes('programming') || message.includes('code')) {
            return `Python is the most popular language for AI/ML development! Our courses include:\n\n• **Python fundamentals** for beginners\n• **NumPy & Pandas** for data manipulation\n• **Scikit-learn** for machine learning\n• **TensorFlow/PyTorch** for deep learning\n\nAll courses include hands-on coding exercises and projects. Do you have any programming experience?`;
        }
        
        // Greeting responses
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return `Hello! Great to meet you! 👋\n\nI'm here to help you navigate your AI learning journey. Whether you're a complete beginner or looking to advance your skills, I can help you:\n\n• Choose the right courses\n• Understand AI concepts\n• Plan your learning path\n• Answer technical questions\n\nWhat brings you to TARG STAR today?`;
        }
        
        // Default responses
        const defaultResponses = [
            `That's an interesting question! Let me help you with that. Could you provide a bit more context about what specific aspect of AI or our courses you'd like to know about?`,
            `I'd be happy to help! Are you looking for information about our courses, AI concepts, or career guidance? Let me know what interests you most.`,
            `Great question! To give you the most helpful answer, could you tell me more about your current experience level with AI or what you're hoping to achieve?`,
            `I'm here to help with all things AI education! Whether it's about our courses, learning paths, or technical concepts - what would you like to explore?`
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Method to clear chat history
    clearChat() {
        this.messages = [];
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        this.initializeChat();
        this.renderMessage(this.messages[0]);
    }

    // Method to export chat history
    exportChat() {
        const chatHistory = this.messages.map(msg => 
            `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${msg.content}`
        ).join('\n\n');
        
        const blob = new Blob([chatHistory], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'targ-star-chat-history.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});