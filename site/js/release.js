window.LAG2_RELEASE = {version: '0.1.0', repository: 'https://github.com/asadbek31415-alt/lag2-course'};
document.addEventListener('DOMContentLoaded', () => {
  const info = window.LAG2_RELEASE;
  document.querySelectorAll('.course-version').forEach(el => el.textContent = 'v' + info.version);
  try {
    const previous = localStorage.getItem('lag2-seen-version');
    const notice = document.getElementById('release-notice');
    if (previous && previous !== info.version && notice) {
      notice.hidden = false;
      const text = document.createElement('span'); text.textContent = 'LAG2 v' + info.version + ' is now available. ';
      const link = document.createElement('a'); link.href = info.repository + '/releases/latest'; link.textContent = 'See changes and downloads'; link.target = '_blank'; link.rel = 'noopener';
      const dismiss = document.createElement('button'); dismiss.type = 'button'; dismiss.textContent = 'Dismiss'; dismiss.addEventListener('click', () => notice.hidden = true);
      notice.append(text, link, dismiss);
    }
    localStorage.setItem('lag2-seen-version', info.version);
  } catch (_) {}
});
