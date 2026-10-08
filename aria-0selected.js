document.addEventListener("click", (event) => {
  const clickedTab = event.target.closest('[role="tab"]');
  if (!clickedTab) return;

  const tablist = clickedTab.closest('[role="tablist"]');
  const tabs = tablist.querySelectorAll('[role="tab"]');

  tabs.forEach((tab) => {
    const isSelected = tab === clickedTab;
    tab.setAttribute("aria-selected", isSelected);
    tab.tabIndex = isSelected ? 0 : -1;
  });
});

document.addEventListener("keydown", (event) => {
  const activeTab = document.activeElement;
  if (activeTab.getAttribute("role") !== "tab") return;

  const tablist = activeTab.closest('[role="tablist"]');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const index = tabs.indexOf(activeTab);

  let newIndex = index;
  if (event.key === "ArrowRight") newIndex = (index + 1) % tabs.length;
  if (event.key === "ArrowLeft") newIndex = (index - 1 + tabs.length) % tabs.length;

  if (newIndex !== index) {
    tabs[newIndex].focus();
    tabs[newIndex].click();
  }
});
