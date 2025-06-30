// Navigation functionality
class CybersecurityRoadmap {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.menuToggle = document.getElementById('menuToggle');
    this.navList = document.getElementById('navList');
    this.levelCards = document.querySelectorAll('.level-card');
    
    this.init();
  }

  init() {
    this.generateNavigation();
    this.setupToggleHandlers();
    this.setupScrollSpy();
    this.setupMobileMenu();
    this.setupCollapsibleSections();
    this.initializeCollapsedState();
  }

  generateNavigation() {
    const navItems = Array.from(this.levelCards).map(card => {
      const level = card.dataset.level;
      const title = card.querySelector('h2').textContent;
      return {
        level,
        title,
        id: card.id
      };
    });

    this.navList.innerHTML = navItems.map(item => `
      <li>
        <a href="#${item.id}" data-level="${item.level}">
          ${item.title}
        </a>
      </li>
    `).join('');

    // Add smooth scroll behavior to navigation links
    this.navList.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu after navigation
          if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('active');
          }
        }
      }
    });
  }

  setupToggleHandlers() {
    this.levelCards.forEach(card => {
      const header = card.querySelector('.level-header');
      header.addEventListener('click', () => {
        this.toggleCard(card);
      });
    });
  }

  toggleCard(card) {
    card.classList.toggle('collapsed');
    
    // Add animation for smooth expand/collapse
    const content = card.querySelector('.level-content');
    if (card.classList.contains('collapsed')) {
      content.style.maxHeight = '0';
      content.style.overflow = 'hidden';
      content.style.transition = 'max-height 0.3s ease-out';
    } else {
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.overflow = 'visible';
      content.style.transition = 'max-height 0.3s ease-in';
      
      // Reset max-height after animation completes
      setTimeout(() => {
        content.style.maxHeight = 'none';
      }, 300);
    }
  }

  setupScrollSpy() {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentLevel = entry.target.dataset.level;
          this.updateActiveNavItem(currentLevel);
        }
      });
    }, observerOptions);

    this.levelCards.forEach(card => {
      observer.observe(card);
    });
  }

  updateActiveNavItem(level) {
    // Remove active class from all nav items
    const navLinks = this.navList.querySelectorAll('a');
    navLinks.forEach(link => link.classList.remove('active'));

    // Add active class to current item
    const currentNavItem = this.navList.querySelector(`a[data-level="${level}"]`);
    if (currentNavItem) {
      currentNavItem.classList.add('active');
    }
  }

  setupMobileMenu() {
    this.menuToggle.addEventListener('click', () => {
      this.sidebar.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !this.sidebar.contains(e.target) && 
          !this.menuToggle.contains(e.target)) {
        this.sidebar.classList.remove('active');
      }
    });

    // Close menu on window resize if it gets large enough
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.sidebar.classList.remove('active');
      }
    });
  }

  setupCollapsibleSections() {
    // Add keyboard accessibility for collapsible sections
    this.levelCards.forEach(card => {
      const header = card.querySelector('.level-header');
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'true');

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleCard(card);
          header.setAttribute('aria-expanded', 
            card.classList.contains('collapsed') ? 'false' : 'true'
          );
        }
      });
    });
  }

  initializeCollapsedState() {
    // Initialize all cards as expanded on desktop, collapsed on mobile
    if (window.innerWidth <= 768) {
      this.levelCards.forEach(card => {
        card.classList.add('collapsed');
        const content = card.querySelector('.level-content');
        content.style.maxHeight = '0';
        content.style.overflow = 'hidden';
      });
    }
  }
}

// Progress tracking functionality
class ProgressTracker {
  constructor() {
    this.storageKey = 'cybersecurity-roadmap-progress';
    this.progress = this.loadProgress();
    this.init();
  }

  init() {
    this.addProgressIndicators();
    this.setupProgressTracking();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Could not load progress from localStorage:', error);
      return {};
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    } catch (error) {
      console.warn('Could not save progress to localStorage:', error);
    }
  }

  addProgressIndicators() {
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      const level = card.dataset.level;
      const header = card.querySelector('.level-header');
      
      // Create progress indicator
      const progressIndicator = document.createElement('div');
      progressIndicator.className = 'progress-indicator';
      progressIndicator.innerHTML = `
        <label class="progress-checkbox">
          <input type="checkbox" ${this.progress[level] ? 'checked' : ''}>
          <span class="checkmark">✓</span>
          <span class="progress-text">Completed</span>
        </label>
      `;
      
      header.appendChild(progressIndicator);

      // Add CSS for progress indicator
      if (!document.getElementById('progress-styles')) {
        const style = document.createElement('style');
        style.id = 'progress-styles';
        style.textContent = `
          .progress-indicator {
            margin-left: auto;
            padding-left: 1rem;
          }
          
          .progress-checkbox {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 0.9rem;
            color: #666;
          }
          
          .progress-checkbox input {
            margin-right: 0.5rem;
            transform: scale(1.2);
          }
          
          .progress-checkbox input:checked + .checkmark {
            color: #22c55e;
          }
          
          .progress-text {
            margin-left: 0.25rem;
          }
          
          @media (max-width: 768px) {
            .progress-indicator {
              display: none;
            }
          }
        `;
        document.head.appendChild(style);
      }
    });
  }

  setupProgressTracking() {
    document.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox' && e.target.closest('.progress-indicator')) {
        const levelCard = e.target.closest('.level-card');
        const level = levelCard.dataset.level;
        this.progress[level] = e.target.checked;
        this.saveProgress();
        this.updateOverallProgress();
      }
    });
  }

  updateOverallProgress() {
    const totalLevels = document.querySelectorAll('.level-card').length;
    const completedLevels = Object.values(this.progress).filter(Boolean).length;
    const percentage = Math.round((completedLevels / totalLevels) * 100);
    
    // Update document title with progress
    document.title = `Python to Cybersecurity Roadmap (${percentage}% Complete)`;
  }
}

// Smooth animations on scroll
class ScrollAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Apply to level cards with initial hidden state
    document.querySelectorAll('.level-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      animateOnScroll.observe(card);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CybersecurityRoadmap();
  new ProgressTracker();
  new ScrollAnimations();
  
  // Add some interactive feedback
  console.log('🐍 Python to Cybersecurity Roadmap loaded successfully!');
  console.log('💡 Use the sidebar to navigate between levels');
  console.log('✅ Check off levels as you complete them');
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.code);
  
  if (konamiCode.length > konamiSequence.length) {
    konamiCode.shift();
  }
  
  if (konamiCode.join(',') === konamiSequence.join(',')) {
    // Add some fun effects
    document.body.style.animation = 'rainbow 2s infinite';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 5000);
    
    // Add rainbow animation CSS
    if (!document.getElementById('rainbow-styles')) {
      const style = document.createElement('style');
      style.id = 'rainbow-styles';
      style.textContent = `
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    alert('🎉 Konami Code activated! You\'re ready for advanced cybersecurity! 🎉');
    konamiCode = [];
  }
});