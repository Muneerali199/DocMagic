// Background service worker for DocMagic Extension

// Installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('DocMagic Extension installed!');
        
        // Initialize storage
        chrome.storage.local.set({
            'problems-solved': 0,
            'questions-practiced': 0,
            'settings': {
                'apiUrl': 'http://localhost:3000/api',
                'autoDetect': true,
                'notifications': true
            }
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: 'https://docmagic.com/extension-welcome'
        });
    }
});

// Context menu for selected text
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'docmagic-solve',
        title: 'Solve with DocMagic AI',
        contexts: ['selection']
    });
    
    chrome.contextMenus.create({
        id: 'docmagic-explain',
        title: 'Explain with DocMagic AI',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'docmagic-solve') {
        handleSolveRequest(info.selectionText, tab);
    } else if (info.menuItemId === 'docmagic-explain') {
        handleExplainRequest(info.selectionText, tab);
    }
});

async function handleSolveRequest(text, tab) {
    try {
        // Get API URL from settings
        const { settings } = await chrome.storage.local.get('settings');
        const apiUrl = settings?.apiUrl || 'http://localhost:3000/api';
        
        // Call API
        const response = await fetch(`${apiUrl}/solve-dsa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                problem: text,
                language: 'javascript'
            }),
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const result = await response.json();
        
        // Send result to content script
        chrome.tabs.sendMessage(tab.id, {
            type: 'SHOW_SOLUTION',
            data: result
        });
        
    } catch (error) {
        console.error('Failed to solve problem:', error);
        showNotification('Failed to solve problem', 'Please try again later.');
    }
}

async function handleExplainRequest(text, tab) {
    try {
        const { settings } = await chrome.storage.local.get('settings');
        const apiUrl = settings?.apiUrl || 'http://localhost:3000/api';
        
        const response = await fetch(`${apiUrl}/explain-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: text
            }),
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const result = await response.json();
        
        chrome.tabs.sendMessage(tab.id, {
            type: 'SHOW_EXPLANATION',
            data: result
        });
        
    } catch (error) {
        console.error('Failed to explain code:', error);
        showNotification('Failed to explain code', 'Please try again later.');
    }
}

// Notifications
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: title,
        message: message
    });
}

// Badge updates
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes['problems-solved']) {
            updateBadge(changes['problems-solved'].newValue);
        }
    }
});

function updateBadge(count) {
    if (count > 0) {
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    }
}

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INCREMENT_STAT') {
        incrementStat(request.stat, request.count);
        sendResponse({ success: true });
    }
    
    if (request.type === 'GET_SETTINGS') {
        chrome.storage.local.get('settings', (result) => {
            sendResponse(result.settings);
        });
        return true; // Keep channel open for async response
    }
    
    if (request.type === 'UPDATE_SETTINGS') {
        chrome.storage.local.set({ settings: request.settings }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

async function incrementStat(stat, count = 1) {
    const result = await chrome.storage.local.get(stat);
    const currentValue = result[stat] || 0;
    const newValue = currentValue + count;
    await chrome.storage.local.set({ [stat]: newValue });
}

// Keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-popup') {
        chrome.action.openPopup();
    }
});

console.log('DocMagic Extension background script loaded');
