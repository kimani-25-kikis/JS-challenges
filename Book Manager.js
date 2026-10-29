// Get bookmarks from localStorage with validation
function getBookmarks() {
  const stored = localStorage.getItem('bookmarks');
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Validate each bookmark has required keys
    const isValid = parsed.every(bookmark => 
      bookmark !== null &&
      typeof bookmark === 'object' &&
      typeof bookmark.name === 'string' &&
      typeof bookmark.category === 'string' &&
      typeof bookmark.url === 'string'
    );
    
    return isValid ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Toggle between main section and form section
function displayOrCloseForm() {
  document.getElementById('main-section').classList.toggle('hidden');
  document.getElementById('form-section').classList.toggle('hidden');
}

// Toggle between main section and bookmark list section
function displayOrHideCategory() {
  document.getElementById('main-section').classList.toggle('hidden');
  document.getElementById('bookmark-list-section').classList.toggle('hidden');
}

// Get currently selected category from dropdown
function getSelectedCategory() {
  const dropdown = document.getElementById('category-dropdown');
  return dropdown.options[dropdown.selectedIndex].value;
}

// Update all .category-name elements with selected category
function updateCategoryName() {
  const category = getSelectedCategory();
  document.querySelectorAll('.category-name').forEach(el => {
    el.innerText = category;
  });
}

// Add bookmark button - show form
document.getElementById('add-bookmark-button').addEventListener('click', () => {
  updateCategoryName();
  displayOrCloseForm();
});

// Close form button - hide form
document.getElementById('close-form-button').addEventListener('click', () => {
  displayOrCloseForm();
});

// Add bookmark form submission
document.getElementById('add-bookmark-button-form').addEventListener('click', () => {
  const name = document.getElementById('name').value;
  const url = document.getElementById('url').value;
  const category = getSelectedCategory();
  
  const bookmarks = getBookmarks();
  bookmarks.push({ name, category, url });
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  
  // Reset inputs
  document.getElementById('name').value = '';
  document.getElementById('url').value = '';
  
  displayOrCloseForm();
});

// View category button
document.getElementById('view-category-button').addEventListener('click', () => {
  updateCategoryName();
  
  const category = getSelectedCategory();
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(b => b.category === category);
  const categoryList = document.getElementById('category-list');
  
  if (filtered.length === 0) {
    categoryList.innerHTML = '<p>No Bookmarks Found</p>';
  } else {
    categoryList.innerHTML = filtered.map(bookmark => {
      // Escape HTML to prevent injection issues
      const safeName = bookmark.name.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeUrl = bookmark.url.replace(/"/g, '&quot;');
      return `
        <div>
          <input type="radio" id="${safeName}" value="${safeName}" name="bookmark">
          <label for="${safeName}"><a href="${safeUrl}">${safeName}</a></label>
        </div>
      `;
    }).join('');
  }
  
  displayOrHideCategory();
});

// Close list button
document.getElementById('close-list-button').addEventListener('click', () => {
  displayOrHideCategory();
});

// Delete bookmark button
document.getElementById('delete-bookmark-button').addEventListener('click', () => {
  const selected = document.querySelector('#category-list input[type="radio"]:checked');
  if (!selected) return;
  
  const name = selected.value;
  const category = getSelectedCategory();
  const bookmarks = getBookmarks();
  
  const filtered = bookmarks.filter(b => !(b.name === name && b.category === category));
  localStorage.setItem('bookmarks', JSON.stringify(filtered));
  
  // Update the displayed list
  const remaining = filtered.filter(b => b.category === category);
  const categoryList = document.getElementById('category-list');
  
  if (remaining.length === 0) {
    categoryList.innerHTML = '<p>No Bookmarks Found</p>';
  } else {
    categoryList.innerHTML = remaining.map(bookmark => {
      const safeName = bookmark.name.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeUrl = bookmark.url.replace(/"/g, '&quot;');
      return `
        <div>
          <input type="radio" id="${safeName}" value="${safeName}" name="bookmark">
          <label for="${safeName}"><a href="${safeUrl}">${safeName}</a></label>
        </div>
      `;
    }).join('');
  }
});