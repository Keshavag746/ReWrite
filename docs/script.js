document.addEventListener('DOMContentLoaded', () => {
  // ─── Theme Toggler Logic ───────────────────────────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Initialize theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else {
    // Fallback to system preferred theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = systemPrefersDark ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', initialTheme);
  }

  // Toggle theme click listener
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ─── Search Filter Logic ──────────────────────────────────────────────────
  const searchInput = document.getElementById('search-input');
  const cards = document.querySelectorAll('.content-card');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
          card.style.display = 'block';
          // Trigger slight fade-in animation
          card.style.animation = 'none';
          card.offsetHeight; // Trigger reflow to restart animation
          card.style.animation = 'cardFadeUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });

      // Handle sidebar active link states based on search results
      if (query !== '') {
        // If searching, deactivate scrollspy highlights
        document.querySelectorAll('.nav-link').forEach((lnk) => lnk.classList.remove('active'));
      } else {
        // Recalculate current scrollspy active state
        onScrollSpy();
      }
    });
  }

  // ─── Scroll Spy Navigation ────────────────────────────────────────────────
  const navLinks = document.querySelectorAll('.nav-link');
  
  function onScrollSpy() {
    // If the user has typed a query, skip changing highlights
    if (searchInput && searchInput.value.trim() !== '') return;

    let currentSectionId = 'overview';
    const scrollPos = window.scrollY || window.pageYOffset;

    // Find current section in viewport
    cards.forEach((card) => {
      const cardTop = card.offsetTop - 120; // offset header height
      const cardHeight = card.offsetHeight;
      
      if (scrollPos >= cardTop && scrollPos < cardTop + cardHeight) {
        currentSectionId = card.getAttribute('id');
      }
    });

    // Update nav classes
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScrollSpy);

  // ─── Form Submission Logic ────────────────────────────────────────────────
  const supportForm = document.getElementById('mock-support-form');
  const formFeedback = document.getElementById('form-feedback');

  if (supportForm) {
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Select form controls
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');
      const submitBtn = supportForm.querySelector('.submit-btn');

      if (submitBtn) submitBtn.disabled = true;

      // Mock delay to simulate network call
      setTimeout(() => {
        if (formFeedback) {
          formFeedback.textContent = `Thank you, ${nameInput.value}! Your privacy inquiry has been logged securely. Keshora AI support will respond to ${emailInput.value} within 48 hours.`;
          formFeedback.className = 'form-feedback success';
          formFeedback.style.display = 'block';
        }

        // Reset form controls
        supportForm.reset();
        if (submitBtn) submitBtn.disabled = false;
      }, 800);
    });
  }
});
