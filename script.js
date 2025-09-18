function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

// Carousel/Slideshow Functionality
class Carousel {
    constructor(container) {
        this.container = container;
        this.wrapper = container.querySelector('.carousel-wrapper');
        this.slides = container.querySelectorAll('.carousel-slide');
        this.prevBtn = container.querySelector('.carousel-prev');
        this.nextBtn = container.querySelector('.carousel-next');
        this.dots = container.querySelectorAll('.carousel-dot');
        this.progressBar = container.querySelector('.carousel-progress-bar');
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.slidesPerView = this.getSlidesPerView();
        this.maxSlides = Math.max(0, this.totalSlides - this.slidesPerView);
        this.autoplayInterval = null;
        this.autoplayDuration = 4000; // 4 seconds
        this.progressInterval = null;
        
        this.init();
    }
    
    init() {
        this.updateButtons();
        this.updateDots();
        this.addEventListeners();
        this.startAutoplay();
        this.addTouchSupport();
        
        // Update on window resize
        window.addEventListener('resize', () => {
            this.slidesPerView = this.getSlidesPerView();
            this.maxSlides = Math.max(0, this.totalSlides - this.slidesPerView);
            
            // Ensure current slide doesn't exceed new max
            if (this.currentSlide > this.maxSlides) {
                this.currentSlide = this.maxSlides;
            }
            
            this.updateSlidePosition();
            this.updateDots();
        });
    }
    
    getSlidesPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    }
    
    addEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause autoplay on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    addTouchSupport() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.container.classList.add('dragging');
            this.stopAutoplay();
        });
        
        this.container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            // Optional: Add visual feedback during drag
            if (Math.abs(diffX) > 30) {
                e.preventDefault();
            }
        });
        
        this.container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const diffX = startX - currentX;
            const threshold = 50;
            
            if (diffX > threshold) {
                this.nextSlide();
            } else if (diffX < -threshold) {
                this.prevSlide();
            }
            
            isDragging = false;
            this.container.classList.remove('dragging');
            this.startAutoplay();
        });
        
        // Mouse drag support for desktop
        this.container.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            this.container.classList.add('dragging');
            this.stopAutoplay();
            e.preventDefault();
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
        });
        
        this.container.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            const diffX = startX - currentX;
            const threshold = 50;
            
            if (diffX > threshold) {
                this.nextSlide();
            } else if (diffX < -threshold) {
                this.prevSlide();
            }
            
            isDragging = false;
            this.container.classList.remove('dragging');
            this.startAutoplay();
        });
        
        this.container.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                this.container.classList.remove('dragging');
                this.startAutoplay();
            }
        });
    }
    
    nextSlide() {
        if (this.currentSlide < this.maxSlides) {
            this.currentSlide++;
        } else {
            this.currentSlide = 0;
        }
        this.updateSlidePosition();
        this.updateButtons();
        this.updateDots();
    }
    
    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
        } else {
            // When at first slide, go to the last possible slide
            this.currentSlide = this.maxSlides;
        }
        this.updateSlidePosition();
        this.updateButtons();
        this.updateDots();
    }
    
    goToSlide(index) {
        this.currentSlide = Math.min(index, this.maxSlides);
        this.updateSlidePosition();
        this.updateButtons();
        this.updateDots();
    }
    
    updateSlidePosition() {
        const slideWidth = 100 / this.slidesPerView;
        const translateX = -this.currentSlide * slideWidth;
        this.wrapper.style.transform = `translateX(${translateX}%)`;
    }
    
    updateButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = false; // Always allow cycling
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = false; // Always allow cycling
        }
    }
    
    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    startAutoplay() {
        this.stopAutoplay();
        
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDuration);
        
        // Progress bar animation
        this.startProgress();
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
        this.stopProgress();
    }
    
    startProgress() {
        this.stopProgress();
        
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
            
            let progress = 0;
            const increment = 100 / (this.autoplayDuration / 50);
            
            this.progressInterval = setInterval(() => {
                progress += increment;
                this.progressBar.style.width = `${Math.min(progress, 100)}%`;
                
                if (progress >= 100) {
                    this.stopProgress();
                }
            }, 50);
        }
    }
    
    stopProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
    }
}

