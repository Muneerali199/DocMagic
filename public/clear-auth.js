// Add this utility script to clear corrupted auth data
// Save as: clear-auth-storage.js and run in browser console if needed

console.log("Clearing potentially corrupted auth storage...");

// Clear localStorage auth keys
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    console.log("Removing:", key);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage auth keys  
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    console.log("Removing:", key);
    sessionStorage.removeItem(key);
  }
});

console.log("Auth storage cleared. Please refresh the page and sign in again.");
