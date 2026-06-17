/**
 * Main JS Script for Embroidery & Custom Apparel Printing
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initDarkMode();
  initRTLMode();
  initFormValidations();
  initFAQAccordions();
  initTabs();
  initCountdown();
  highlightActivePage();
  initHeroParallax();
  initScrollToTop();
  initTimelineLoop();
});

/**
 * 1. Navbar Sticky & Mobile Toggle
 */
function initNavbar() {
  const header = document.querySelector('.navbar-header');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const controls = document.querySelector('.navbar-controls');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const rtlToggle = document.getElementById('rtl-toggle');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      } else {
        navMenu.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
      }
    });

    // Close menu when clicking navigation links on mobile (excluding dropdown toggles)
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
      link.addEventListener('click', () => {
        if (!link.classList.contains('dropdown-toggle')) {
          navMenu.classList.remove('open');
        }
      });
    });
  }

  function handleResponsiveControls() {
    if (window.innerWidth <= 1024) {
      if (darkModeToggle && rtlToggle && navMenu) {
        let ctrlWrapper = navMenu.querySelector('.menu-controls-wrapper');
        if (!ctrlWrapper) {
          ctrlWrapper = document.createElement('li');
          ctrlWrapper.className = 'menu-controls-wrapper';
          navMenu.appendChild(ctrlWrapper);
        }
        if (!ctrlWrapper.contains(darkModeToggle)) {
          ctrlWrapper.appendChild(darkModeToggle);
        }
        if (!ctrlWrapper.contains(rtlToggle)) {
          ctrlWrapper.appendChild(rtlToggle);
        }
      }
    } else {
      if (darkModeToggle && rtlToggle && controls && hamburger) {
        if (!controls.contains(darkModeToggle)) {
          controls.insertBefore(darkModeToggle, hamburger);
        }
        if (!controls.contains(rtlToggle)) {
          controls.insertBefore(rtlToggle, hamburger);
        }
        const ctrlWrapper = navMenu.querySelector('.menu-controls-wrapper');
        if (ctrlWrapper) {
          ctrlWrapper.remove();
        }
      }
    }
  }

  if (darkModeToggle && rtlToggle && navMenu && controls && hamburger) {
    handleResponsiveControls();
    window.addEventListener('resize', handleResponsiveControls);
  }

  // Dropdown toggle logic
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdown = document.querySelector('.dropdown');
  if (dropdownToggle && dropdown) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }
}

/**
 * 2. Dark Mode Toggle & Systems Detection
 */
function initDarkMode() {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Apply initially
  if (currentTheme === 'dark' || (!currentTheme && systemPrefersDark)) {
    document.body.classList.add('dark-mode');
    updateDarkIcon(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateDarkIcon(false);
  }

  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateDarkIcon(isDark);
  });
}

function updateDarkIcon(isDark) {
  const icon = document.querySelector('#dark-mode-toggle svg');
  if (!icon) return;
  if (isDark) {
    // Show Sun Icon for switching to light
    icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
  } else {
    // Show Moon Icon for switching to dark
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  }
}

/**
 * 3. RTL Mode Toggle
 */
function initRTLMode() {
  const toggleBtn = document.getElementById('rtl-toggle');
  if (!toggleBtn) return;

  const currentDir = localStorage.getItem('dir');

  // Apply initially
  if (currentDir === 'rtl') {
    document.body.setAttribute('dir', 'rtl');
    toggleBtn.classList.add('rtl-active');
  } else {
    document.body.removeAttribute('dir');
    toggleBtn.classList.remove('rtl-active');
  }

  toggleBtn.addEventListener('click', () => {
    const isRTL = document.body.getAttribute('dir') === 'rtl';
    if (isRTL) {
      document.body.removeAttribute('dir');
      localStorage.setItem('dir', 'ltr');
      toggleBtn.classList.remove('rtl-active');
    } else {
      document.body.setAttribute('dir', 'rtl');
      localStorage.setItem('dir', 'rtl');
      toggleBtn.classList.add('rtl-active');
    }
  });
}

/**
 * 4. Active Navigation Link Highlighting
 */
function highlightActivePage() {
  const path = window.location.pathname;
  const pageName = path.split("/").pop() || 'index.html';

  document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageName) {
      link.classList.add('active');

      // If it's a dropdown item, also highlight the parent dropdown-toggle
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.classList.add('active');
      }
    } else {
      // Don't remove active if it's dropdown-toggle and has active child
      if (link.classList.contains('dropdown-toggle')) {
        const dropdownMenu = link.nextElementSibling;
        if (dropdownMenu && dropdownMenu.querySelector('.dropdown-item.active')) {
          return;
        }
      }
      link.classList.remove('active');
    }
  });
}

/**
 * 5. Client-Side Form Validations & Submissions
 */
