const tmAddress = document.getElementById('tm-address');
const tmCopyBtn = document.getElementById('tm-copy-btn');
const tmCountdown = document.getElementById('tm-countdown');
const tmMessageList = document.getElementById('tm-message-list');
const tmInboxCount = document.getElementById('tm-inbox-count');

const tmAddressContainer = document.getElementById('tm-address-container');
const tmInputContainer = document.getElementById('tm-custom-input-container');
const tmCreateInitBtn = document.getElementById('tm-create-init-btn');
const tmSubmitBtn = document.getElementById('tm-submit-btn');
const tmGenerateNewBtn = document.getElementById('tm-generate-new-btn');
const tmCustomInput = document.getElementById('tm-custom-input');

const tmInboxView = document.getElementById('tm-inbox-view');
const tmDetailView = document.getElementById('tm-detail-view');
const tmBackToInbox = document.getElementById('tm-back-to-inbox');

// Detail view elements
const tmDetailSender = document.getElementById('tm-detail-sender');
const tmDetailSubject = document.getElementById('tm-detail-subject');
const tmDetailDate = document.getElementById('tm-detail-date');
const tmDetailBody = document.getElementById('tm-detail-body');

let refreshTimer = null;
let currentAddress = '';
let countdownValue = 10;
let inboxMessages = [];

// Mock emails to simulate receiving
const mockEmails = [
  {
    sender: "team@xkatsura.app",
    subject: "Welcome to Temp Mail",
    snippet: "Your temporary email is ready to use...",
    body: "Hi there,<br><br>Your temporary email is successfully created. You can use this to sign up for services without revealing your real identity.<br><br>Stay safe online,<br>xkatsura team",
    delay: 3000 // Receive after 3s
  },
  {
    sender: "no-reply@dribbble.com",
    subject: "Verify your Dribbble account",
    snippet: "Click the link below to verify your email...",
    body: "Welcome to Dribbble!<br><br>Please verify your email address to get full access to our community.<br><br><a href='#' style='color: #fff;'>Verify Email Address</a><br><br>Thanks,<br>The Dribbble Team",
    delay: 15000 // Receive after 15s
  },
  {
    sender: "security@github.com",
    subject: "[GitHub] A new device signed in",
    snippet: "We noticed a new login to your account...",
    body: "A new login to your account was detected from an unrecognized device.<br><br><strong>Device:</strong> Mac OS, Safari<br><strong>Location:</strong> Tokyo, Japan<br><br>If this was you, you can ignore this email.",
    delay: 35000 // Receive after 35s
  }
];

let mockTimers = [];

