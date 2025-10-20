// DocMagic Smart AI Extension - Popup Script
// Uses Gemini AI directly - No backend needed!

let currentApiKey = '';

// Load API key and provider on startup
chrome.storage.local.get(['ai_provider', 'gemini_api_key', 'openai_api_key', 'mistral_api_key', 'claude_api_key'], (result) => {
    const provider = result.ai_provider || 'gemini';
    const keyMap = {
        gemini: result.gemini_api_key,
        openai: result.openai_api_key,
        mistral: result.mistral_api_key,
        claude: result.claude_api_key
    };
    
    currentApiKey = keyMap[provider] || '';
    
    // Update provider display
    const providerNames = {
        gemini: 'Gemini',
        openai: 'OpenAI',
        mistral: 'Mistral',
        claude: 'Claude'
    };
    document.getElementById('current-provider').textContent = `Using: ${providerNames[provider]}`;
    
    // Update status
    if (currentApiKey) {
        document.getElementById('api-key-status').textContent = '✅ API Key Configured';
        document.getElementById('api-key-status').style.color = '#10B981';
    } else {
        document.getElementById('api-key-status').textContent = '⚠️ API Key Not Set';
        document.getElementById('api-key-status').style.color = '#EF4444';
    }
});

// Tab Management
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Open Settings Page
const settingsBtn = document.getElementById('open-settings');
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        console.log('Opening settings page...');
        // Try to open settings page
        try {
            chrome.runtime.openOptionsPage(() => {
                if (chrome.runtime.lastError) {
                    // Fallback: open in new tab
                    console.log('Using fallback method...');
                    chrome.tabs.create({
                        url: chrome.runtime.getURL('settings.html')
                    });
                }
            });
        } catch (error) {
            console.error('Error opening settings:', error);
            // Direct fallback
            chrome.tabs.create({
                url: chrome.runtime.getURL('settings.html')
            });
        }
    });
    console.log('Settings button listener attached');
} else {
    console.error('Settings button not found in DOM');
}

// DSA Problem Solver
document.getElementById('solve-dsa').addEventListener('click', async () => {
    const problem = document.getElementById('dsa-problem').value.trim();
    const language = document.getElementById('dsa-language').value;
    
    if (!problem) {
        showNotification('Please enter a problem statement', 'error');
        return;
    }
    
    if (!currentApiKey) {
        showNotification('Please configure your API key first', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const solution = await solveDSAProblem(problem, language);
        displayDSASolution(solution);
        incrementStat('problems-solved');
    } catch (error) {
        showNotification('Failed to solve problem. Please try again.', 'error');
        console.error(error);
    } finally {
        showLoading(false);
    }
});

// Interview Question Generator
document.getElementById('generate-questions').addEventListener('click', async () => {
    const role = document.getElementById('interview-role').value;
    const level = document.getElementById('interview-level').value;
    const company = document.getElementById('interview-company').value.trim();
    
    showLoading(true);
    
    try {
        const questions = await generateInterviewQuestions(role, level, company);
        displayInterviewQuestions(questions);
        incrementStat('questions-practiced', questions.length);
    } catch (error) {
        showNotification('Failed to generate questions. Please try again.', 'error');
        console.error(error);
    } finally {
        showLoading(false);
    }
});

// Resume Actions
document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', async () => {
        const action = card.dataset.action;
        showLoading(true);
        
        try {
            const result = await handleResumeAction(action);
            displayResumeResult(action, result);
        } catch (error) {
            showNotification('Failed to process request. Please try again.', 'error');
            console.error(error);
        } finally {
            showLoading(false);
        }
    });
});

// Copy Solution
document.getElementById('copy-solution').addEventListener('click', () => {
    const content = document.getElementById('solution-content').textContent;
    navigator.clipboard.writeText(content);
    showNotification('Solution copied to clipboard!', 'success');
});

// Solution Tab Switching
document.querySelectorAll('.solution-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const solutionType = tab.dataset.solution;
        document.querySelectorAll('.solution-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Update solution content based on type
        updateSolutionContent(solutionType);
    });
});

// API Functions - Use Gemini AI directly
async function solveDSAProblem(problem, language) {
    const prompt = `You are an expert DSA problem solver. Solve this problem:

${problem}

Provide:
1. Approach (step-by-step thinking)
2. Complete code solution in ${language}
3. Time complexity
4. Space complexity
5. Explanation of the solution

Format your response as JSON with keys: approach, code, timeComplexity, spaceComplexity, explanation`;
    
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: 'SOLVE_PROBLEM', prompt },
            (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response.data);
                }
            }
        );
    });
}

