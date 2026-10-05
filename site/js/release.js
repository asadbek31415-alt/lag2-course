window.LAG2_RELEASE = {
    version: '1.0.1',
    repository: 'https://github.com/asadbek31415-alt/lag2-course',
    website: 'https://asadbek31415-alt.github.io/lag2-course/'
};
document.addEventListener('DOMContentLoaded', () => {
    const info = window.LAG2_RELEASE;
    const notice = document.getElementById('course-update');
    const message = notice.querySelector('[data-update-message]');
    const link = notice.querySelector('[data-update-link]');
    const dismiss = notice.querySelector('[data-update-dismiss]');
    const isAndroid = window.Capacitor?.getPlatform?.() === 'android';
    let lastCheck = 0;
    let checking = false;
    let dismissedVersion = '';
    document.querySelectorAll('.course-version').forEach(el => el.textContent = 'v' + info.version);

    function showNotice(version, text, href, label) {
        if (dismissedVersion === version) return;
        notice.dataset.version = version;
        message.textContent = text;
        link.href = href;
        link.textContent = label;
        link.target = isAndroid || label === 'Release notes' ? '_blank' : '_self';
        notice.hidden = false;
    }
    dismiss.addEventListener('click', () => {
        dismissedVersion = notice.dataset.version;
        notice.hidden = true;
    });
    try {
        const previous = localStorage.getItem('lag2-seen-version');
        if (previous && previous !== info.version) showNotice(info.version, 'Updated to LAG2 v' + info.version + '.', info.repository + '/releases/tag/v' + info.version, 'Release notes');
        localStorage.setItem('lag2-seen-version', info.version);
    } catch (_) {}

    function newerVersion(candidate, installed) {
        if (!/^\d+\.\d+\.\d+$/.test(candidate)) return false;
        const a = candidate.split('.').map(Number), b = installed.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if (a[i] !== b[i]) return a[i] > b[i];
        }
        return false;
    }
    async function checkUpdates(force = false) {
        if (checking || (!force && Date.now() - lastCheck < 15 * 60 * 1000)) return;
        if (navigator.onLine === false) return;
        checking = true;
        lastCheck = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch('https://api.github.com/repos/asadbek31415-alt/lag2-course/releases/latest', {cache:'no-store', signal:controller.signal});
            if (!response.ok) return;
            const release = await response.json();
            const version = String(release.tag_name || '').replace(/^v/, '');
            if (release.draft || release.prerelease || !newerVersion(version, info.version)) return;
            const assets = Array.isArray(release.assets) ? release.assets : [];
            const apk = assets.find(asset => asset.name === 'LAG2-Android.apk');
            const zip = assets.find(asset => asset.name === 'LAG2-Interactive-Course.zip');
            if (!apk || !zip) return;
            const href = isAndroid
                ? info.repository + '/releases/download/v' + version + '/LAG2-Android.apk'
                : info.website + '?version=' + encodeURIComponent(version) + location.hash;
            showNotice(version, 'LAG2 v' + version + ' is ready.', href, isAndroid ? 'Download Android update' : 'Load new version');
        } catch (_) {
            // Offline study continues without an update prompt or error.
        } finally {
            clearTimeout(timeout);
            checking = false;
        }
    }
    document.addEventListener('visibilitychange', () => {if (!document.hidden) checkUpdates();});
    window.addEventListener('online', () => checkUpdates(true));
    setInterval(() => {if (!document.hidden) checkUpdates();}, 30 * 60 * 1000);
    checkUpdates();
});
