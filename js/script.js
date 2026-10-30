/**
 * 양욱모 부회장 모바일 명함 인터랙션 스크립트 (Vanilla JavaScript)
 * 
 * 주요 기능:
 * 1. 스마트폰 연락처 바로 저장 (vCard .vcf 동적 생성 및 다운로드)
 * 2. 원클릭 클립보드 복사 (전화번호, 이메일, 주소 등) & 안내 토스트 팝업
 * 3. 스마트폰 모바일 명함 공유하기 (Web Share API 및 URL 복사)
 * 4. 원본 실물 명함 이미지 확대 팝업 모달
 * 5. 현장 전달용 QR 코드 모달 생성
 */

// 문서 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 모바일 뷰포트 높이 보정 (iOS 사파리 등의 상/하단 바 계산 오류 방지)
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);

  // ESC 키 누를 때 열려있는 모든 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOriginalModalDirect();
      closeQRModalDirect();
    }
  });
});

/**
 * 1. 스마트폰 연락처에 바로 저장 (vCard 3.0 다운로드)
 * 사용자가 버튼을 누르면 스마트폰의 연락처 앱이 열려 즉시 저장할 수 있습니다.
 */
function downloadVCard() {
  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N;CHARSET=UTF-8:양;욱모;;;',
    'FN;CHARSET=UTF-8:양욱모 부회장',
    'ORG;CHARSET=UTF-8:주식회사 노바테라글로벌;NOVATERRA GLOBAL',
    'TITLE;CHARSET=UTF-8:부회장 (Vice Chairman)',
    'TEL;TYPE=CELL,VOICE:+821077692515',
    'EMAIL;TYPE=WORK,INTERNET:od@novaterraglobal.co.kr',
    'URL:http://www.novaterraglobal.co.kr',
    'ADR;TYPE=WORK;CHARSET=UTF-8:;;서울시 송파구 법원로4길 5 124호;Seoul;;05855;Korea',
    'NOTE;CHARSET=UTF-8:GLOBAL BUSINESS PARTNER - 노바테라글로벌',
    'END:VCARD'
  ].join('\r\n');

  // Blob 객체 생성 (UTF-8 인코딩)
  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // 가상 링크를 생성하여 다운로드 실행
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '양욱모_부회장_노바테라글로벌.vcf');
  document.body.appendChild(link);
  link.click();

  // 메모리 정리
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('연락처 파일이 다운로드되었습니다. 스마트폰 전화번호부에 추가해주세요.');
  }, 150);
}

/**
 * 2. 클립보드 복사 함수 (전화번호, 주소, 계좌 등)
 * 최신 Clipboard API와 구형 브라우저 대응 execCommand를 함께 지원합니다.
 * @param {string} text - 복사할 문자열
 * @param {string} message - 복사 후 나타낼 알림 문구
 */
function copyToClipboard(text, message = '클립보드에 복사되었습니다.') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(message))
      .catch(() => fallbackCopy(text, message));
  } else {
    fallbackCopy(text, message);
  }
}

// 구형 브라우저용 클립보드 복사 보조 함수
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
    showToast('복사에 실패했습니다. 직접 선택하여 복사해주세요.');
  }

  document.body.removeChild(textArea);
}

/**
 * 3. 토스트 알림창 띄우기
 * 화면 하단에 2.5초 동안 부드럽게 나타났다가 사라집니다.
 * @param {string} message - 표시할 텍스트
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
 * 4. 모바일 명함 공유하기
 * 스마트폰의 경우 카카오톡, 메시지 등으로 바로 공유하는 네이티브 공유창을 띄우고,
 * PC 브라우저의 경우 웹페이지 주소를 클립보드에 복사해줍니다.
 */
function shareBusinessCard() {
  const shareData = {
    title: '양욱모 부회장 모바일 명함 | 노바테라글로벌',
    text: '주식회사 노바테라글로벌 양욱모 부회장의 디지털 모바일 명함입니다.',
    url: window.location.href
  };

  // 모바일 기기의 네이티브 공유 창 지원 여부 확인
  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('공유 성공'))
      .catch((err) => {
        // 사용자가 취소한 것이 아닐 경우 복사로 전환
        if (err.name !== 'AbortError') {
          copyToClipboard(window.location.href, '모바일 명함 링크가 복사되었습니다.');
        }
      });
  } else {
    // PC 또는 미지원 환경에서는 URL 자동 복사
    copyToClipboard(window.location.href, '모바일 명함 주소가 복사되었습니다. 원하는 곳에 붙여넣기 하세요.');
  }
}

/**
 * 5. 원본 실물 명함 확대 모달 제어
 */
function openOriginalModal() {
  const modal = document.getElementById('originalModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
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
  // 모달 윈도우 내부 클릭 시 닫히지 않고, 어두운 바깥 배경 클릭 시에만 닫힘
  if (event.target.id === 'originalModal') {
    closeOriginalModalDirect();
  }
}

/**
 * 6. QR 코드 모달 제어 (현장에서 상대방에게 명함 찍어줄 때 사용)
 */
function openQRModal() {
  const modal = document.getElementById('qrModal');
  const qrImage = document.getElementById('qrImage');

  if (modal && qrImage) {
    // 현재 URL 또는 공식 사이트 URL을 QR 코드로 생성
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

