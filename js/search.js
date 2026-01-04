// Search functionality
class SearchManager {
    constructor() {
        this.searchData = [
            {
                title: "Machine Learning Fundamentals",
                description: "Learn the basics of ML algorithms, supervised and unsupervised learning.",
                url: "lesson-ml.html",
                category: "course"
            },
            {
                title: "Deep Learning Mastery",
                description: "Advanced neural networks, CNNs, RNNs, and transformer architectures.",
                url: "lesson-dl.html",
                category: "course"
            },
            {
                title: "Natural Language Processing",
                description: "Build AI systems that understand and generate human language.",
                url: "lesson-nlp.html",
                category: "course"
            },
            {
                title: "Computer Vision",
                description: "Image recognition, object detection, and visual AI applications.",
                url: "lesson-cv.html",
                category: "course"
            },
            {
                title: "AI Ethics and Bias",
                description: "Understanding ethical implications and bias in AI systems.",
                url: "lesson-ethics.html",
                category: "course"
            },
            {
                title: "Reinforcement Learning",
                description: "Train agents to make decisions through trial and error.",
                url: "lesson-rl.html",
                category: "course"
            },
            {
                title: "AI Certification Program",
                description: "Complete certification program for AI professionals.",
                url: "products.html#certification",
                category: "product"
            },
            {
                title: "Premium AI Toolkit",
                description: "Advanced tools and resources for AI development.",
                url: "products.html#toolkit",
                category: "product"
            },
            {
                title: "1-on-1 AI Mentoring",
                description: "Personal mentoring sessions with AI experts.",
                url: "products.html#mentoring",
                category: "service"
            },
            {
                title: "AI Project Portfolio",
                description: "Build a comprehensive portfolio of AI projects.",
                url: "products.html#portfolio",
                category: "service"
            },
            {
                title: "Contact Support",
                description: "Get help with courses, technical issues, or general inquiries.",
                url: "contact.html",
                category: "support"
            },
            {
                title: "About TARG STAR",
                description: "Learn about our mission to advance AI education.",
                url: "about.html",
                category: "info"
            }
        ];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const searchResults = document.getElementById('search-results');

        // Search on input
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.performSearch(query);
            } else {
                this.hideResults();
            }
        });

        // Search on button click
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                this.performSearch(query);
            }
        });

        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    this.performSearch(query);
                }
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-section')) {
                this.hideResults();
            }
        });
    }

    performSearch(query) {
        const results = this.searchData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-title">No results found</div>
                    <div class="search-result-description">
                        No results found for "${query}". Try different keywords or browse our courses.
                    </div>
                </div>
            `;
        } else {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="window.location.href='${result.url}'">
                    <div class="search-result-title">${this.highlightText(result.title, query)}</div>
                    <div class="search-result-description">
                        ${this.highlightText(result.description, query)}
                    </div>
                    <div class="search-result-category">${this.getCategoryIcon(result.category)} ${result.category}</div>
                </div>
            `).join('');
        }

        searchResults.style.display = 'block';
    }

    hideResults() {
        const searchResults = document.getElementById('search-results');
        searchResults.style.display = 'none';
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: #FFD700; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }

    getCategoryIcon(category) {
        const icons = {
            'course': '<i class="fas fa-graduation-cap"></i>',
            'product': '<i class="fas fa-box"></i>',
            'service': '<i class="fas fa-handshake"></i>',
            'support': '<i class="fas fa-life-ring"></i>',
            'info': '<i class="fas fa-info-circle"></i>'
        };
        return icons[category] || '<i class="fas fa-file"></i>';
    }

    // Advanced search with filters
    advancedSearch(query, filters = {}) {
        let results = this.searchData;

        // Apply text search
        if (query) {
            results = results.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Apply category filter
        if (filters.category) {
            results = results.filter(item => item.category === filters.category);
        }

        return results;
    }

    // Get search suggestions
    getSuggestions(query) {
        if (!query || query.length < 2) return [];

        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Add exact matches first
        this.searchData.forEach(item => {
            if (item.title.toLowerCase().includes(queryLower)) {
                suggestions.push(item.title);
            }
        });

        // Add partial matches
        const keywords = ['machine learning', 'deep learning', 'neural networks', 'AI', 'artificial intelligence', 
                         'computer vision', 'NLP', 'natural language processing', 'reinforcement learning', 
                         'ethics', 'certification', 'mentoring', 'portfolio'];

        keywords.forEach(keyword => {
            if (keyword.toLowerCase().includes(queryLower) && !suggestions.includes(keyword)) {
                suggestions.push(keyword);
            }
        });

        return suggestions.slice(0, 5); // Return top 5 suggestions
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});