// Initialize carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousels();
});

function initializeCarousels() {
    // Check about containers
    const aboutContainers = document.querySelector('#about .about-containers');
    if (aboutContainers && aboutContainers.children.length > 2) {
        convertToCarousel(aboutContainers, 'about-carousel');
    }
    
    // Check certifications containers
    const certificationsContainers = document.querySelector('#certifications .about-containers');
    if (certificationsContainers && certificationsContainers.children.length > 3) {
        convertToCarousel(certificationsContainers, 'certifications-carousel');
    }
    
    // Check experience articles
    const articleContainers = document.querySelectorAll('.article-container');
    articleContainers.forEach((container, index) => {
        if (container.children.length > 3) {
            convertToCarousel(container, `experience-carousel-${index}`);
        }
    });
    
    // Check experience cards in about section (work experience)
    const aboutExperienceContainer = document.querySelector('#about .about-containers');
    if (aboutExperienceContainer && aboutExperienceContainer.children.length > 3) {
        convertToCarousel(aboutExperienceContainer, 'about-experience-carousel');
    }
    
    // Check projects section - specifically look for projects
    const projectsSection = document.querySelector('#projects .about-containers');
    if (projectsSection && projectsSection.children.length >= 3) {
        convertToCarousel(projectsSection, 'projects-carousel');
    }
}

function convertToCarousel(container, id) {
    const items = Array.from(container.children);
    
    // Create carousel structure
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    carouselContainer.id = id;
    
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'carousel-wrapper';
    
    // Wrap each item in a slide
    items.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.appendChild(item);
        carouselWrapper.appendChild(slide);
    });
    
    // Create navigation
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn carousel-prev';
    prevBtn.innerHTML = '‹';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn carousel-next';
    nextBtn.innerHTML = '›';
    nextBtn.setAttribute('aria-label', 'Next slide');
    
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    
    // Create dots
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    
    // Calculate max slides based on current viewport
    const getSlidesPerView = () => {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    };
    
    const slidesPerView = getSlidesPerView();
    const maxSlides = Math.max(0, items.length - slidesPerView);
    
    // Create dots for each possible starting position
    for (let i = 0; i <= maxSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dots.appendChild(dot);
    }
    
    // Create progress bar
    const progress = document.createElement('div');
    progress.className = 'carousel-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'carousel-progress-bar';
    progress.appendChild(progressBar);
    
    // Assemble carousel
    carouselContainer.appendChild(carouselWrapper);
    carouselContainer.appendChild(nav);
    carouselContainer.appendChild(dots);
    carouselContainer.appendChild(progress);
    
    // Replace original container
    container.parentNode.replaceChild(carouselContainer, container);
    
    // Initialize carousel functionality
    new Carousel(carouselContainer);
}

// Contact Section Enhancements
document.addEventListener('DOMContentLoaded', function() {
    initContactSection();
});

function initContactSection() {
    const contactContainers = document.querySelectorAll('.contact-info-container');
    
    contactContainers.forEach(container => {
        // Add simple copy-to-clipboard functionality
        const link = container.querySelector('a[href^="mailto:"], a[href^="tel:"]');
        if (link) {
            container.addEventListener('click', () => {
                const text = link.textContent.trim();
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(() => {
                        showCopyFeedback(container);
                    });
                }
            });
        }
    });
}

function showCopyFeedback(container) {
    const feedback = document.createElement('div');
    feedback.textContent = 'Copied!';
    feedback.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1000;
    `;
    
    container.style.position = 'relative';
    container.appendChild(feedback);
    
    setTimeout(() => feedback.style.opacity = '1', 10);
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}