function generateRandomAddress() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let prefix = '';
  for(let i = 0; i < 8; i++) {
    prefix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}@xkatsura.com`;
}

function setAddressAndStart(address) {
  currentAddress = address;
  tmAddress.textContent = currentAddress;
  inboxMessages = [];
  renderInbox();
  
  // Clear any existing mock timers
  mockTimers.forEach(clearTimeout);
  mockTimers = [];
  
  // Schedule mock emails
  mockEmails.forEach((email) => {
    const timer = setTimeout(() => {
      receiveEmail(email);
    }, email.delay);
    mockTimers.push(timer);
  });
  
  startAutoRefresh();
}

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  countdownValue = 10;
  tmCountdown.textContent = countdownValue;
  
  refreshTimer = setInterval(() => {
    countdownValue--;
    if (countdownValue <= 0) {
      countdownValue = 10;
      // In a real app, we would fetch emails here
    }
    tmCountdown.textContent = countdownValue;
  }, 1000);
}

function receiveEmail(emailData) {
  const newEmail = {
    id: Date.now().toString(),
    sender: emailData.sender,
    subject: emailData.subject,
    snippet: emailData.snippet,
    body: emailData.body,
    date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    read: false
  };
  
  inboxMessages.unshift(newEmail);
  renderInbox();
}

function renderInbox() {
  tmInboxCount.textContent = inboxMessages.length;
  
  if (inboxMessages.length === 0) {
    tmMessageList.innerHTML = `
      <div class="tm-empty-state" id="tm-empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
          <polyline points="3 7 12 13 21 7"></polyline>
        </svg>
        <p>WAITING FOR INCOMING EMAILS...</p>
      </div>
    `;
    return;
  }
  
  tmMessageList.innerHTML = '';
  inboxMessages.forEach(msg => {
    const item = document.createElement('div');
    item.className = `tm-message-item ${msg.read ? '' : 'unread'}`;
    item.innerHTML = `
      <div class="tm-msg-header">
        <span class="tm-msg-sender">${msg.sender}</span>
        <span class="tm-msg-date">${msg.date}</span>
      </div>
      <div class="tm-msg-subject">${msg.subject}</div>
      <div class="tm-msg-snippet">${msg.snippet}</div>
    `;
    
    item.addEventListener('click', () => openEmailDetail(msg.id));
    tmMessageList.appendChild(item);
  });
}

function openEmailDetail(id) {
  const msg = inboxMessages.find(m => m.id === id);
  if (!msg) return;
  
  msg.read = true;
  renderInbox(); // update unread status in list
  
  tmDetailSender.textContent = msg.sender;
  tmDetailSubject.textContent = msg.subject;
  tmDetailDate.textContent = msg.date;
  tmDetailBody.innerHTML = msg.body;
  
  tmInboxView.style.display = 'none';
  tmDetailView.style.display = 'flex';
}

function closeEmailDetail() {
  tmDetailView.style.display = 'none';
  tmInboxView.style.display = 'flex';
}

// Event Listeners
if (tmCreateInitBtn) {
  tmCreateInitBtn.addEventListener('click', () => {
    tmCreateInitBtn.style.display = 'none';
    tmInputContainer.style.display = 'flex';
    tmSubmitBtn.style.display = 'block';
    tmCustomInput.focus();
  });
}

if (tmSubmitBtn) {
  tmSubmitBtn.addEventListener('click', () => {
    const customName = tmCustomInput.value.trim();
    let finalAddress = '';
    if (customName) {
      finalAddress = customName + '@xkatsura.com';
    } else {
      finalAddress = generateRandomAddress();
    }
    
    setAddressAndStart(finalAddress);
    closeEmailDetail();
    
    // Move to active state
    tmInputContainer.style.display = 'none';
    tmSubmitBtn.style.display = 'none';
    
    tmAddressContainer.style.display = 'flex';
    tmGenerateNewBtn.style.display = 'block';
    
    tmCustomInput.value = '';
  });
}

if (tmGenerateNewBtn) {
  tmGenerateNewBtn.addEventListener('click', () => {
    // Go back to input state
    tmAddressContainer.style.display = 'none';
    tmGenerateNewBtn.style.display = 'none';
    
    tmInputContainer.style.display = 'flex';
    tmSubmitBtn.style.display = 'block';
    tmCustomInput.focus();
  });
}

if (tmCopyBtn) {
  tmCopyBtn.addEventListener('click', () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress).then(() => {
      const icon = tmCopyBtn.innerHTML;
      tmCopyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      setTimeout(() => {
        tmCopyBtn.innerHTML = icon;
      }, 2000);
    });
  });
}

if (tmBackToInbox) {
  tmBackToInbox.addEventListener('click', closeEmailDetail);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  tmAddress.textContent = '...';
  renderInbox();
  tmCountdown.textContent = '--';
});

// Mobile Warning Overlay Logic
const mobileWarningOverlay = document.getElementById('mobile-warning-overlay');
const mobileWarningDismiss = document.getElementById('mobile-warning-dismiss');

if (mobileWarningOverlay && mobileWarningDismiss) {
  if (sessionStorage.getItem('mobileWarningDismissed') === 'true') {
    mobileWarningOverlay.classList.add('hidden');
  }

  mobileWarningDismiss.addEventListener('click', () => {
    mobileWarningOverlay.classList.add('hidden');
    sessionStorage.setItem('mobileWarningDismissed', 'true');
  });
}
