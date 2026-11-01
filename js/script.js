/**
 * WOOG MO YANG | Vice President | NOVATERRA GLOBAL
 * Mobile Business Card Interactions (Vanilla JavaScript)
 */

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Mobile viewport height fix for mobile browsers
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOriginalModalDirect();
      closeQRModalDirect();
    }
  });
});

/**
 * 0. Open KakaoTalk App & Copy Account
 * Launches KakaoTalk app on mobile and copies the ID/email to clipboard for instant search/add
 */
function openKakaoTalk(account = 'wm11@kakao.com') {
  // Copy KakaoTalk account to clipboard
  copyToClipboard(account, 'KakaoTalk account copied: ' + account);

  // Check if mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    // Attempt to launch KakaoTalk app scheme
    setTimeout(() => {
      window.location.href = 'kakaotalk://';
    }, 300);
  } else {
    // On desktop, open Kakao website or alert
    setTimeout(() => {
      showToast('KakaoTalk account copied: ' + account);
    }, 100);
  }
}

/**
 * 1. Download vCard (vCard 3.0) directly to phone's address book
 */
function downloadVCard() {
  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N;CHARSET=UTF-8:YANG;WOOG MO;;;',
    'FN;CHARSET=UTF-8:WOOG MO YANG',
    'ORG;CHARSET=UTF-8:NOVATERRA GLOBAL Co., Ltd.',
    'TITLE;CHARSET=UTF-8:Vice President',
    'TEL;TYPE=CELL,VOICE:+821077692515',
    'EMAIL;TYPE=WORK,INTERNET:od@novaterraglobal.co.kr',
    'URL:http://www.novaterraglobal.co.kr',
    'ADR;TYPE=WORK;CHARSET=UTF-8:;;124, 5, Beobwon-ro 4-gil, Songpa-gu;Seoul;;05855;Korea',
    'X-KAKAO:https://open.kakao.com/o/snLq99Ui',
    'NOTE;CHARSET=UTF-8:KakaoTalk 1:1 Chat: https://open.kakao.com/o/snLq99Ui (wm11@kakao.com) | GLOBAL BUSINESS PARTNER - NOVATERRA GLOBAL',
    'END:VCARD'
  ].join('\r\n');

  // Create UTF-8 Blob
  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Virtual link trigger download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'WOOG_MO_YANG_NOVATERRA.vcf');
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Contact file downloaded. Add to your contacts.');
  }, 150);
}

/**
 * 2. Copy to Clipboard
 * @param {string} text - text to copy
 * @param {string} message - toast message
 */
function copyToClipboard(text, message = 'Copied to clipboard.') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(message))
      .catch(() => fallbackCopy(text, message));
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    showToast(message);
  } catch (err) {
    showToast('Failed to copy. Please select and copy manually.');
  }

  document.body.removeChild(textArea);
}

/**
 * 3. Toast Notification
 */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');

  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/**
 * 4. Share Business Card
 */
function shareBusinessCard() {
  const shareData = {
    title: 'WOOG MO YANG | Vice President - NOVATERRA GLOBAL',
    text: 'Digital Business Card of WOOG MO YANG (Vice President at NOVATERRA GLOBAL)',
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('Share successful'))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          copyToClipboard(window.location.href, 'Card link copied to clipboard.');
        }
      });
  } else {
    copyToClipboard(window.location.href, 'Card link copied to clipboard.');
  }
}

/**
 * 5. Original Business Card Modal
 */
function openOriginalModal() {
  const modal = document.getElementById('originalModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeOriginalModalDirect() {
  const modal = document.getElementById('originalModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeOriginalModal(event) {
  if (event.target.id === 'originalModal') {
    closeOriginalModalDirect();
  }
}

/**
 * 6. QR Code Modal
 */
function openQRModal() {
  const modal = document.getElementById('qrModal');
  const qrImage = document.getElementById('qrImage');

  if (modal && qrImage) {
    const targetUrl = encodeURIComponent(window.location.href);
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${targetUrl}&margin=5`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeQRModalDirect() {
  const modal = document.getElementById('qrModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeQRModal(event) {
  if (event.target.id === 'qrModal') {
    closeQRModalDirect();
  }
}
