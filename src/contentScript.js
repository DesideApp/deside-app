// ...existing code...

// Maneja correctamente las promesas
chrome.runtime.sendMessage({ action: 'someAction' }, (response) => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
    } else {
        // Maneja la respuesta
    }
});

// ...existing code...
