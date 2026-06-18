const swirlContainer = document.getElementById('swirl-container');
const asciiMask = document.getElementById('ascii-mask');
const asciiEl = document.getElementById('ascii-gabriel');

// Load the ASCII Art from the newly created JS file
if (typeof ASCII_NEW_RAW !== 'undefined') {
  asciiEl.textContent = ASCII_NEW_RAW;
} else {
  asciiEl.textContent = "ASCII art not found.";
}

// Function to scale the ASCII art so it fills the container nicely
function fitAscii() {
  if (!asciiEl || !swirlContainer) return;
  // Reset transform to measure accurately
  asciiEl.style.transform = 'translate(-50%, -50%) scale(1)';
  
  const containerRect = swirlContainer.getBoundingClientRect();
  const artW = asciiEl.scrollWidth;
  const artH = asciiEl.scrollHeight;
  
  // Calculate scale to make the ASCII art cover the cell container
  // just like the background image does (background-size: cover)
  const scaleX = containerRect.width / artW;
  const scaleY = containerRect.height / artH;
  const scale = Math.max(scaleX, scaleY);
  
  // Apply translation and exact scale
  asciiEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

// Instant Spotlight Logic
const SPOTLIGHT_RADIUS = 150;

swirlContainer.addEventListener('mousemove', (e) => {
  const rect = swirlContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  asciiMask.style.clipPath = `circle(${SPOTLIGHT_RADIUS}px at ${x}px ${y}px)`;
});

swirlContainer.addEventListener('mouseenter', (e) => {
  const rect = swirlContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  asciiMask.style.clipPath = `circle(${SPOTLIGHT_RADIUS}px at ${x}px ${y}px)`;
});

swirlContainer.addEventListener('mouseleave', () => {
  asciiMask.style.clipPath = `circle(0px at 0px 0px)`;
});

// Initialize and resize event
window.addEventListener('resize', fitAscii);

// Fit the ASCII art once fonts are loaded
if (document.fonts) {
  document.fonts.ready.then(fitAscii);
} else {
  setTimeout(fitAscii, 200);
}


// Live Clock Widget Logic
const timeEl = document.getElementById('live-time');
const dateEl = document.getElementById('live-date');

function updateClock() {
  if (!timeEl || !dateEl) return;
  const now = new Date();
  
  // Format Time (HH:MM:SS:MS)
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
  timeEl.textContent = `${hours}:${minutes}:${seconds}:${ms}`;
  
  // Format Date (e.g. MON, OCT 24)
  const options = { weekday: 'short', month: 'short', day: '2-digit' };
  dateEl.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
}

if (timeEl && dateEl) {
  setInterval(updateClock, 10);
  updateClock();
}

// Mobile Menu Logic
const hamburger = document.querySelector('.mobile-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const menuLinks = document.querySelectorAll('.menu-link');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Close menu when a link is clicked
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
      
      // Handle smooth scroll for internal links
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// Copy Email Logic
const contactSection = document.getElementById('contact-section');
if (contactSection) {
  contactSection.addEventListener('click', () => {
    const email = 'contact@xkatsura.com';
    navigator.clipboard.writeText(email).then(() => {
      const emailText = contactSection.querySelector('.email-text');
      if (emailText) {
        const originalText = emailText.textContent;
        emailText.textContent = 'Copied!';
        setTimeout(() => {
          emailText.textContent = originalText;
        }, 2000);
      }
    });
  });
}

// Hello Text Typing Effect
const helloText = document.getElementById('hello-text');
if (helloText) {
  const greetings = [
    "HELLO, I'M",            // English
    "HALO, SAYA",            // Indonesian
    "BONJOUR, JE SUIS",      // French
    "CIAO, SONO",            // Italian
    "HALLO, ICH BIN",        // German
    "ПРИВЕТ, Я",             // Russian
    "مرحباً، أنا",             // Arabic
    "你好，我是",            // Chinese
    "こんにちは、私は"      // Japanese
  ];

  let greetingIndex = 0;
  let charIndex = greetings[0].length;
  let isDeleting = false;

  function typeGreeting() {
    const currentGreeting = greetings[greetingIndex];
    
    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }
    
    helloText.textContent = currentGreeting.substring(0, charIndex);
    
    let typeSpeed = isDeleting ? 100 : 120;
    
    if (!isDeleting && charIndex === currentGreeting.length) {
      // Finished typing, pause longer
      typeSpeed = 2500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting, move to next greeting
      isDeleting = false;
      greetingIndex = (greetingIndex + 1) % greetings.length;
      typeSpeed = 400; // Pause before typing new word
    }
    
    setTimeout(typeGreeting, typeSpeed);
  }

  // Start the effect after an initial delay
  setTimeout(() => {
    isDeleting = true;
    typeGreeting();
  }, 3000);
}
