<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accessible Tabs (Object-Driven)</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="container">
    <h1>Accessible Tabs with ARIA</h1>
    <p class="intro">
      Navigate with <kbd>←</kbd> <kbd>→</kbd> arrow keys, or click.
    </p>

    <div id="live-status" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></div>

    <div class="tabs">
      <div role="tablist" aria-label="Account settings" class="tablist"></div>
      <div id="panels"></div>
    </div>
  </main>

  <script>
    (() => {
  // ---- 1. DATA: each tab is an object ----
  const TABS_DATA = [
    {
      id: 'profile',
      label: 'Profile',
      content: `
        <h2>Profile</h2>
        <p>Update your name, photo, and public bio here.</p>
        <label>Display name <input type="text" value="Jane Doe" /></label>
      `,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: `
        <h2>Notifications</h2>
        <p>Choose what you want to be notified about.</p>
        <label><input type="checkbox" checked /> Email me about updates</label><br />
        <label><input type="checkbox" /> SMS alerts</label>
      `,
    },
    {
      id: 'security',
      label: 'Security',
      content: `
        <h2>Security</h2>
        <p>Manage passwords and two-factor authentication.</p>
        <button type="button">Enable 2FA</button>
      `,
    },
    {
      id: 'billing',
      label: 'Billing',
      content: `
        <h2>Billing</h2>
        <p>View invoices and update your payment method.</p>
        <button type="button">Download last invoice</button>
      `,
    },
  ];

  // ---- 2. STATE: a single object tracking the widget ----
  const state = {
    tabs: TABS_DATA,
    activeIndex: 0,
  };

  // ---- 3. RENDER: build DOM from the data ----
  const tablist = document.querySelector('[role="tablist"]');
  const panelsContainer = document.getElementById('panels');
  const liveStatus = document.getElementById('live-status');

  function render() {
    // Clear old content
    tablist.innerHTML = '';
    panelsContainer.innerHTML = '';

    state.tabs.forEach((tab, i) => {
      const isActive = i === state.activeIndex;

      // --- Tab button ---
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.id = `tab-${tab.id}`;
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('aria-controls', `panel-${tab.id}`);
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      btn.textContent = tab.label;
      btn.addEventListener('click', () => setActive(i));

      // --- Panel ---
      const panel = document.createElement('div');
      panel.setAttribute('role', 'tabpanel');
      panel.id = `panel-${tab.id}`;
      panel.setAttribute('aria-labelledby', `tab-${tab.id}`);
      panel.setAttribute('tabindex', '0');
      panel.className = 'panel';
      panel.innerHTML = tab.content;
      panel.hidden = !isActive;

      tablist.appendChild(btn);
      panelsContainer.appendChild(panel);
    });
  }

  // ---- 4. UPDATE: only flip the ARIA state + visibility ----
  function setActive(index, { focus = true, announce = true } = {}) {
    if (index === state.activeIndex) return;

    const tabs = tablist.querySelectorAll('[role="tab"]');
    const panels = panelsContainer.querySelectorAll('[role="tabpanel"]');

    state.activeIndex = index;

    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      panels[i].hidden = !selected;
    });

    if (focus) tabs[index].focus();
    if (announce) {
      liveStatus.textContent = `${state.tabs[index].label} tab selected`;
    }
  }

  // ---- 5. KEYBOARD (unchanged, but reads from state) ----
  tablist.addEventListener('keydown', (event) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    let next = null;
    switch (event.key) {
      case 'ArrowRight': next = (currentIndex + 1) % tabs.length; break;
      case 'ArrowLeft':  next = (currentIndex - 1 + tabs.length) % tabs.length; break;
      case 'Home':       next = 0; break;
      case 'End':        next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(next);
  });

  // ---- 6. BOOT ----
  render();
})();
  </script>
</body>
</html>