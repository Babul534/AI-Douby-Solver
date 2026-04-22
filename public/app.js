/* ===== State ===== */
let currentAnswer = '';
let currentQuestion = '';
let currentSubject = '';
let photoFile = null;
let isListening = false;
let speechSynth = window.speechSynthesis;
let utterance = null;
let currentLanguage = 'hi'; // Add current language variable

/* ===== DOM References ===== */
const subjectEl = document.getElementById('subject');
const questionInput = document.getElementById('questionInput');
const speakBtn = document.getElementById('speakBtn');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const previewImg = document.getElementById('previewImg');
const removePhotoBtn = document.getElementById('removePhoto');
const getAnswerBtn = document.getElementById('getAnswerBtn');
const loadingEl = document.getElementById('loading');
const loadingDots = document.getElementById('loadingDots');
const answerCard = document.getElementById('answerCard');
const extractedQ = document.getElementById('extractedQ');
const extractedText = document.getElementById('extractedText');
const answerContent = document.getElementById('answerContent');
const listenBtn = document.getElementById('listenBtn');
const stopListenBtn = document.getElementById('stopListenBtn');
const saveDoubtBtn = document.getElementById('saveDoubtBtn');
const saveMsg = document.getElementById('saveMsg');
const savedDoubtsContainer = document.getElementById('savedDoubtsContainer');
const clearAllBtn = document.getElementById('clearAllBtn');

/* ===== Loading Dots Animation ===== */
let dotsInterval;
function startLoadingDots() {
  let count = 0;
  dotsInterval = setInterval(() => {
    count = (count + 1) % 4;
    loadingDots.textContent = '.'.repeat(count + 1);
  }, 500);
}
function stopLoadingDots() { clearInterval(dotsInterval); }

/* ===== Photo Upload ===== */
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  photoFile = file;
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  photoPreview.classList.remove('hidden');
  questionInput.placeholder = 'Photo upload ho gayi! Chaaho toh alag question bhi likh sakte ho...';
});

removePhotoBtn.addEventListener('click', () => {
  photoFile = null;
  photoInput.value = '';
  previewImg.src = '';
  photoPreview.classList.add('hidden');
  questionInput.placeholder = 'Yahan apna question likhiye... jaise: Newton ka pehla niyam kya hai?';
});

/* ===== Speech Recognition (Voice Input) ===== */
speakBtn.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const messages = {
      'hi': 'Aapka browser voice input support nahi karta. Chrome use karo!',
      'te': 'మీ బ్రౌజర్లో వాయిస్ ఇన్‌పుడు లేదు. Chrome ఉపయోగించండి!',
      'en': 'Your browser does not support voice input. Please use Chrome!'
    };
    alert(messages[currentLanguage || 'hi']);
    return;
  }

  if (isListening) return;

  const recognition = new SpeechRecognition();
  const langCode = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-US';
  recognition.lang = langCode;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    speakBtn.classList.add('recording');
    const messages = {
      'hi': 'Sun raha hoon...',
      'te': 'వినిస్తుందుకుండు...',
      'en': 'Listening...'
    };
    speakBtn.querySelector('span:last-child').textContent = messages[currentLanguage || 'hi'];
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(r => r[0].transcript)
      .join('');
    questionInput.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Speech error:', event.error);
    if (event.error === 'not-allowed') {
      const messages = {
        'hi': 'Microphone permission do browser ko.',
        'te': 'మైక్రోఫోన్ అనుమతి తిరస్కరించబడింది.',
        'en': 'Please allow microphone access in your browser settings.'
      };
      alert(messages[currentLanguage || 'hi']);
    }
    resetSpeakBtn();
  };

  recognition.onend = () => { resetSpeakBtn(); };

  recognition.start();
});

function resetSpeakBtn() {
  isListening = false;
  speakBtn.classList.remove('recording');
  speakBtn.querySelector('span:last-child').textContent = 'Speak Doubt';
}

/* ===== Get Answer ===== */
getAnswerBtn.addEventListener('click', async () => {
  const subject = subjectEl.value;
  const question = questionInput.value.trim();

  if (!subject) {
    shakeElement(subjectEl.parentElement);
    const messages = {
      'hi': 'Pehle subject chunno!',
      'te': 'ముందుగా ఎండుండి!',
      'en': 'Please select a subject first!'
    };
    alert(messages[currentLanguage] || 'Pehle subject chunno!');
    return;
  }

  if (!photoFile && !question) {
    shakeElement(questionInput);
    const messages = {
      'hi': 'Doubt likhna zaroori hai ya photo upload karo!',
      'te': 'సందేహాన్ రాయాణం అవసరం ఫోటో లేదా ఫోటో!',
      'en': 'Please write your doubt or upload a photo!'
    };
    alert(messages[currentLanguage] || 'Doubt likhna zaroori hai ya photo upload karo!');
    return;
  }

  setLoading(true);
  answerCard.classList.add('hidden');
  extractedQ.classList.add('hidden');

  try {
    let data;

    if (photoFile) {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          const base64 = result.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });

      const res = await fetch('/api/ask-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject, 
          image: base64Image, 
          mimeType: photoFile.type 
        })
      });
      data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Server error');

      if (data.extractedQuestion) {
        extractedText.textContent = data.extractedQuestion;
        extractedQ.classList.remove('hidden');
        currentQuestion = data.extractedQuestion;
      }
    } else {
      const res = await fetch('/api/ask-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, question })
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      currentQuestion = question;
    }

    currentAnswer = data.answer;
    currentSubject = subject;

    answerContent.textContent = data.answer;
    answerCard.classList.remove('hidden');
    saveMsg.classList.add('hidden');

    answerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    const messages = {
      'hi': 'Error: ' + err.message,
      'te': 'లోపం: ' + err.message,
      'en': 'Error: ' + err.message
    };
    alert(messages[currentLanguage] || 'Error: ' + err.message);
  } finally {
    setLoading(false);
  }
});

