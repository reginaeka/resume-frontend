document.addEventListener('DOMContentLoaded', async () => {
  const app = window.ResumeApp;
  const root = document.getElementById('cv-document');

  function section(title) {
    const wrapper = app.element('section', 'cv-section');
    wrapper.append(app.element('h2', '', title));
    return wrapper;
  }

  try {
    const data = await app.loadResume();
    const profile = data.profile || {};
    root.replaceChildren();

    const header = app.element('header', 'cv-header');
    header.append(app.element('h1', '', profile.name || ''));
    header.append(app.element('p', 'cv-role', profile.role || ''));
    const contact = app.element('p', 'cv-contact');
    const values = [profile.city, profile.phone, profile.website].filter(Boolean);
    (data.socialLinks || []).filter((item) => item.type === 'email' || item.type === 'linkedin').forEach((item) => values.push(item.href));
    contact.textContent = values.join(' | ');
    header.append(contact);
    root.append(header);

    const summary = section('Professional Summary');
    summary.append(app.element('p', '', profile.summaryEn || ''));
    root.append(summary);

    const skills = section('Core Skills');
    skills.append(app.element('p', '', (data.skills || []).map((skill) => skill.name).join(' • ')));
    root.append(skills);

    const experienceSection = section('Professional Experience');
    (data.experiences || []).forEach((experience) => {
      const item = app.element('article', 'cv-item');
      const titleRow = app.element('div', 'cv-title-row');
      titleRow.append(app.element('h3', '', experience.role || experience.company));
      titleRow.append(app.element('span', '', `${experience.startDate || ''} – ${experience.endDate || ''}`));
      item.append(titleRow, app.element('p', 'cv-company', `${experience.company}${experience.location ? ` | ${experience.location}` : ''}`));
      const list = app.element('ul');
      const highlights = app.descriptionSentences(experience.description).slice(0, 6);
      if (highlights.length) {
        highlights.forEach((highlight) => list.append(app.element('li', '', highlight)));
      } else {
        (experience.projects || []).slice(0, 6).forEach((project) => {
          const descriptions = app.descriptionSentences(project.description);
          const prefix = project.projectLocation ? `${project.projectLocation}: ` : '';
          list.append(app.element('li', '', `${prefix}${descriptions.join(' ')}`));
        });
      }
      item.append(list); experienceSection.append(item);
    });
    root.append(experienceSection);

    const education = section('Education');
    (data.education || []).forEach((entry) => {
      const item = app.element('article', 'cv-item cv-education');
      const row = app.element('div', 'cv-title-row');
      row.append(app.element('h3', '', entry.degree), app.element('span', '', `${entry.startYear || ''} – ${entry.endYear || ''}`));
      item.append(row, app.element('p', 'cv-company', entry.school));
      if (entry.thesis) item.append(app.element('p', '', entry.thesis));
      education.append(item);
    });
    root.append(education);

    document.getElementById('print-cv').addEventListener('click', () => window.print());
    if (new URLSearchParams(window.location.search).get('print') === '1') window.setTimeout(() => window.print(), 400);
  } catch (error) {
    root.replaceChildren(app.element('p', 'cv-error', 'CV data is currently unavailable.'));
    console.error(error);
  }
});