function initFormValidations() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate inputs
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const fieldValid = validateField(input);
        if (!fieldValid) isValid = false;
      });

      if (isValid) {
        showToast('Form submitted successfully!');
        form.reset();
        // Clear valid/error classes
        inputs.forEach(input => {
          const group = input.closest('.form-group');
          if (group) {
            group.classList.remove('is-valid', 'has-error');
          }
        });
      }
    });

    // Realtime feedback
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateField(input);
      });
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('has-error')) {
          validateField(input); // Clear errors dynamically
        }
      });
    });
  });
}

function validateField(input) {
  const group = input.closest('.form-group');
  if (!group) return true;

  const value = input.value.trim();
  const errorMsg = group.querySelector('.form-error-msg');
  const type = input.getAttribute('type');
  const isRequired = input.hasAttribute('required');

  let isValid = true;
  let message = 'This field is required';

  if (isRequired && value === '') {
    isValid = false;
  } else if (value !== '') {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    } else if (type === 'tel') {
      const phoneRegex = /^[0-9+\s-]{8,15}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid phone number (8+ digits)';
      }
    } else if (type === 'password') {
      if (value.length < 8) {
        isValid = false;
        message = 'Password must be at least 8 characters';
      }
    }
  }

  if (isValid) {
    group.classList.remove('has-error');
    group.classList.add('is-valid');
  } else {
    group.classList.add('has-error');
    group.classList.remove('is-valid');
    if (errorMsg) {
      errorMsg.textContent = message;
    }
  }

  return isValid;
}

/**
 * 6. Interactive FAQs Accordion
 */
