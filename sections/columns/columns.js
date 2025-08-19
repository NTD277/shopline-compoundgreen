/**
 * Section Columns JavaScript - Dễ dàng chuyển sang project khác
 * 
 * Chức năng chính:
 * - Grid layout management
 * - Slider functionality
 * - Responsive behavior
 * - Animation handling
 * - Touch/swipe support
 */

class SectionColumns {
  constructor(container) {
    this.container = container;
    this.sectionId = container.dataset.sectionId;
    this.sectionType = container.dataset.sectionType;
    this.gridSlider = container.querySelector('[data-grid-slider]');
    this.gridItems = container.querySelectorAll('[data-grid-item]');
    this.isSlider = this.gridSlider !== null;
    this.isMobile = window.innerWidth <= 749;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupSlider();
    this.setupAnimations();
    this.setupResponsive();
  }

  /**
   * Thiết lập event listeners
   */
  setupEventListeners() {
    // Resize event
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // Touch events cho mobile slider
    if (this.isSlider && this.isMobile) {
      this.setupTouchEvents();
    }

    // Keyboard navigation
    this.setupKeyboardNavigation();

    // Intersection Observer cho animations
    this.setupIntersectionObserver();
  }

  /**
   * Thiết lập slider functionality
   */
  setupSlider() {
    if (!this.isSlider) return;

    // Tạo custom slider element nếu cần
    if (!this.container.querySelector('grid-slider')) {
      this.createCustomSlider();
    }

    // Thiết lập slider behavior
    this.setupSliderBehavior();
  }

