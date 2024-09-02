document.addEventListener("DOMContentLoaded", function() {
    // Initialize Ace Editor
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai"); // You can change the theme if you prefer
    editor.session.setMode("ace/mode/html"); // Set mode to HTML for syntax highlighting
    editor.setValue("<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>HTML Editor</title>\n</head>\n\n<body>\n\n</body>\n\n</html>", 1); // Example HTML code

    // Get references to buttons
    const runBtn = document.getElementById('runBtn');
    const saveBtn = document.getElementById('saveBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    let editorStates = [];
    let currentStateIndex = -1;

    // Function to extract filename from URL
    function getFilenameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('filename');
    }

    // Function to save content to local storage
    function saveContent() {
        const content = editor.getValue();
        const filename = getFilenameFromURL();
        if (filename) {
            localStorage.setItem(filename, content);
        }
    }

    // Function to load content from local storage
    function loadContent() {
        const filename = getFilenameFromURL();
        if (filename) {
            const savedContent = localStorage.getItem(filename);
            if (savedContent) {
                editor.setValue(savedContent, -1);
            }
        }
    }

    // Load content from local storage on page load
    loadContent();

    // Event listener for editor changes
    editor.session.on('change', function() {
        saveContent();
        saveState();
    });

    // Function to save editor state
    function saveState() {
        const content = editor.getValue();
        editorStates.splice(currentStateIndex + 1);
        editorStates.push(content);
        currentStateIndex++;
    }

    // Event listener for undo button click
    undoBtn.addEventListener('click', () => {
        editor.undo();
    });

    // Event listener for redo button click
    redoBtn.addEventListener('click', () => {
        editor.redo();
    });

    // Event listener for save button click
    saveBtn.addEventListener('click', () => {
        const content = editor.getValue();
        const filename = getFilenameFromURL();
        if (filename) {
            // Save content to device memory by initiating download
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('Code downloaded successfully!');
        } else {
            alert('No filename provided!');
        }
    });

    // Event listener for run button click
    runBtn.addEventListener('click', () => {
        const content = editor.getValue();
        localStorage.setItem('runContent', content);
        window.location.href = '/output/index.html?code=' + encodeURIComponent(content);
    });
});