async function generateInterviewQuestions(role, level, company) {
    const companyText = company ? ` at ${company}` : '';
    const prompt = `Generate 5 interview questions for a ${level} level ${role} position${companyText}.

For each question provide:
1. The question
2. Category (technical, behavioral, system design, etc.)
3. Difficulty level
4. A detailed answer

Format as JSON array with objects having keys: question, category, difficulty, answer`;
    
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: 'SOLVE_PROBLEM', prompt },
            (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    // Handle both array and object responses
                    const data = response.data;
                    resolve(Array.isArray(data) ? data : (data.questions || []));
                }
            }
        );
    });
}

async function handleResumeAction(action) {
    const prompts = {
        'resume-review': 'Provide a comprehensive resume review checklist with best practices for 2024.',
        'cover-letter': 'Generate a professional cover letter template with tips for customization.',
        'linkedin': 'Provide LinkedIn profile optimization tips including headline, summary, and experience sections.',
        'salary': 'Provide salary negotiation tips and current market trends for tech professionals.'
    };
    
    const prompt = prompts[action] || 'Provide career advice.';
    
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: 'SOLVE_PROBLEM', prompt },
            (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve({ content: response.data.content || JSON.stringify(response.data) });
                }
            }
        );
    });
}

// Display Functions
function displayDSASolution(solution) {
    const resultDiv = document.getElementById('dsa-result');
    const contentDiv = document.getElementById('solution-content');
    
    // Store solution data
    window.currentSolution = solution;
    
    // Display approach by default
    contentDiv.innerHTML = `
        <h4>Approach:</h4>
        <p>${solution.approach || 'Analyzing problem...'}</p>
    `;
    
    resultDiv.classList.remove('hidden');
}

function updateSolutionContent(type) {
    const contentDiv = document.getElementById('solution-content');
    const solution = window.currentSolution;
    
    if (!solution) return;
    
    switch(type) {
        case 'approach':
            contentDiv.innerHTML = `
                <h4>Approach:</h4>
                <p>${solution.approach}</p>
            `;
            break;
        case 'code':
            contentDiv.innerHTML = `
                <h4>Code Solution:</h4>
                <pre><code>${solution.code}</code></pre>
            `;
            break;
        case 'complexity':
            contentDiv.innerHTML = `
                <h4>Time & Space Complexity:</h4>
                <p><strong>Time Complexity:</strong> ${solution.timeComplexity}</p>
                <p><strong>Space Complexity:</strong> ${solution.spaceComplexity}</p>
                <p><strong>Explanation:</strong> ${solution.complexityExplanation}</p>
            `;
            break;
    }
}

function displayInterviewQuestions(questions) {
    const resultDiv = document.getElementById('interview-result');
    const listDiv = document.getElementById('questions-list');
    
    listDiv.innerHTML = questions.map((q, index) => `
        <div class="question-item">
            <h4>Question ${index + 1}: ${q.question}</h4>
            <p><strong>Category:</strong> ${q.category} | <strong>Difficulty:</strong> ${q.difficulty}</p>
            <button class="show-answer-btn" onclick="toggleAnswer(${index})">Show Answer</button>
            <div id="answer-${index}" class="answer" style="display: none;">
                ${q.answer}
            </div>
        </div>
    `).join('');
    
    resultDiv.classList.remove('hidden');
}

function displayResumeResult(action, result) {
    const resultDiv = document.getElementById('resume-result');
    const titleDiv = document.getElementById('resume-result-title');
    const contentDiv = document.getElementById('resume-content');
    
    const titles = {
        'resume-review': 'Resume Review Results',
        'cover-letter': 'Generated Cover Letter',
        'linkedin': 'LinkedIn Optimization Tips',
        'salary': 'Salary Guide'
    };
    
    titleDiv.textContent = titles[action];
    contentDiv.innerHTML = result.content;
    resultDiv.classList.remove('hidden');
}

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function showNotification(message, type = 'info') {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#EF4444' : '#10B981'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function incrementStat(statId, count = 1) {
    const statElement = document.getElementById(statId);
    const currentValue = parseInt(statElement.textContent);
    const newValue = currentValue + count;
    statElement.textContent = newValue;
    
    // Save to storage
    chrome.storage.local.set({ [statId]: newValue });
}

function toggleAnswer(index) {
    const answerDiv = document.getElementById(`answer-${index}`);
    const button = event.target;
    
    if (answerDiv.style.display === 'none') {
        answerDiv.style.display = 'block';
        button.textContent = 'Hide Answer';
    } else {
        answerDiv.style.display = 'none';
        button.textContent = 'Show Answer';
    }
}

// Load stats on startup
chrome.storage.local.get(['problems-solved', 'questions-practiced'], (result) => {
    if (result['problems-solved']) {
        document.getElementById('problems-solved').textContent = result['problems-solved'];
    }
    if (result['questions-practiced']) {
        document.getElementById('questions-practiced').textContent = result['questions-practiced'];
    }
});

// Get More Questions
document.getElementById('get-more-questions').addEventListener('click', () => {
    document.getElementById('generate-questions').click();
});
