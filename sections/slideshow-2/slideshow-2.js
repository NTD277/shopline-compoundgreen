/**
 * Slideshow 2 Section JavaScript
 * Handles slideshow functionality including autoplay, transitions, and navigation
 */

class Slideshow2 {
  constructor(element) {
    this.element = element;
    this.slider = element.querySelector('[data-slider]');
    this.slides = element.querySelectorAll('.slideshow__slide');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.autoplayInterval = null;
    this.isTransitioning = false;
    
    this.init();
  }

  init() {
    if (!this.slider || this.totalSlides === 0) return;
    
    this.parseOptions();
    this.setupEventListeners();
    this.showSlide(0);
    
    if (this.options.autoPlay) {
      this.startAutoplay();
    }
  }

  parseOptions() {
    const optionsData = this.slider.getAttribute('data-options');
    if (optionsData) {
      try {
        this.options = JSON.parse(optionsData);
      } catch (e) {
        console.warn('Invalid slideshow options:', e);
        this.options = this.getDefaultOptions();
      }
    } else {
      this.options = this.getDefaultOptions();
    }
  }

  getDefaultOptions() {
    return {
      fade: true,
      autoPlay: false,
      pageDots: true,
      prevNextButtons: true
    };
  }

  setupEventListeners() {
    // Navigation arrows
    if (this.options.prevNextButtons) {
      this.createNavigationArrows();
    }

    // Page dots
    if (this.options.pageDots) {
      this.createPageDots();
    }

    // Touch/swipe support
    this.setupTouchSupport();

    // Keyboard navigation
    this.setupKeyboardNavigation();

    // Pause autoplay on hover
    if (this.options.autoPlay) {
      this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.element.addEventListener('mouseleave', () => this.resumeAutoplay());
    }
  }

  createNavigationArrows() {
    const arrowsContainer = document.createElement('div');
    arrowsContainer.className = 'slideshow__arrows';
    arrowsContainer.innerHTML = `
      <button class="slideshow__arrow slideshow__arrow--prev" aria-label="Previous slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="slideshow__arrow slideshow__arrow--next" aria-label="Next slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    this.element.appendChild(arrowsContainer);

    const prevBtn = arrowsContainer.querySelector('.slideshow__arrow--prev');
    const nextBtn = arrowsContainer.querySelector('.slideshow__arrow--next');

    prevBtn.addEventListener('click', () => this.previousSlide());
    nextBtn.addEventListener('click', () => this.nextSlide());
  }

  createPageDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slideshow__dots';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'slideshow__dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      dotsContainer.appendChild(dot);
    }

    this.element.appendChild(dotsContainer);
    this.updateDots();
  }

  setupTouchSupport() {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    this.element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = false;
    });

    this.element.addEventListener('touchmove', (e) => {
      if (!isDragging) {
        const deltaX = Math.abs(e.touches[0].clientX - startX);
        const deltaY = Math.abs(e.touches[0].clientY - startY);
        
        if (deltaX > deltaY && deltaX > 10) {
          isDragging = true;
        }
      }
    });

    this.element.addEventListener('touchend', (e) => {
      if (isDragging) {
        const deltaX = e.changedTouches[0].clientX - startX;
        const threshold = 50;

        if (deltaX > threshold) {
          this.previousSlide();
        } else if (deltaX < -threshold) {
          this.nextSlide();
        }
      }
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.element.contains(document.activeElement) || this.element === document.activeElement) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.previousSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextSlide();
        }
      }
    });
  }

  showSlide(index) {
    if (this.isTransitioning || index < 0 || index >= this.totalSlides) return;
    
    this.isTransitioning = true;
    
    // Remove active class from current slide
    this.slides[this.currentSlide].classList.remove('is-selected');
    
    // Update current slide index
    this.currentSlide = index;
    
    // Add active class to new slide
    this.slides[this.currentSlide].classList.add('is-selected');
    
    // Update dots
    this.updateDots();
    
    // Trigger custom event
    this.element.dispatchEvent(new CustomEvent('slideChange', {
      detail: { currentSlide: this.currentSlide, totalSlides: this.totalSlides }
    }));
    
    // Reset transition flag after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.showSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.showSlide(prevIndex);
  }

  goToSlide(index) {
    this.showSlide(index);
  }

  updateDots() {
    const dots = this.element.querySelectorAll('.slideshow__dot');
    dots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add('is-active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('is-active');
        dot.removeAttribute('aria-current');
      }
    });
  }

  startAutoplay() {
    if (this.autoplayInterval) return;
    
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.options.autoPlay);
  }

  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resumeAutoplay() {
    if (this.options.autoPlay && !this.autoplayInterval) {
      this.startAutoplay();
    }
  }

  destroy() {
    this.pauseAutoplay();
    // Remove event listeners if needed
  }
}

// Initialize slideshows when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const slideshows = document.querySelectorAll('[data-section-type="slideshow"]');
  slideshows.forEach(slideshow => {
    new Slideshow2(slideshow);
  });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Slideshow2;
}
