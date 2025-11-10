// Minimal test background script
console.log('🧪 TEST: Background script is loading...');

// Test 1: Check Chrome APIs are available
console.log('✅ TEST: chrome.runtime available:', !!chrome.runtime);
console.log('✅ TEST: chrome.storage available:', !!chrome.storage);

// Test 2: Simple message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 TEST: Message received:', request.type);
    sendResponse({ test: 'Message handler is working!' });
    return true;
});

// Test 3: Installation event
chrome.runtime.onInstalled.addListener(() => {
    console.log('📦 TEST: Extension installed/updated');
});

console.log('🎉 TEST: Background script loaded successfully!');
console.log('👉 If you see this, the service worker is working!');
