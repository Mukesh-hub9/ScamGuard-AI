const messageInput = document.getElementById('messageInput');
const urlInput = document.getElementById('urlInput');
const messageResult = document.getElementById('messageResult');
const urlResult = document.getElementById('urlResult');
const tipDisplay = document.getElementById('tipDisplay');

const safetyTips = [
  'If a message asks for OTPs or passwords, treat it as a red flag. Real services never request these over SMS or chat.',
  'Always check the link preview or domain before clicking. Scammers often use fake subdomains or hidden URLs.',
  'When a message pressures you with urgent language, pause and verify by contacting the company directly.',
  'Trust official apps and websites only. Do not install unknown applications shared via unexpected links.',
  'Keep your device software updated so security protections can spot unsafe pages and installations.',
];

const messageRules = [
  { label: 'Reward promise', keywords: ['win', 'congratulations', 'claim reward', 'prize', 'lottery', 'cash'] },
  { label: 'Urgent action', keywords: ['urgent', 'immediately', 'act now', 'last chance', 'expires soon'] },
  { label: 'Verification request', keywords: ['verify account', 'confirm password', 'validate your', 'update payment', 'security check'] },
  { label: 'OTP request', keywords: ['otp', 'one time password', 'verification code', 'pin'] },
  { label: 'Link or button', keywords: ['click here', 'visit link', 'follow this', 'login now', 'update now'] },
];

const urlRules = [
  { label: 'Long or hidden URL', test: url => url.length > 80 },
  { label: 'IP address link', test: url => /^(https?:\/\/)?\d+\.\d+\.\d+\.\d+/.test(url) },
  { label: 'Suspicious keywords', test: url => /(login|secure|verify|update|account|banking|confirm)/i.test(url) },
  { label: 'At sign usage', test: url => /@/.test(url) },
  { label: 'Unusual punctuation', test: url => /\/\//.test(url) && /@|%20|%5C/.test(url) },
];

function showMessageResult(html) {
  messageResult.innerHTML = html;
}

function showURLResult(html) {
  urlResult.innerHTML = html;
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function analyzeMessage() {
  const text = normalizeText(messageInput.value);
  if (!text) {
    showMessageResult('<strong style="color: #f8b86f;">Enter a message to analyze.</strong>');
    return;
  }

  const lowerText = text.toLowerCase();
  const hits = [];
  let score = 0;

  messageRules.forEach(rule => {
    const matched = rule.keywords.some(keyword => lowerText.includes(keyword));
    if (matched) {
      hits.push(rule.label);
      score += 22;
    }
  });

  if (/\b(https?:\/\/|www\.)/i.test(text)) {
    hits.push('Contains a link');
    score += 15;
  }

  if (/\b(loan|refund|invoice|bank|account|password)\b/i.test(text)) {
    hits.push('Financial or account request');
    score += 18;
  }

  if (/\b(urgent|immediately|now|asap)\b/i.test(text)) {
    hits.push('High urgency wording');
    score += 12;
  }

  if (/\b(otp|password|verification code|pin)\b/i.test(text)) {
    hits.push('Requests sensitive code');
    score += 18;
  }

  const finalScore = Math.min(100, score);
  let risk = 'Low risk';
  let color = '#43c6ac';
  if (finalScore >= 60) {
    risk = 'High risk';
    color = '#f45d79';
  } else if (finalScore >= 30) {
    risk = 'Medium risk';
    color = '#f8b86f';
  }

  const uniqueHits = [...new Set(hits)];
  const detailsHtml = uniqueHits.length
    ? `<ul>${uniqueHits.map(item => `<li>${item}</li>`).join('')}</ul>`
    : '<p>No obvious scam indicators found, but stay cautious.</p>';

  showMessageResult(`
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
      <div>
        <p style="margin: 0.2rem 0 0; color: var(--muted);">Message risk score</p>
        <h3 style="margin: 0.35rem 0 0; color: ${color};">${risk}</h3>
      </div>
      <div style="font-size: 2rem; font-weight: 800; color: ${color};">${finalScore}%</div>
    </div>
    <div style="margin-top: 18px; line-height: 1.75; color: var(--text);">${detailsHtml}</div>
    <div style="margin-top: 16px; color: var(--muted);">${finalScore >= 60 ? 'Do not click any links or share personal information. Contact the sender from an official channel.' : 'The message appears less suspicious, but remain careful before replying or clicking links.'}</div>
  `);
}

function getUrlDetails(value) {
  try {
    const url = value.trim();
    const normalized = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    return new URL(normalized);
  } catch (error) {
    return null;
  }
}

function checkURLSafety() {
  const value = urlInput.value.trim();
  if (!value) {
    showURLResult('<strong style="color: #f8b86f;">Enter a URL to check.</strong>');
    return;
  }

  const parsed = getUrlDetails(value);
  if (!parsed) {
    showURLResult('<strong style="color: #f45d79;">The URL is not valid. Check for typos or missing protocol.</strong>');
    return;
  }

  const hits = [];
  let score = 0;
  const href = parsed.href;
  const host = parsed.host.toLowerCase();

  urlRules.forEach(rule => {
    if (rule.test(href)) {
      hits.push(rule.label);
      score += 18;
    }
  });

  if (/(\.xyz|\.top|\.club|\.online|\.vip)$/i.test(host)) {
    hits.push('Unusual domain extension');
    score += 12;
  }

  if (host.split('.').length > 3) {
    hits.push('Long or deceptive subdomain');
    score += 10;
  }

  const finalScore = Math.min(100, score);
  let risk = 'Likely safe';
  let color = '#43c6ac';
  if (finalScore >= 60) {
    risk = 'Likely unsafe';
    color = '#f45d79';
  } else if (finalScore >= 30) {
    risk = 'Potentially risky';
    color = '#f8b86f';
  }

  const uniqueHits = [...new Set(hits)];
  const detailsHtml = uniqueHits.length
    ? `<ul>${uniqueHits.map(item => `<li>${item}</li>`).join('')}</ul>`
    : '<p>No suspicious markers detected. Still verify the sender before you proceed.</p>';

  showURLResult(`
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
      <div>
        <p style="margin: 0.2rem 0 0; color: var(--muted);">URL risk indicator</p>
        <h3 style="margin: 0.35rem 0 0; color: ${color};">${risk}</h3>
      </div>
      <div style="font-size: 2rem; font-weight: 800; color: ${color};">${finalScore}%</div>
    </div>
    <div style="margin-top: 18px; line-height: 1.75; color: var(--text);">${detailsHtml}</div>
    <div style="margin-top: 16px; color: var(--muted);">${finalScore >= 60 ? 'Do not open this link in your browser. Confirm the source and type the valid site address manually if needed.' : 'This link looks safer, but double-check the sender and the page before entering private data.'}</div>
  `);
}

function clearMessage() {
  messageInput.value = '';
  showMessageResult('');
}

function clearURL() {
  urlInput.value = '';
  showURLResult('');
}

function pickTip() {
  const nextTip = safetyTips[Math.floor(Math.random() * safetyTips.length)];
  tipDisplay.textContent = nextTip;
}

document.getElementById('analyzeBtn').addEventListener('click', analyzeMessage);
document.getElementById('clearMsgBtn').addEventListener('click', clearMessage);
document.getElementById('urlCheckBtn').addEventListener('click', checkURLSafety);
document.getElementById('clearUrlBtn').addEventListener('click', clearURL);
document.getElementById('tipBtn').addEventListener('click', pickTip);
