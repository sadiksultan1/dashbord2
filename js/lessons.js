// Lessons page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize course data
    const courseData = {
        'ml': {
            title: 'Machine Learning Fundamentals',
            description: 'Master the core concepts of machine learning with hands-on projects and real-world applications. Learn supervised and unsupervised learning, feature engineering, model evaluation, and deployment strategies.',
            instructor: 'Dr. Sarah Chen',
            instructorBio: 'PhD in Computer Science, 10+ years in ML research',
            curriculum: [
                'Introduction to Machine Learning',
                'Data Preprocessing and Feature Engineering',
                'Supervised Learning Algorithms',
                'Unsupervised Learning Techniques',
                'Model Evaluation and Validation',
                'Ensemble Methods and Advanced Techniques',
                'ML Pipeline and Deployment',
                'Capstone Project'
            ],
            duration: '8 weeks',
            students: 1234,
            rating: 4.8,
            price: 99
        },
        'dl': {
            title: 'Deep Learning Mastery',
            description: 'Dive deep into neural networks, CNNs, RNNs, and cutting-edge architectures. Build and deploy sophisticated deep learning models for computer vision and natural language processing.',
            instructor: 'Prof. Michael Rodriguez',
            instructorBio: 'Former Google AI researcher, Deep Learning expert',
            curriculum: [
                'Neural Network Fundamentals',
                'Convolutional Neural Networks',
                'Recurrent Neural Networks',
                'Transformer Architecture',
                'Generative Adversarial Networks',
                'Transfer Learning and Fine-tuning',
                'Model Optimization and Deployment',
                'Advanced Projects'
            ],
            duration: '12 weeks',
            students: 856,
            rating: 4.9,
            price: 149
        },
        'nlp': {
            title: 'Natural Language Processing',
            description: 'Build AI systems that understand and generate human language. Master modern NLP techniques including transformers, BERT, GPT, and create chatbots and language models.',
            instructor: 'Dr. Emily Watson',
            instructorBio: 'NLP Research Scientist, Published author',
            curriculum: [
                'Text Preprocessing and Tokenization',
                'Word Embeddings and Representations',
                'Sequence-to-Sequence Models',
                'Attention Mechanisms and Transformers',
                'BERT and Pre-trained Models',
                'Text Generation and GPT',
                'Sentiment Analysis and Classification',
                'Chatbot Development'
            ],
            duration: '10 weeks',
            students: 642,
            rating: 4.7,
            price: 129
        },
        'cv': {
            title: 'Computer Vision',
            description: 'Master image recognition, object detection, and visual AI applications. Learn to build systems that can see and understand visual content using state-of-the-art techniques.',
            instructor: 'Dr. James Park',
            instructorBio: 'Computer Vision expert, Former Tesla AI team',
            curriculum: [
                'Image Processing Fundamentals',
                'Feature Detection and Extraction',
                'Object Detection and Recognition',
                'Semantic Segmentation',
                'Face Recognition and Biometrics',
                'Video Analysis and Tracking',
                'Generative Models for Images',
                'Real-world Applications'
            ],
            duration: '14 weeks',
            students: 423,
            rating: 4.8,
            price: 179
        },
        'ethics': {
            title: 'AI Ethics and Bias',
            description: 'Understand the ethical implications of AI systems. Learn to identify and mitigate bias, ensure fairness, and develop responsible AI solutions that benefit society.',
            instructor: 'Dr. Aisha Patel',
            instructorBio: 'AI Ethics researcher, Policy advisor',
            curriculum: [
                'Introduction to AI Ethics',
                'Bias Detection and Mitigation',
                'Fairness in Machine Learning',
                'Privacy and Data Protection',
                'Algorithmic Accountability',
                'AI Governance and Policy',
                'Case Studies and Best Practices',
                'Ethical AI Framework Development'
            ],
            duration: '6 weeks',
            students: 789,
            rating: 4.6,
            price: 79
        },
        'rl': {
            title: 'Reinforcement Learning',
            description: 'Train intelligent agents to make optimal decisions through trial and error. Master Q-learning, policy gradients, and advanced RL algorithms for game AI and robotics.',
            instructor: 'Dr. Alex Thompson',
            instructorBio: 'RL researcher, Former DeepMind scientist',
            curriculum: [
                'Markov Decision Processes',
                'Dynamic Programming',
                'Monte Carlo Methods',
                'Temporal Difference Learning',
                'Q-Learning and Deep Q-Networks',
                'Policy Gradient Methods',
                'Actor-Critic Algorithms',
                'Multi-Agent Reinforcement Learning'
            ],
            duration: '16 weeks',
            students: 312,
            rating: 4.9,
            price: 199
        }
    };

    // Search functionality
    const searchInput = document.getElementById('course-search');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Reset to show all courses
            courseCards.forEach(card => {
                card.classList.remove('hidden', 'search-highlight');
                card.classList.add('show');
            });
            return;
        }
        
        courseCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const category = card.getAttribute('data-category').toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
                card.classList.remove('hidden');
                card.classList.add('show', 'search-highlight');
                
                // Remove highlight after animation
                setTimeout(() => {
                    card.classList.remove('search-highlight');
                }, 3000);
            } else {
                card.classList.add('hidden');
                card.classList.remove('show', 'search-highlight');
            }
        });
        
        // Update filter buttons
        filterBtns.forEach(btn => btn.classList.remove('active'));
    }
    
    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter functionality with enhanced animations
    const filterBtns = document.querySelectorAll('.filter-btn');
    const courseCards = document.querySelectorAll('.course-card');
    let currentFilter = 'all';

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            if (category === currentFilter) return;
            
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            currentFilter = category;
            filterCourses(category);
        });
    });

    function filterCourses(category) {
        courseCards.forEach((card, index) => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                // Show card with staggered animation
                setTimeout(() => {
                    card.classList.remove('hidden', 'filtering-out');
                    card.classList.add('show');
                }, index * 100);
            } else {
                // Hide card with animation
                card.classList.add('filtering-out');
                setTimeout(() => {
                    card.classList.add('hidden');
                    card.classList.remove('show', 'filtering-out');
                }, 400);
            }
        });
    }

    // Course preview modal functionality
    function createPreviewModal() {
        const modal = document.createElement('div');
        modal.className = 'course-preview-modal';
        modal.innerHTML = `
            <div class="course-preview-content">
                <div class="course-preview-header">
                    <span class="course-preview-close">&times;</span>
                    <div class="course-preview-title"></div>
                </div>
                <div class="course-preview-body">
                    <div class="course-preview-description"></div>
                    <div class="course-instructor">
                        <div class="instructor-avatar"></div>
                        <div class="instructor-info">
                            <h5 class="instructor-name"></h5>
                            <p class="instructor-bio"></p>
                        </div>
                    </div>
                    <div class="course-curriculum">
                        <h4>Course Curriculum</h4>
                        <div class="curriculum-list"></div>
                    </div>
                    <div class="course-preview-actions">
                        <button class="preview-enroll-btn">Enroll Now</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    const previewModal = createPreviewModal();
    
    // Add preview functionality to course cards
    courseCards.forEach(card => {
        const courseId = card.getAttribute('data-course');
        const viewBtn = card.querySelector('.view-course-btn');
        
        // Add preview button
        const previewBtn = document.createElement('button');
        previewBtn.className = 'preview-btn';
        previewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
        previewBtn.style.cssText = `
            position: absolute;
            top: 15px;
            left: 15px;
            background: rgba(255, 215, 0, 0.9);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 3;
        `;
        
        card.querySelector('.course-image').appendChild(previewBtn);
        
        // Show preview button on hover
        card.addEventListener('mouseenter', () => {
            previewBtn.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            previewBtn.style.opacity = '0';
        });
        
        // Preview button click handler
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showCoursePreview(courseId);
        });
        
        // Also add preview to view course button
        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCoursePreview(courseId);
        });
    });

    function showCoursePreview(courseId) {
        const course = courseData[courseId];
        if (!course) return;
        
        // Populate modal content
        previewModal.querySelector('.course-preview-title').textContent = course.title;
        previewModal.querySelector('.course-preview-description').textContent = course.description;
        previewModal.querySelector('.instructor-name').textContent = course.instructor;
        previewModal.querySelector('.instructor-bio').textContent = course.instructorBio;
        previewModal.querySelector('.instructor-avatar').textContent = course.instructor.charAt(0);
        
        // Populate curriculum
        const curriculumList = previewModal.querySelector('.curriculum-list');
        curriculumList.innerHTML = course.curriculum.map((item, index) => `
            <div class="curriculum-item">
                <i class="fas fa-play-circle"></i>
                <span>${index + 1}. ${item}</span>
            </div>
        `).join('');
        
        // Show modal
        previewModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add enrollment functionality
        const enrollBtn = previewModal.querySelector('.preview-enroll-btn');
        enrollBtn.onclick = () => {
            if (window.authManager && !window.authManager.isAuthenticated()) {
                window.showToast('Please sign in to enroll in courses', 'warning');
                previewModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                document.getElementById('sign-in-btn').click();
                return;
            }
            
            // Add to cart
            const courseCard = document.querySelector(`[data-course="${courseId}"]`);
            const addToCartBtn = courseCard.querySelector('.add-to-cart');
            addToCartBtn.click();
            
            previewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    // Close modal functionality
    previewModal.querySelector('.course-preview-close').addEventListener('click', () => {
        previewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Enhanced learning path functionality
    const pathBtns = document.querySelectorAll('.path-btn');
    
    pathBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const pathName = btn.parentElement.querySelector('h3').textContent;
            
            if (window.authManager && !window.authManager.isAuthenticated()) {
                window.showToast('Please sign in to enroll in learning paths', 'warning');
                document.getElementById('sign-in-btn').click();
                return;
            }
            
            // Add loading state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding to Cart...';
            btn.disabled = true;
            
            setTimeout(() => {
                // Add path courses to cart
                const pathCourses = getPathCourses(index);
                pathCourses.forEach(course => {
                    window.cartManager.addToCart(course);
                });
                
                btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
                btn.style.background = 'linear-gradient(45deg, #00b894, #00a085)';
                
                setTimeout(() => {
                    btn.innerHTML = 'Start Path';
                    btn.disabled = false;
                    btn.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
                }, 2000);
                
                window.showToast(`${pathName} added to cart!`, 'success');
            }, 1000);
        });
    });

    function getPathCourses(pathIndex) {
        const paths = [
            // Beginner Path
            [
                { id: 'ai-ethics-course', name: 'AI Ethics Course', price: 79, image: 'images/ethics-course.jpg' },
                { id: 'machine-learning-course', name: 'Machine Learning Course', price: 99, image: 'images/ml-course.jpg' }
            ],
            // Professional Path
            [
                { id: 'machine-learning-course', name: 'Machine Learning Course', price: 99, image: 'images/ml-course.jpg' },
                { id: 'deep-learning-course', name: 'Deep Learning Course', price: 149, image: 'images/dl-course.jpg' },
                { id: 'nlp-course', name: 'NLP Course', price: 129, image: 'images/nlp-course.jpg' }
            ],
            // Expert Path
            [
                { id: 'machine-learning-course', name: 'Machine Learning Course', price: 99, image: 'images/ml-course.jpg' },
                { id: 'deep-learning-course', name: 'Deep Learning Course', price: 149, image: 'images/dl-course.jpg' },
                { id: 'nlp-course', name: 'NLP Course', price: 129, image: 'images/nlp-course.jpg' },
                { id: 'computer-vision-course', name: 'Computer Vision Course', price: 179, image: 'images/cv-course.jpg' },
                { id: 'reinforcement-learning-course', name: 'Reinforcement Learning Course', price: 199, image: 'images/rl-course.jpg' }
            ]
        ];
        
        return paths[pathIndex] || [];
    }

    // Enhanced course card interactions
    courseCards.forEach(card => {
        // Add wishlist functionality
        const wishlistBtn = document.createElement('button');
        wishlistBtn.className = 'wishlist-btn';
        wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
        card.querySelector('.course-image').appendChild(wishlistBtn);
        
        wishlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wishlistBtn.classList.toggle('active');
            
            if (wishlistBtn.classList.contains('active')) {
                window.showToast('Added to wishlist!', 'success');
                wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                window.showToast('Removed from wishlist', 'info');
                wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
            }
        });
        
        // Enhanced hover effects
        let hoverTimeout;
        
        card.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            card.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                card.style.transform = 'translateY(0) scale(1)';
            }, 100);
        });
    });

    // Search integration with highlighting
    if (window.location.hash) {
        const searchTerm = decodeURIComponent(window.location.hash.substring(1));
        highlightSearchResults(searchTerm);
    }

    function highlightSearchResults(term) {
        courseCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(term.toLowerCase()) || description.includes(term.toLowerCase())) {
                card.classList.add('search-highlight');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remove highlight after animation
                setTimeout(() => {
                    card.classList.remove('search-highlight');
                }, 6000);
            }
        });
    }

    // Course progress tracking (for logged-in users)
    function trackCourseProgress() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            loadUserProgress();
        }
    }

    async function loadUserProgress() {
        try {
            const user = window.authManager.getCurrentUser();
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (doc.exists && doc.data().enrolledCourses) {
                const enrolledCourses = doc.data().enrolledCourses;
                
                courseCards.forEach(card => {
                    const courseId = card.getAttribute('data-course');
                    const enrolled = enrolledCourses.find(course => course.id === courseId);
                    
                    if (enrolled) {
                        addProgressIndicator(card, enrolled.progress || 0);
                        card.classList.add('course-enrolled');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    function addProgressIndicator(card, progress) {
        const progressBar = document.createElement('div');
        progressBar.className = 'course-progress';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${progress}% Complete</span>
        `;
        
        const courseInfo = card.querySelector('.course-info');
        courseInfo.insertBefore(progressBar, courseInfo.querySelector('.course-actions'));
    }

    // Initialize progress tracking
    trackCourseProgress();
    
    // Listen for auth state changes to update progress
    if (window.auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setTimeout(trackCourseProgress, 1000);
            }
        });
    }

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    // Observe course cards and path cards
    courseCards.forEach(card => observer.observe(card));
    document.querySelectorAll('.path-card').forEach(card => observer.observe(card));

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewModal.style.display === 'block') {
            previewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Performance optimization: Lazy load course images
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('.course-image img').forEach(img => {
        if (img.src.includes('data:image/svg+xml')) {
            imageObserver.observe(img);
        }
    });
});