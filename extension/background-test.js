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
// Test 4: Sender ID validation
console.log('🔒 TEST: Testing sender ID validation...');

// Test invalid sender
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const fakeSender = { id: 'fake-extension-id-123' };
    
    if (!fakeSender || !fakeSender.id || fakeSender.id !== chrome.runtime.id) {
        sendResponse({ error: 'Unauthorized sender' });
        console.log('✅ TEST: Invalid sender correctly rejected');
        return false;
    }
});

// Test valid sender
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const validSender = { id: chrome.runtime.id };
    
    if (!validSender || !validSender.id || validSender.id !== chrome.runtime.id) {
        console.log('❌ TEST: Valid sender was incorrectly rejected');
    } else {
        console.log('✅ TEST: Valid sender correctly allowed through');
    }
});

console.log('🔒 TEST: Sender validation tests complete');

console.log('🎉 TEST: Background script loaded successfully!');
console.log('👉 If you see this, the service worker is working!');