function setLoading(state) {
  if (state) {
    loadingEl.classList.remove('hidden');
    getAnswerBtn.disabled = true;
    getAnswerBtn.style.opacity = '0.7';
    startLoadingDots();
  } else {
    loadingEl.classList.add('hidden');
    getAnswerBtn.disabled = false;
    getAnswerBtn.style.opacity = '1';
    stopLoadingDots();
  }
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

/* ===== Text-to-Speech ===== */
listenBtn.addEventListener('click', () => {
  if (!currentAnswer) return;
  speechSynth.cancel();

  utterance = new SpeechSynthesisUtterance(currentAnswer);
  const langCode = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-US';
  utterance.lang = langCode;
  utterance.rate = 0.9;
  utterance.pitch = 1;

  const voices = speechSynth.getVoices();
  const selectedVoice = voices.find(v => v.lang.startsWith(currentLanguage === 'hi' ? 'hi' : currentLanguage === 'te' ? 'te' : 'en'));
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.onstart = () => {
    listenBtn.classList.add('hidden');
    stopListenBtn.classList.remove('hidden');
  };

  utterance.onend = utterance.onerror = () => {
    listenBtn.classList.remove('hidden');
    stopListenBtn.classList.add('hidden');
  };

  speechSynth.speak(utterance);
});

stopListenBtn.addEventListener('click', () => {
  speechSynth.cancel();
  listenBtn.classList.remove('hidden');
  stopListenBtn.classList.add('hidden');
});

/* ===== Save Doubt ===== */
saveDoubtBtn.addEventListener('click', () => {
  if (!currentAnswer || !currentQuestion) return;

  const saved = getSavedDoubts();
  const entry = {
    id: Date.now(),
    subject: currentSubject,
    question: currentQuestion,
    answer: currentAnswer,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  saved.unshift(entry);
  localStorage.setItem('aiDoubtSolver_saved', JSON.stringify(saved));

  saveMsg.classList.remove('hidden');
  setTimeout(() => saveMsg.classList.add('hidden'), 2500);

  renderSavedDoubts();
});

/* ===== LocalStorage Helpers ===== */
function getSavedDoubts() {
  try {
    return JSON.parse(localStorage.getItem('aiDoubtSolver_saved') || '[]');
  } catch {
    return [];
  }
}

function deleteSavedDoubt(id) {
  const saved = getSavedDoubts().filter(d => d.id !== id);
  localStorage.setItem('aiDoubtSolver_saved', JSON.stringify(saved));
  renderSavedDoubts();
}

clearAllBtn.addEventListener('click', () => {
  const messages = {
    'hi': 'Kya sach mein sab saved doubts delete karna chahte ho?',
    'te': 'నిజరిల సంది అన్ని సంవే డబ్ట్లో తొలగ్లా?',
    'en': 'Are you sure you want to delete all saved doubts?'
  };
  if (!confirm(messages[currentLanguage] || 'Kya sach mein sab saved doubts delete karna chahte ho?')) return;
  localStorage.removeItem('aiDoubtSolver_saved');
  renderSavedDoubts();
});

/* ===== Render Saved Doubts ===== */
function renderSavedDoubts() {
  const saved = getSavedDoubts();

  if (saved.length === 0) {
    const messages = {
      'hi': 'Abhi koi saved doubt nahi hai. Pehle koi doubt solve karo!',
      'te': 'ఇంటి సంవే సందే సంవే అయింది. ముందుగా సందే సంవే ప్రయత్నించండి!',
      'en': 'No saved doubts yet. Please solve some doubts first!'
    };
    savedDoubtsContainer.innerHTML = `<p class="empty-state">${messages[currentLanguage] || 'Abhi koi saved doubt nahi hai. Pehle koi doubt solve karo!'}</p>`;
    return;
  }

  savedDoubtsContainer.innerHTML = saved.map(d => `
    <div class="saved-item" id="saved-${d.id}">
      <div class="saved-item-header" onclick="toggleSavedItem(${d.id})">
        <span class="saved-subject">${escHtml(d.subject)}</span>
        <span class="saved-question">${escHtml(d.question.substring(0, 70))}${d.question.length > 70 ? '...' : ''}</span>
        <span class="saved-date">${escHtml(d.date)}</span>
      </div>
      <div class="saved-item-body" id="body-${d.id}">
        <div class="saved-answer">${escHtml(d.answer)}</div>
        <div class="saved-item-footer">
          <button class="btn-delete-saved" onclick="deleteSavedDoubt(${d.id})">🗑 Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleSavedItem(id) {
  const body = document.getElementById(`body-${id}`);
  if (body) body.classList.toggle('open');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ===== CSS Shake Animation ===== */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ===== Init ===== */
renderSavedDoubts();

if (speechSynth.onvoiceschanged !== undefined) {
  speechSynth.onvoiceschanged = () => {};
}
