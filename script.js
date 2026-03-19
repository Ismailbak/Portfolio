document.addEventListener('DOMContentLoaded', () => {
    // 1. Reveal Animations using Intersection Observer
    const revealElements = document.querySelectorAll('.details-container, .section__text, .section__pic-container, .title, .section__text__p1, article');
    
    revealElements.forEach((el, index) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(index % 5) * 0.1}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));

    // 2. Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const menuLinks = document.getElementById('menu-links');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if (hamburgerBtn && menuLinks) {
        hamburgerBtn.addEventListener('click', () => {
            menuLinks.classList.toggle('open');
            hamburgerBtn.classList.toggle('open');
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuLinks.classList.remove('open');
                hamburgerBtn.classList.remove('open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 3. Initialize Carousels
    initializeCarousels();

    // 4. Contact Copy to Clipboard Feedback
    const contactLinks = document.querySelectorAll('.contact-info-container a[href^="mailto:"], .contact-info-container a[href^="tel:"]');
    contactLinks.forEach(link => {
        link.parentElement.parentElement.addEventListener('click', (e) => {
            if(e.target.tagName !== 'A') {
                const text = link.textContent.trim();
                navigator.clipboard.writeText(text).then(() => {
                    const feedback = document.createElement('div');
                    feedback.textContent = 'Copied!';
                    feedback.style.cssText = 'position:absolute;top:-30px;left:50%;transform:translateX(-50%);background:var(--primary);color:white;padding:4px 12px;border-radius:12px;font-size:0.8rem;opacity:0;transition:opacity 0.3s ease;pointer-events:none;z-index:10;';
                    link.parentElement.parentElement.style.position = 'relative';
                    link.parentElement.parentElement.appendChild(feedback);
                    setTimeout(() => feedback.style.opacity = '1', 10);
                    setTimeout(() => {
                        feedback.style.opacity = '0';
                        setTimeout(() => feedback.remove(), 300);
                    }, 2000);
                });
            }
        });
    });
});

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
        this.autoplayDuration = 5000;
        this.progressInterval = null;
        
        this.init();
    }
    
    init() {
        this.updateDots();
        this.addEventListeners();
        this.startAutoplay();
        this.addTouchSupport();
        
        window.addEventListener('resize', () => {
            this.slidesPerView = this.getSlidesPerView();
            this.maxSlides = Math.max(0, this.totalSlides - this.slidesPerView);
            if (this.currentSlide > this.maxSlides) {
                this.currentSlide = this.maxSlides;
            }
            this.updateSlidePosition();
            this.updateDots();
        });
    }
    
    getSlidesPerView() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    }
    
    addEventListeners() {
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    addTouchSupport() {
        let startX = 0;
        let isDragging = false;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.stopAutoplay();
        }, {passive: true});
        
        this.container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const diffX = startX - e.changedTouches[0].clientX;
            if (diffX > 50) this.nextSlide();
            else if (diffX < -50) this.prevSlide();
            isDragging = false;
            this.startAutoplay();
        });
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide < this.maxSlides) ? this.currentSlide + 1 : 0;
        this.updateSlidePosition();
        this.updateDots();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide > 0) ? this.currentSlide - 1 : this.maxSlides;
        this.updateSlidePosition();
        this.updateDots();
    }
    
    goToSlide(index) {
        this.currentSlide = Math.min(index, this.maxSlides);
        this.updateSlidePosition();
        this.updateDots();
    }
    
    updateSlidePosition() {
        const slideWidth = 100 / this.slidesPerView;
        const translateX = -this.currentSlide * slideWidth;
        this.wrapper.style.transform = `translateX(${translateX}%)`;
    }
    
    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), this.autoplayDuration);
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
                if (progress >= 100) this.stopProgress();
            }, 50);
        }
    }
    
    stopProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        if (this.progressBar) this.progressBar.style.width = '0%';
    }
}

function initializeCarousels() {
    const containersToCheck = [
        document.querySelector('#about .about-containers'),
        document.querySelector('#certifications .about-containers'),
        document.querySelector('#research .about-containers'),
        document.querySelector('#projects .about-containers')
    ];

    containersToCheck.forEach((container, index) => {
        if (container && container.children.length > 2) {
            convertToCarousel(container, `carousel-${index}`);
        }
    });
}

function convertToCarousel(container, id) {
    const items = Array.from(container.children);
    
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    carouselContainer.id = id;
    
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'carousel-wrapper';
    
    items.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        item.style.transitionDelay = '0s'; // reset delay
        slide.appendChild(item);
        carouselWrapper.appendChild(slide);
    });
    
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
    
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    
    const getSlidesPerView = () => {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    };
    
    const maxSlides = Math.max(0, items.length - getSlidesPerView());
    
    for (let i = 0; i <= maxSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dots.appendChild(dot);
    }
    
    const progress = document.createElement('div');
    progress.className = 'carousel-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'carousel-progress-bar';
    progress.appendChild(progressBar);
    
    carouselContainer.appendChild(carouselWrapper);
    carouselContainer.appendChild(nav);
    carouselContainer.appendChild(dots);
    carouselContainer.appendChild(progress);
    
    container.parentNode.replaceChild(carouselContainer, container);
    
    new Carousel(carouselContainer);
}
