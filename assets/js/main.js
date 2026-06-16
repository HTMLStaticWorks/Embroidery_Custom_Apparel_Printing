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
});

/**
 * 1. Navbar Sticky & Mobile Toggle
 */
function initNavbar() {
  const header = document.querySelector('.navbar-header');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

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

    // Close menu when clicking navigation links on mobile
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
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
      const icon = header.querySelector('.faq-accordion-icon');

      const isOpen = item.classList.contains('open');

      // Close all other accordions first
      document.querySelectorAll('.faq-accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq-accordion-content').style.maxHeight = null;
          const otherIcon = otherItem.querySelector('.faq-accordion-icon');
          if (otherIcon) otherIcon.innerHTML = '+';
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        content.style.maxHeight = null;
        if (icon) icon.innerHTML = '+';
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        if (icon) icon.innerHTML = '−';
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

