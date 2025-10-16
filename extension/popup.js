// DocMagic Interview & DSA Prep Extension
// Main popup script

const API_URL = 'http://localhost:3000/api'; // Change to your DocMagic API URL

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

// DSA Problem Solver
document.getElementById('solve-dsa').addEventListener('click', async () => {
    const problem = document.getElementById('dsa-problem').value.trim();
    const language = document.getElementById('dsa-language').value;
    
    if (!problem) {
        showNotification('Please enter a problem statement', 'error');
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

// API Functions
async function solveDSAProblem(problem, language) {
    // Call DocMagic API or Gemini directly
    const response = await fetch(`${API_URL}/solve-dsa`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem, language }),
    });
    
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
}

async function generateInterviewQuestions(role, level, company) {
    const response = await fetch(`${API_URL}/interview-questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, level, company }),
    });
    
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
}

async function handleResumeAction(action) {
    const response = await fetch(`${API_URL}/resume-action`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
    });
    
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
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
    // Simple notification (can be enhanced with a toast library)
    alert(message);
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
