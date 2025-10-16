// Content script for coding platforms
// Detects problems on LeetCode, HackerRank, etc. and adds DocMagic helper button

(function() {
    'use strict';
    
    // Detect platform
    const platform = detectPlatform();
    
    if (platform) {
        console.log('DocMagic: Detected platform:', platform);
        injectHelper(platform);
    }
    
    function detectPlatform() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('leetcode.com')) return 'leetcode';
        if (hostname.includes('hackerrank.com')) return 'hackerrank';
        if (hostname.includes('codeforces.com')) return 'codeforces';
        if (hostname.includes('geeksforgeeks.org')) return 'geeksforgeeks';
        
        return null;
    }
    
    function injectHelper(platform) {
        // Create floating helper button
        const helperButton = document.createElement('div');
        helperButton.id = 'docmagic-helper';
        helperButton.innerHTML = `
            <button class="docmagic-btn">
                <span class="docmagic-icon">📚</span>
                <span class="docmagic-text">Get AI Help</span>
            </button>
        `;
        
        document.body.appendChild(helperButton);
        
        // Add click handler
        helperButton.querySelector('.docmagic-btn').addEventListener('click', () => {
            const problemData = extractProblemData(platform);
            showHelpModal(problemData);
        });
    }
    
    function extractProblemData(platform) {
        let title = '';
        let description = '';
        
        switch(platform) {
            case 'leetcode':
                title = document.querySelector('[data-cy="question-title"]')?.textContent || 
                        document.querySelector('.css-v3d350')?.textContent || '';
                description = document.querySelector('[data-track-load="description_content"]')?.textContent ||
                             document.querySelector('.content__u3I1')?.textContent || '';
                break;
                
            case 'hackerrank':
                title = document.querySelector('.challenge-title')?.textContent || '';
                description = document.querySelector('.challenge-body')?.textContent || '';
                break;
                
            case 'codeforces':
                title = document.querySelector('.title')?.textContent || '';
                description = document.querySelector('.problem-statement')?.textContent || '';
                break;
                
            case 'geeksforgeeks':
                title = document.querySelector('.problems_problem_content__Xm_eO h3')?.textContent || '';
                description = document.querySelector('.problems_problem_content__Xm_eO')?.textContent || '';
                break;
        }
        
        return {
            title: title.trim(),
            description: description.trim(),
            platform: platform,
            url: window.location.href
        };
    }
    
    function showHelpModal(problemData) {
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'docmagic-modal';
        modal.innerHTML = `
            <div class="docmagic-modal-overlay">
                <div class="docmagic-modal-content">
                    <div class="docmagic-modal-header">
                        <h2>📚 DocMagic AI Assistant</h2>
                        <button class="docmagic-close">&times;</button>
                    </div>
                    <div class="docmagic-modal-body">
                        <h3>${problemData.title}</h3>
                        <div class="docmagic-actions">
                            <button class="docmagic-action-btn" data-action="hint">
                                💡 Get Hint
                            </button>
                            <button class="docmagic-action-btn" data-action="approach">
                                🧩 Show Approach
                            </button>
                            <button class="docmagic-action-btn" data-action="solution">
                                ✅ Full Solution
                            </button>
                            <button class="docmagic-action-btn" data-action="complexity">
                                ⏱️ Complexity Analysis
                            </button>
                        </div>
                        <div id="docmagic-result" class="docmagic-result"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.docmagic-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.docmagic-modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('docmagic-modal-overlay')) {
                modal.remove();
            }
        });
        
        modal.querySelectorAll('.docmagic-action-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                await handleAction(action, problemData);
            });
        });
    }
    
    async function handleAction(action, problemData) {
        const resultDiv = document.getElementById('docmagic-result');
        resultDiv.innerHTML = '<div class="docmagic-loading">AI is thinking...</div>';
        
        try {
            // Call DocMagic API
            const response = await fetch('http://localhost:3000/api/solve-dsa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problem: `${problemData.title}\n\n${problemData.description}`,
                    action: action,
                    language: 'javascript'
                }),
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const result = await response.json();
            displayResult(action, result, resultDiv);
            
        } catch (error) {
            resultDiv.innerHTML = '<div class="docmagic-error">Failed to get AI help. Please try again.</div>';
            console.error(error);
        }
    }
    
    function displayResult(action, result, container) {
        let html = '';
        
        switch(action) {
            case 'hint':
                html = `<div class="docmagic-hint">
                    <h4>💡 Hint:</h4>
                    <p>${result.hint || 'Think about the problem step by step...'}</p>
                </div>`;
                break;
                
            case 'approach':
                html = `<div class="docmagic-approach">
                    <h4>🧩 Approach:</h4>
                    <p>${result.approach || 'Analyzing problem...'}</p>
                </div>`;
                break;
                
            case 'solution':
                html = `<div class="docmagic-solution">
                    <h4>✅ Solution:</h4>
                    <pre><code>${result.code || '// Solution code here'}</code></pre>
                    <button class="docmagic-copy-btn" onclick="navigator.clipboard.writeText(\`${result.code}\`)">
                        📋 Copy Code
                    </button>
                </div>`;
                break;
                
            case 'complexity':
                html = `<div class="docmagic-complexity">
                    <h4>⏱️ Complexity Analysis:</h4>
                    <p><strong>Time:</strong> ${result.timeComplexity || 'O(n)'}</p>
                    <p><strong>Space:</strong> ${result.spaceComplexity || 'O(1)'}</p>
                    <p>${result.complexityExplanation || ''}</p>
                </div>`;
                break;
        }
        
        container.innerHTML = html;
    }
    
})();
