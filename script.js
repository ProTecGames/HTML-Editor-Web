document.addEventListener("DOMContentLoaded", function() {
  const fileList = document.getElementById('fileList');
  const fab = document.getElementById('fab');
  const modal = document.getElementById('modal');
  const closeButton = document.querySelector('.close');
  const fileNameInput = document.getElementById('fileNameInput');
  const sortButton = document.getElementById('sortButton');
  const searchInput = document.getElementById('searchInput');
  const viewToggle = document.getElementById('viewToggle');
  
  // Debug information
  console.log('Files in localStorage:', Object.keys(localStorage).filter(key => 
    !key.includes('_lastModified') && 
    !key.includes('_size') && 
    key !== 'savedContent' &&
    key !== 'welcomeShown' &&
    key !== 'lastUpdateCheck'
  ));

  // Check if elements exist
  console.log('fileList exists:', !!document.getElementById('fileList'));
  console.log('sortButton exists:', !!document.getElementById('sortButton'));
  console.log('searchInput exists:', !!document.getElementById('searchInput'));
  console.log('viewToggle exists:', !!document.getElementById('viewToggle'));
  
  // Set current date and user information
  if (document.getElementById('currentUser')) {
    document.getElementById('currentUser').textContent = 'PrakharDoneria';
  }
  
  if (document.getElementById('currentDate')) {
    document.getElementById('currentDate').textContent = '2025-03-26 16:27:56';
  }
  
  let files = [];
  let sortOrder = 'name-asc'; // Default sort order
  let viewMode = 'list'; // Default view mode: 'list' or 'grid'
  
  // Load file list from local storage on page load
  loadFileList();
  
  // Event listener for fab button to open modal
  fab.addEventListener('click', openModal);
  
  // Event listener for close button to close modal
  closeButton.addEventListener('click', closeModal);
  
  // Event listener for save button in modal
  document.getElementById('saveFileBtn').addEventListener('click', saveFile);
  
  // Event listener for search input
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterProjects(this.value.trim().toLowerCase());
    });
  }
  
  // Event listener for sort button
  if (sortButton) {
    sortButton.addEventListener('click', function() {
      toggleSortMenu();
    });
  }
  
  // Event listener for view toggle
  if (viewToggle) {
    viewToggle.addEventListener('click', function() {
      toggleViewMode();
    });
  }
  
  // Event listeners for sort options
  document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', function() {
      const sortType = this.getAttribute('data-sort');
      sortProjects(sortType);
      document.getElementById('sortMenu').classList.remove('show');
      updateSortButtonText(sortType);
    });
  });
  
  // Function to load file list from local storage
  function loadFileList() {
    files = []; // Clear existing array
    const storedFiles = Object.keys(localStorage);
    
    storedFiles.forEach(file => {
      if (file !== 'savedContent' && 
          !file.includes('_lastModified') && 
          !file.includes('_size') &&
          !file.includes('welcomeShown') &&
          !file.includes('lastUpdateCheck')) {
        // Get last modified date from localStorage or use current date
        const lastModified = localStorage.getItem(file + '_lastModified') || new Date().toISOString();
        const fileSize = localStorage.getItem(file + '_size') || '0';
        const fileType = getFileType(file);
        
        files.push({
          name: file,
          lastModified: lastModified,
          size: parseInt(fileSize),
          type: fileType
        });
      }
    });
    
    console.log('Loaded files:', files.length);
    
    // Sort files based on current sort order
    sortProjects(sortOrder);
  }
  
  // Function to determine file type based on extension
  function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'html': 'HTML',
      'css': 'CSS',
      'js': 'JavaScript',
      'json': 'JSON',
      'md': 'Markdown',
      'txt': 'Text'
    };
    return typeMap[extension] || 'Unknown';
  }
  
  // Function to render file list
  function renderFileList() {
    if (!fileList) {
      console.error('FileList element not found');
      return;
    }
    
    fileList.innerHTML = ''; // Clear existing list
    
    if (files.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div class="empty-icon">📁</div>
        <h3>No Projects Found</h3>
        <p>Click the + button to create your first project</p>
      `;
      fileList.appendChild(emptyState);
      return;
    }
    
    files.forEach(file => {
      const li = document.createElement('li');
      li.className = viewMode === 'grid' ? 'grid-item' : 'list-item';
      
      // Format date for display
      const formattedDate = new Date(file.lastModified).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Format file size
      const formattedSize = formatFileSize(file.size);
      
      // Generate icon based on file type
      const iconClass = getFileIcon(file.type);
      
      li.innerHTML = `
        <div class="file-icon ${iconClass}"></div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            <span class="file-date">${formattedDate}</span>
            <span class="file-type">${file.type}</span>
            <span class="file-size">${formattedSize}</span>
          </div>
        </div>
        <div class="file-actions">
          <button class="action-btn edit-btn" title="Edit"><span class="action-icon">✏️</span></button>
          <button class="action-btn delete-btn" title="Delete"><span class="action-icon">🗑️</span></button>
          <button class="action-btn more-btn" title="More Options"><span class="action-icon">⋮</span></button>
        </div>
      `;
      
      // Add event listener for clicking on the file to open it
      li.querySelector('.file-info').addEventListener('click', function() {
        window.location.href = `/editor/index.html?filename=${file.name}`;
      });
      
      // Add event listener for edit button
      li.querySelector('.edit-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = `/editor/index.html?filename=${file.name}`;
      });
      
      // Add event listener for delete button
      li.querySelector('.delete-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        confirmDeleteFile(file.name);
      });
      
      // Add event listener for more options button
      li.querySelector('.more-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        showContextMenu(file.name, e);
      });
      
      fileList.appendChild(li);
    });
  }
  
  // Function to get appropriate icon class based on file type
  function getFileIcon(fileType) {
    const iconMap = {
      'HTML': 'html-icon',
      'CSS': 'css-icon',
      'JavaScript': 'js-icon',
      'JSON': 'json-icon',
      'Markdown': 'md-icon',
      'Text': 'txt-icon'
    };
    return iconMap[fileType] || 'default-icon';
  }
  
  // Function to format file size
  function formatFileSize(sizeInBytes) {
    if (sizeInBytes < 1024) {
      return sizeInBytes + ' B';
    } else if (sizeInBytes < 1024 * 1024) {
      return (sizeInBytes / 1024).toFixed(1) + ' KB';
    } else {
      return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
  
  // Function to open modal
  function openModal() {
    modal.style.display = 'block';
    fileNameInput.focus();
  }
  
  // Function to close modal
  function closeModal() {
    modal.style.display = 'none';
    fileNameInput.value = '';
  }
  
  // Function to save new file
  function saveFile() {
    const fileName = fileNameInput.value.trim();
    if (fileName !== '') {
      // Save file name to local storage
      localStorage.setItem(fileName, '');
      // Save metadata
      localStorage.setItem(fileName + '_lastModified', new Date().toISOString());
      localStorage.setItem(fileName + '_size', '0');
      
      console.log('Saved new file:', fileName);
      
      // Reload file list
      loadFileList();
      // Close modal
      closeModal();
    }
  }
  
  // Function to filter projects based on search term
  function filterProjects(searchTerm) {
    if (!searchTerm) {
      loadFileList(); // Reset to full list
      return;
    }
    
    const allFiles = [];
    const storedFiles = Object.keys(localStorage);
    
    storedFiles.forEach(file => {
      if (file !== 'savedContent' && 
          !file.includes('_lastModified') && 
          !file.includes('_size') &&
          !file.includes('welcomeShown') &&
          !file.includes('lastUpdateCheck')) {
        const lastModified = localStorage.getItem(file + '_lastModified') || new Date().toISOString();
        const fileSize = localStorage.getItem(file + '_size') || '0';
        const fileType = getFileType(file);
        
        allFiles.push({
          name: file,
          lastModified: lastModified,
          size: parseInt(fileSize),
          type: fileType
        });
      }
    });
    
    // Filter files based on search term
    files = allFiles.filter(file => 
      file.name.toLowerCase().includes(searchTerm) || 
      file.type.toLowerCase().includes(searchTerm)
    );
    
    renderFileList();
  }
  
  // Function to sort projects
  function sortProjects(sortType) {
    sortOrder = sortType;
    
    switch (sortType) {
      case 'name-asc':
        files.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        files.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date-asc':
        files.sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
        break;
      case 'date-desc':
        files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        break;
      case 'size-asc':
        files.sort((a, b) => a.size - b.size);
        break;
      case 'size-desc':
        files.sort((a, b) => b.size - a.size);
        break;
      case 'type-asc':
        files.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'type-desc':
        files.sort((a, b) => b.type.localeCompare(a.type));
        break;
    }
    
    renderFileList();
  }
  
  // Function to toggle sort menu
  function toggleSortMenu() {
    const sortMenu = document.getElementById('sortMenu');
    if (sortMenu) {
      sortMenu.classList.toggle('show');
    }
  }
  
  // Function to update sort button text
  function updateSortButtonText(sortType) {
    if (!sortButton) return;
    
    const sortText = {
      'name-asc': 'Name ↑',
      'name-desc': 'Name ↓',
      'date-asc': 'Date ↑',
      'date-desc': 'Date ↓',
      'size-asc': 'Size ↑',
      'size-desc': 'Size ↓',
      'type-asc': 'Type ↑',
      'type-desc': 'Type ↓'
    };
    
    sortButton.textContent = 'Sort: ' + (sortText[sortType] || 'Name ↑');
  }
  
  // Function to toggle view mode (list/grid)
  function toggleViewMode() {
    viewMode = viewMode === 'list' ? 'grid' : 'list';
    const projectContainer = document.getElementById('projectContainer');
    if (projectContainer) {
      projectContainer.className = 'project-container ' + viewMode + '-view';
    }
    if (viewToggle) {
      viewToggle.textContent = viewMode === 'list' ? 'Grid View' : 'List View';
    }
    renderFileList();
  }
  
  // Function to confirm file deletion
  function confirmDeleteFile(fileName) {
    const confirmDelete = confirm(`Are you sure you want to delete "${fileName}"?`);
    if (confirmDelete) {
      // Delete file from local storage
      localStorage.removeItem(fileName);
      localStorage.removeItem(fileName + '_lastModified');
      localStorage.removeItem(fileName + '_size');
      
      console.log('Deleted file:', fileName);
      
      // Reload file list
      loadFileList();
    }
  }
  
  // Function to show context menu
  function showContextMenu(fileName, event) {
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
      contextMenu = createContextMenu();
    }
    
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    
    // Set the current file name as a data attribute
    contextMenu.setAttribute('data-filename', fileName);
    
    // Close menu when clicking outside
    document.addEventListener('click', closeContextMenu);
  }
  
  // Function to create context menu
  function createContextMenu() {
    const menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.className = 'context-menu';
    
    menu.innerHTML = `
      <ul>
        <li id="menuEdit">Edit</li>
        <li id="menuRename">Rename</li>
        <li id="menuDuplicate">Duplicate</li>
        <li id="menuDownload">Download</li>
        <li class="divider"></li>
        <li id="menuDelete" class="danger">Delete</li>
      </ul>
    `;
    
    document.body.appendChild(menu);
    
    // Add event listeners for menu items
    document.getElementById('menuEdit').addEventListener('click', function() {
      const fileName = document.getElementById('contextMenu').getAttribute('data-filename');
      window.location.href = `/editor/index.html?filename=${fileName}`;
    });
    
    document.getElementById('menuRename').addEventListener('click', function() {
      const fileName = document.getElementById('contextMenu').getAttribute('data-filename');
      renameFile(fileName);
    });
    
    document.getElementById('menuDuplicate').addEventListener('click', function() {
      const fileName = document.getElementById('contextMenu').getAttribute('data-filename');
      duplicateFile(fileName);
    });
    
    document.getElementById('menuDownload').addEventListener('click', function() {
      const fileName = document.getElementById('contextMenu').getAttribute('data-filename');
      downloadFile(fileName);
    });
    
    document.getElementById('menuDelete').addEventListener('click', function() {
      const fileName = document.getElementById('contextMenu').getAttribute('data-filename');
      confirmDeleteFile(fileName);
    });
    
    return menu;
  }
  
  // Function to close context menu
  function closeContextMenu() {
    const menu = document.getElementById('contextMenu');
    if (menu) {
      menu.style.display = 'none';
    }
    document.removeEventListener('click', closeContextMenu);
  }
  
  // Function to rename file
  function renameFile(oldFileName) {
    const newFileName = prompt('Enter new name for ' + oldFileName, oldFileName);
    if (newFileName && newFileName !== oldFileName) {
      // Get content and metadata
      const content = localStorage.getItem(oldFileName) || '';
      const lastModified = localStorage.getItem(oldFileName + '_lastModified') || new Date().toISOString();
      const fileSize = localStorage.getItem(oldFileName + '_size') || '0';
      
      // Create new file
      localStorage.setItem(newFileName, content);
      localStorage.setItem(newFileName + '_lastModified', lastModified);
      localStorage.setItem(newFileName + '_size', fileSize);
      
      // Delete old file
      localStorage.removeItem(oldFileName);
      localStorage.removeItem(oldFileName + '_lastModified');
      localStorage.removeItem(oldFileName + '_size');
      
      console.log('Renamed file:', oldFileName, 'to', newFileName);
      
      // Reload file list
      loadFileList();
    }
  }
  
  // Function to duplicate file
  function duplicateFile(fileName) {
    let newFileName = 'Copy of ' + fileName;
    let counter = 1;
    
    // Check if the copy already exists and increment counter
    while (localStorage.getItem(newFileName)) {
      newFileName = `Copy (${counter}) of ${fileName}`;
      counter++;
    }
    
    // Get content and metadata
    const content = localStorage.getItem(fileName) || '';
    const fileSize = localStorage.getItem(fileName + '_size') || '0';
    
    // Create duplicate
    localStorage.setItem(newFileName, content);
    localStorage.setItem(newFileName + '_lastModified', new Date().toISOString());
    localStorage.setItem(newFileName + '_size', fileSize);
    
    console.log('Duplicated file:', fileName, 'to', newFileName);
    
    // Reload file list
    loadFileList();
  }
  
  // Function to download file
  function downloadFile(fileName) {
    const content = localStorage.getItem(fileName) || '';
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('Downloaded file:', fileName);
  }
  
  // Event listener to dismiss modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // Function to handle keyboard shortcuts
  document.addEventListener('keydown', function(event) {
    // Ctrl+N or Cmd+N to create new file
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      openModal();
    }
    
    // Escape to close modal
    if (event.key === 'Escape') {
      closeModal();
      
      // Also close context menu if open
      const contextMenu = document.getElementById('contextMenu');
      if (contextMenu && contextMenu.style.display === 'block') {
        contextMenu.style.display = 'none';
      }
    }
  });
  
  // Initialize sort button text
  if (sortButton) {
    updateSortButtonText(sortOrder);
  }
  
  // Initialize the page with welcome message for first-time users
  function showWelcomeMessage() {
    if (!localStorage.getItem('welcomeShown')) {
      const welcomeMessage = document.createElement('div');
      welcomeMessage.className = 'welcome-message';
      welcomeMessage.innerHTML = `
        <div class="welcome-header">
          <h2>Welcome to HTML Editor PRO</h2>
          <button class="close-welcome">×</button>
        </div>
        <div class="welcome-content">
          <p>Get started by creating your first project using the + button.</p>
          <p>Your projects are saved locally in your browser.</p>
          <button class="primary-btn create-first-project">Create First Project</button>
        </div>
      `;
      
      document.body.appendChild(welcomeMessage);
      
      // Event listener for closing welcome message
      welcomeMessage.querySelector('.close-welcome').addEventListener('click', function() {
        welcomeMessage.remove();
        localStorage.setItem('welcomeShown', 'true');
      });
      
      // Event listener for creating first project
      welcomeMessage.querySelector('.create-first-project').addEventListener('click', function() {
        welcomeMessage.remove();
        localStorage.setItem('welcomeShown', 'true');
        openModal();
      });
    }
  }
  
  // Show welcome message on first visit
  showWelcomeMessage();
  
  // Check for updates feature
  setTimeout(function() {
    const lastCheck = localStorage.getItem('lastUpdateCheck');
    const now = new Date().getTime();
    
    // Check once a day
    if (!lastCheck || (now - parseInt(lastCheck)) > 86400000) {
      localStorage.setItem('lastUpdateCheck', now.toString());
      
      // Simulate checking for updates (in a real app, this would be an API call)
      const hasUpdate = Math.random() > 0.7; // 30% chance of "update"
      
      if (hasUpdate) {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
          <div class="update-content">
            <h3>Update Available</h3>
            <p>A new version of HTML Editor PRO is available!</p>
            <div class="update-actions">
              <button class="update-now">Update Now</button>
              <button class="update-later">Later</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(updateNotification);
        
        // Event listeners for update notification
        updateNotification.querySelector('.update-now').addEventListener('click', function() {
          alert('Update applied successfully!');
          updateNotification.remove();
        });
        
        updateNotification.querySelector('.update-later').addEventListener('click', function() {
          updateNotification.remove();
        });
      }
    }
  }, 2000);
  
  // Function to create a test file if no files exist
  function createTestFileIfEmpty() {
    const hasFiles = Object.keys(localStorage).some(key => 
      !key.includes('_lastModified') && 
      !key.includes('_size') && 
      key !== 'savedContent' &&
      key !== 'welcomeShown' &&
      key !== 'lastUpdateCheck'
    );
    
    if (!hasFiles) {
      console.log('No files found, creating a test file');
      
      // Create a test HTML file
      const testFileName = 'welcome.html';
      const testContent = `<!DOCTYPE html>
<html>
<head>
  <title>Welcome to HTML Editor PRO</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #007ACC;
    }
  </style>
</head>
<body>
  <h1>Welcome to HTML Editor PRO!</h1>
  <p>This is your first HTML file created with HTML Editor PRO. Feel free to edit it or create new files.</p>
  <p>Happy coding!</p>
</body>
</html>`;
      
      localStorage.setItem(testFileName, testContent);
      localStorage.setItem(testFileName + '_lastModified', new Date().toISOString());
      localStorage.setItem(testFileName + '_size', testContent.length.toString());
      
      // Create a test CSS file
      const cssFileName = 'styles.css';
      const cssContent = `/* Main Styles */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

h1, h2, h3 {
  color: #007ACC;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`;
      
      localStorage.setItem(cssFileName, cssContent);
      localStorage.setItem(cssFileName + '_lastModified', new Date().toISOString());
      localStorage.setItem(cssFileName + '_size', cssContent.length.toString());
      
      // Create a test JS file
      const jsFileName = 'script.js';
      const jsContent = `// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document is ready!');
  
  // Example function
  function greet(name) {
    return 'Hello, ' + name + '!';
  }
  
  // Example usage
  const message = greet('Developer');
  console.log(message);
});`;
      
      localStorage.setItem(jsFileName, jsContent);
      localStorage.setItem(jsFileName + '_lastModified', new Date().toISOString());
      localStorage.setItem(jsFileName + '_size', jsContent.length.toString());
      
      // Reload the file list to show the new files
      loadFileList();
    }
  }
  
  // Create test files if no files exist
  createTestFileIfEmpty();
  
  // Initialize particles.js
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#007ACC'
        },
        shape: {
          type: 'circle'
        },
        opacity: {
          value: 0.5,
          random: false
        },
        size: {
          value: 3,
          random: true
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#007ACC',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        }
      },
      retina_detect: true
    });
  }
  
  // Initialize file list
  renderFileList();
});