  /**
   * Tạo custom slider element
   */
  createCustomSlider() {
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'custom-slider-wrapper';
    sliderWrapper.innerHTML = `
      <div class="slider-container">
        <div class="slider-track">
          ${Array.from(this.gridItems).map(item => `
            <div class="slider-item">
              ${item.outerHTML}
            </div>
          `).join('')}
        </div>
        <button class="slider-nav slider-nav--prev" aria-label="Previous slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="slider-nav slider-nav--next" aria-label="Next slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    // Thay thế grid hiện tại
    this.gridSlider.parentNode.replaceChild(sliderWrapper, this.gridSlider);
    this.setupCustomSliderEvents(sliderWrapper);
  }

  /**
   * Thiết lập custom slider events
   */
  setupCustomSliderEvents(sliderWrapper) {
    const track = sliderWrapper.querySelector('.slider-track');
    const prevBtn = sliderWrapper.querySelector('.slider-nav--prev');
    const nextBtn = sliderWrapper.querySelector('.slider-nav--next');
    let currentIndex = 0;
    const itemWidth = 100 / this.getVisibleItems();

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
      this.slideTo(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
      this.slideTo(currentIndex + 1);
    });

    // Touch/swipe events
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.slideTo(currentIndex + 1);
        } else {
          this.slideTo(currentIndex - 1);
        }
        isDragging = false;
      }
    });

    track.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Slide function
    this.slideTo = (index) => {
      const maxIndex = this.gridItems.length - this.getVisibleItems();
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      
      const translateX = -currentIndex * itemWidth;
      track.style.transform = `translateX(${translateX}%)`;
      
      // Update navigation state
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    };

    // Initial state
    prevBtn.disabled = true;
  }

  /**
   * Thiết lập slider behavior cơ bản
   */
  setupSliderBehavior() {
    if (this.container.querySelector('grid-slider')) {
      // Sử dụng grid-slider component có sẵn
      this.setupGridSlider();
    }
  }

  /**
   * Thiết lập grid-slider component
   */
  setupGridSlider() {
    const gridSlider = this.container.querySelector('grid-slider');
    
    // Customize grid-slider behavior nếu cần
    if (gridSlider && gridSlider.setupSlider) {
      gridSlider.setupSlider({
        slidesPerView: this.getVisibleItems(),
        spaceBetween: 30,
        navigation: true,
        pagination: false,
        loop: false,
        autoplay: false
      });
    }
  }

  /**
   * Thiết lập touch events cho mobile
   */
  setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isSwiping = false;

    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    });

    this.container.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const diffX = startX - currentX;
      const diffY = startY - currentY;
      
      // Chỉ xử lý swipe ngang
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        e.preventDefault();
        
        if (diffX > 0) {
          this.handleSwipe('left');
        } else {
          this.handleSwipe('right');
        }
        
        isSwiping = false;
      }
    });

    this.container.addEventListener('touchend', () => {
      isSwiping = false;
    });
  }

  /**
   * Xử lý swipe gestures
   */
  handleSwipe(direction) {
    if (!this.isSlider) return;
    
    // Implement swipe logic here
    console.log(`Swipe ${direction} detected`);
  }

  /**
   * Thiết lập keyboard navigation
   */
  setupKeyboardNavigation() {
    this.container.addEventListener('keydown', (e) => {
      if (!this.isSlider) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateSlider('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateSlider('next');
          break;
        case 'Home':
          e.preventDefault();
          this.navigateSlider('first');
          break;
        case 'End':
          e.preventDefault();
          this.navigateSlider('last');
          break;
      }
    });
  }

  /**
   * Navigation cho slider
   */
  navigateSlider(direction) {
    // Implement navigation logic here
    console.log(`Navigate ${direction}`);
  }

  /**
   * Thiết lập animations
   */
  setupAnimations() {
    // AOS (Animate On Scroll) integration
    if (typeof AOS !== 'undefined') {
      this.setupAOS();
    } else {
      this.setupCustomAnimations();
    }
  }

  /**
   * Thiết lập AOS animations
   */
  setupAOS() {
    // AOS đã được thiết lập, chỉ cần refresh
    if (AOS.refresh) {
      AOS.refresh();
    }
  }

  /**
   * Thiết lập custom animations
   */
  setupCustomAnimations() {
    const animatedElements = this.container.querySelectorAll('[data-aos]');
    
    animatedElements.forEach(element => {
      const animation = element.dataset.aos;
      const order = element.dataset.aosOrder || 0;
      const anchor = element.dataset.aosAnchor;
      
      // Custom animation logic
      this.animateElement(element, animation, order, anchor);
    });
  }

  /**
   * Animate element với custom logic
   */
  animateElement(element, animation, order, anchor) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.classList.add('aos-animate');
          }, order * 100);
          
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(element);
  }

  /**
   * Thiết lập Intersection Observer
   */
  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // Trigger custom events
          this.container.dispatchEvent(new CustomEvent('sectionInView', {
            detail: { sectionId: this.sectionId }
          }));
        }
      });
    }, options);

    observer.observe(this.container);
  }

  /**
   * Thiết lập responsive behavior
   */
  setupResponsive() {
    this.updateLayout();
    
    // Listen for orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleResize();
      }, 100);
    });
  }

  /**
   * Xử lý resize
   */
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 749;
    
    if (wasMobile !== this.isMobile) {
      this.updateLayout();
    }
    
    this.updateSliderLayout();
  }

  /**
   * Cập nhật layout dựa trên screen size
   */
  updateLayout() {
    if (this.isMobile) {
      this.container.classList.add('is-mobile');
      this.container.classList.remove('is-desktop');
    } else {
      this.container.classList.add('is-desktop');
      this.container.classList.remove('is-mobile');
    }
  }

  /**
   * Cập nhật slider layout
   */
  updateSliderLayout() {
    if (!this.isSlider) return;
    
    const visibleItems = this.getVisibleItems();
    this.container.style.setProperty('--visible-items', visibleItems);
  }

  /**
   * Lấy số lượng items hiển thị
   */
  getVisibleItems() {
    if (this.isMobile) {
      return parseInt(this.container.dataset.columnsMobile) || 1;
    }
    
    return parseInt(this.container.dataset.columns) || 3;
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Public methods
   */
  refresh() {
    this.updateLayout();
    this.updateSliderLayout();
  }

  destroy() {
    // Cleanup event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Remove observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

/**
 * Auto-initialize SectionColumns cho tất cả sections
 */
document.addEventListener('DOMContentLoaded', () => {
  const sectionColumns = document.querySelectorAll('[data-section-type="columns"]');
  
  sectionColumns.forEach(section => {
    new SectionColumns(section);
  });
});

/**
 * Shopify section events
 */
if (typeof Shopify !== 'undefined') {
  document.addEventListener('shopify:section:load', (event) => {
    if (event.target.dataset.sectionType === 'columns') {
      new SectionColumns(event.target);
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    if (event.target.dataset.sectionType === 'columns') {
      // Cleanup nếu cần
    }
  });
}

/**
 * Export cho sử dụng external
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SectionColumns;
} else if (typeof window !== 'undefined') {
  window.SectionColumns = SectionColumns;
}
