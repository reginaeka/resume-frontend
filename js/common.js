(function createResumeApp() {
  let resumePromise;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function safeHref(value, type) {
    const raw = String(value || '').trim();
    if (type === 'email' && raw && !raw.startsWith('mailto:')) return `mailto:${raw}`;
    if (/^(https?:|mailto:)/i.test(raw)) return raw;
    return '#';
  }

  function assetUrl(value, fallback) {
    const raw = String(value || fallback || '').trim();
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    return raw.startsWith('/') ? raw : `/${raw}`;
  }

  function calculateAge(dateValue) {
    const match = String(dateValue || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const birthDate = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age -= 1;
    return age;
  }

  function descriptionSentences(value) {
    return String(value || '')
      .split(/\r?\n|\.\s+(?=[A-Z0-9])|\.$/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .map((sentence) => /[.!?]$/.test(sentence) ? sentence : `${sentence}.`);
  }

  async function loadResume() {
    if (!resumePromise) {
      resumePromise = window.ResumeAPI.getResume().catch(async (apiError) => {
        console.warn('Using local resume fallback:', apiError.message);
        const response = await fetch(window.RESUME_CONFIG.FALLBACK_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Resume data is unavailable');
        return response.json();
      });
    }
    return resumePromise;
  }

  function renderHeader(activePage) {
    const root = document.getElementById('site-header');
    if (!root) return;
    const header = element('header', 'header d-flex align-items-center fixed-top');
    header.id = 'header';
    const container = element('div', 'container-fluid container-xl position-relative d-flex align-items-center justify-content-between');
    const logo = element('a', 'logo d-flex align-items-center');
    logo.href = '/';
    logo.append(element('h1', 'sitename', 'Resume'));
    const nav = element('nav', 'navmenu');
    nav.id = 'navmenu';
    const list = element('ul');
    [['home', '/', 'Home'], ['about', '/about/', 'About'], ['resume', '/resume/', 'Resume'], ['contact', '/contact/', 'Contact']]
      .forEach(([key, href, label]) => {
        const item = element('li');
        const link = element('a', key === activePage ? 'active' : '', label);
        link.href = href;
        item.append(link);
        list.append(item);
      });
    nav.append(list, element('i', 'mobile-nav-toggle d-xl-none bi bi-list'));
    container.append(logo, nav);
    header.append(container);
    root.replaceChildren(header);
  }

  function renderFooter(data) {
    const root = document.getElementById('site-footer');
    if (!root) return;
    const profile = data.profile || {};
    const footer = element('footer', 'footer dark-background');
    footer.id = 'footer';
    const container = element('div', 'container');
    container.append(element('h3', 'sitename', profile.name || 'Regina Septianadrah'));
    container.append(element('p', '', profile.footerTagline || profile.aboutIntro || ''));
    const socials = element('div', 'social-links d-flex justify-content-center');
    (data.socialLinks || []).forEach((social) => {
      const link = element('a');
      link.href = safeHref(social.href, social.type);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const icon = element('i', social.icon || 'bi bi-link-45deg');
      link.append(icon);
      socials.append(link);
    });
    const copyright = element('div', 'copyright');
    copyright.append(document.createTextNode(`© ${new Date().getFullYear()} `));
    copyright.append(element('strong', 'px-1 sitename', (profile.name || 'Regina').split(' ')[0]));
    copyright.append(document.createTextNode(' All Rights Reserved'));
    const inner = element('div', 'container');
    inner.append(copyright);
    container.append(socials, inner);
    footer.append(container);
    root.replaceChildren(footer);
  }

  async function initializePage(activePage) {
    renderHeader(activePage);
    const data = await loadResume();
    renderFooter(data);
    return data;
  }

  function finish() {
    document.dispatchEvent(new CustomEvent('resume:rendered'));
  }

  window.ResumeApp = Object.freeze({
    element,
    safeHref,
    assetUrl,
    calculateAge,
    descriptionSentences,
    loadResume,
    initializePage,
    finish,
  });
})();