function initFAQAccordions() {
  const accordions = document.querySelectorAll('.faq-accordion-header');
  accordions.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.faq-accordion-item');
      const content = item.querySelector('.faq-accordion-content');

      const isOpen = item.classList.contains('open');

      // Close all other accordions first
      document.querySelectorAll('.faq-accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          const otherContent = otherItem.querySelector('.faq-accordion-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        content.style.maxHeight = null;
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 7. Interactive Tabs System (For Tech Showcase)
 */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  if (tabs.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePanel = document.getElementById(target);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}

/**
 * 8. Countdown Timer (Coming Soon page)
 */
function initCountdown() {
  const timerDays = document.getElementById('days');
  const timerHours = document.getElementById('hours');
  const timerMinutes = document.getElementById('minutes');
  const timerSeconds = document.getElementById('seconds');

  if (!timerDays) return;

  // Launch Date: 60 days in the future
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 60);

  function updateClock() {
    const total = Date.parse(launchDate) - Date.parse(new Date());
    if (total <= 0) {
      clearInterval(timeinterval);
      return;
    }
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    timerDays.textContent = days.toString().padStart(2, '0');
    timerHours.textContent = hours.toString().padStart(2, '0');
    timerMinutes.textContent = minutes.toString().padStart(2, '0');
    timerSeconds.textContent = seconds.toString().padStart(2, '0');
  }

  updateClock();
  const timeinterval = setInterval(updateClock, 1000);
}

/**
 * Toast Notification Helper
 */
function showToast(message) {
  let toast = document.querySelector('.toast-msg');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/**
 * 3D Parallax and Tilt Effect for Hero Section
 */
function initHeroParallax() {
  const viewport = document.querySelector('.hero-viewport');
  const bg = document.querySelector('.hero-bg-parallax');
  const content = document.querySelector('.hero-content-3d');

  if (!viewport || !bg || !content) return;

  viewport.addEventListener('mousemove', (e) => {
    const rect = viewport.getBoundingClientRect();

    // Calculate mouse position relative to center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Apply translations on background (parallax shift)
    // Scale must be at least 1.05 to cover margins when translating
    const bgTranslateX = x * -30; // shift opposite direction of mouse
    const bgTranslateY = y * -30;
    bg.style.transform = `scale(1.1) translate(${bgTranslateX}px, ${bgTranslateY}px)`;

    // Apply tilt rotations on 3D text container
    const tiltX = -y * 4; // rotate around X axis (up/down)
    const tiltY = x * 4;  // rotate around Y axis (left/right)
    content.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
  });

  viewport.addEventListener('mouseleave', () => {
    // Smooth reset transitions
    bg.style.transform = 'scale(1.05) translate(0px, 0px)';
    content.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  });
}

/**
 * 9. Scroll to Top Button
 */
function initScrollToTop() {
  // Inject CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .scroll-to-top-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #dc2626;
      color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.35);
    }
    .scroll-to-top-btn.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .scroll-to-top-btn:hover {
      background: #b91c1c;
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.45);
    }
    .scroll-to-top-btn:active {
      transform: translateY(-2px) scale(0.98);
    }
    .scroll-to-top-btn svg {
      transition: transform 0.3s ease;
    }
    .scroll-to-top-btn:hover svg {
      transform: translateY(-2px);
    }
    [dir="rtl"] .scroll-to-top-btn {
      right: auto;
      left: 30px;
    }
    @media (max-width: 480px) {
      .scroll-to-top-btn {
        bottom: 20px;
        right: 20px;
        width: 42px;
        height: 42px;
      }
      [dir="rtl"] .scroll-to-top-btn {
        right: auto;
        left: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create Button Element
  const btn = document.createElement('button');
  btn.className = 'scroll-to-top-btn';
  btn.setAttribute('aria-label', 'Scroll to Top');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  document.body.appendChild(btn);

  // Scroll Listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  // Click Listener
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * 10. Interactive Process Timeline Active Loop Animation
 */
function initTimelineLoop() {
  const timeline = document.querySelector('.timeline');
  const items = document.querySelectorAll('.timeline-item');
  const fillLine = document.querySelector('.timeline-line-fill');
  const needle = document.querySelector('.timeline-needle');

  if (!timeline || items.length === 0 || !fillLine) return;

  let activeStep = 1;
  const stepCount = items.length;
  const duration = 5000; // 5 seconds per step
  const intervalTime = 50; // Update progress bar every 50ms for buttery smooth movement
  let elapsed = 0;
  let isPaused = false;
  let loopTimer = null;

  function updateTimeline() {
    items.forEach(item => {
      const stepNum = parseInt(item.getAttribute('data-step'));
      const progressFill = item.querySelector('.timeline-progress-fill');
      
      if (stepNum === activeStep) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
        if (progressFill) {
          progressFill.style.width = '0%';
        }
      }
    });

    // Calculate dynamic line fill height up to the active step's center dot
    const activeItem = timeline.querySelector(`.timeline-item[data-step="${activeStep}"]`);
    if (activeItem) {
      // Circle vertical offset is at activeItem.offsetTop + top (15px) + half height (10px) = 25px
      const targetHeight = activeItem.offsetTop + 25;
      fillLine.style.height = `${targetHeight}px`;

      // Move needle tracker to active dot position
      if (needle) {
        needle.style.transform = `translateY(${targetHeight}px)`;
      }
    }
  }

  function loopStep() {
    if (isPaused) return;

    elapsed += intervalTime;
    const activeItem = timeline.querySelector(`.timeline-item[data-step="${activeStep}"]`);
    if (activeItem) {
      const progressFill = activeItem.querySelector('.timeline-progress-fill');
      if (progressFill) {
        const pct = Math.min((elapsed / duration) * 100, 100);
        progressFill.style.width = `${pct}%`;
      }
    }

    if (elapsed >= duration) {
      elapsed = 0;
      // Reset current fill instantly before switching
      const currentFill = activeItem ? activeItem.querySelector('.timeline-progress-fill') : null;
      if (currentFill) currentFill.style.width = '0%';

      activeStep++;
      if (activeStep > stepCount) {
        activeStep = 1;
      }
      updateTimeline();
    }
  }

  // 1. Scroll-Triggered Entrance Animations (IntersectionObserver)
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    items.forEach(item => {
      revealObserver.observe(item);
    });
  } else {
    items.forEach(item => item.classList.add('visible'));
  }

  // 2. 3D Card Tilt Interaction
  items.forEach(item => {
    const card = item.querySelector('.timeline-content');
    if (!card) return;

    item.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const tiltX = -(y * 12).toFixed(2); // Tilt up to 12 degrees
      const tiltY = (x * 12).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
      card.style.boxShadow = '0 15px 35px rgba(220, 38, 38, 0.08), 0 3px 10px rgba(220, 38, 38, 0.04)';
    });

    item.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // Bind hover states to pause / resume the automated loop
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    item.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    // Click to jump straight to step
    item.addEventListener('click', () => {
      const selectedStep = parseInt(item.getAttribute('data-step'));
      if (selectedStep !== activeStep) {
        // Reset previous active step's progress fill
        const prevActive = timeline.querySelector(`.timeline-item[data-step="${activeStep}"]`);
        if (prevActive) {
          const prevFill = prevActive.querySelector('.timeline-progress-fill');
          if (prevFill) prevFill.style.width = '0%';
        }

        activeStep = selectedStep;
        elapsed = 0;
        updateTimeline();
        
        // Instantly update progress bar to 0% for the new step
        const activeProgress = item.querySelector('.timeline-progress-fill');
        if (activeProgress) activeProgress.style.width = '0%';
      }
    });
  });

  // Handle screen resize to dynamically recalculate heights correctly
  window.addEventListener('resize', updateTimeline);

  // Initialize
  updateTimeline();
  loopTimer = setInterval(loopStep, intervalTime);
}

