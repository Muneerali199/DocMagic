// DocMagic Smart Content Script
// Auto-detects and crawls coding problems with AI assistance

(function() {
    'use strict';
    
    console.log('🚀 DocMagic Smart Extension activated!');
    
    // Check if extension context is valid on load
    if (!chrome.runtime || !chrome.runtime.id) {
        console.warn('⚠️ Extension context may be invalid. Try refreshing the page.');
        showReloadNotification();
        return;
    }
    
    // Detect platform
    const platform = detectPlatform();
    
    if (platform) {
        console.log('✅ Detected platform:', platform);
        initializeExtension(platform);
    } else {
        console.log('ℹ️ Not on a supported coding platform');
    }
    
    function initializeExtension(platform) {
        injectHelper(platform);
        
        // Auto-detect problem changes (for single-page apps)
        observePageChanges(platform);
        
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener(handleMessage);
    }
    
    function detectPlatform() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('leetcode.com')) return 'leetcode';
        if (hostname.includes('hackerrank.com')) return 'hackerrank';
        if (hostname.includes('codeforces.com')) return 'codeforces';
        if (hostname.includes('geeksforgeeks.org')) return 'geeksforgeeks';
        if (hostname.includes('linkedin.com')) return 'linkedin';
        
        // Job portals
        if (hostname.includes('linkedin.com/jobs')) return 'linkedin-jobs';
        if (hostname.includes('indeed.com')) return 'indeed';
        if (hostname.includes('wellfound.com') || hostname.includes('angel.co')) return 'wellfound';
        if (hostname.includes('glassdoor.com')) return 'glassdoor';
        
        return null;
    }
    
    function injectHelper(platform) {
        // Create floating helper button
        const helperButton = document.createElement('div');
        helperButton.id = 'docmagic-helper';
        helperButton.innerHTML = `
            <button class="docmagic-btn">
                <span class="docmagic-icon">${platform === 'linkedin' ? '👔' : '📚'}</span>
                <span class="docmagic-text">${platform === 'linkedin' ? 'Optimize Profile' : 'Get AI Help'}</span>
            </button>
        `;
        
        document.body.appendChild(helperButton);
        
        // Add click handler
        helperButton.querySelector('.docmagic-btn').addEventListener('click', () => {
            const problemData = extractProblemData(platform);
            showHelpModal(problemData);
        });
    }
    
    // Smart problem data extraction with multiple selectors
    function extractProblemData(platform) {
        let title = '';
        let description = '';
        let difficulty = '';
        let tags = [];
        
        const selectors = {
            leetcode: {
                title: ['[data-cy="question-title"]', '.css-v3d350', 'div[class*="question-title"]', 'h1'],
                description: ['[data-track-load="description_content"]', '.content__u3I1', 'div[class*="elfjS"]', '.question-content'],
                difficulty: ['[diff]', '.css-10o4wqw', 'div[class*="difficulty"]'],
                tags: ['.topic-tag', '[class*="tag"]']
            },
            hackerrank: {
                title: ['.challenge-title', '.challenge-name', 'h1'],
                description: ['.challenge-body', '.problem-statement', '.challenge-text'],
                difficulty: ['.difficulty', '.badge']
            },
            codeforces: {
                title: ['.title', '.problem-statement .title', 'h1'],
                description: ['.problem-statement', '.problem-statement-text'],
                difficulty: ['.tag-box']
            },
            geeksforgeeks: {
                title: ['.problems_problem_content__Xm_eO h3', '.problem-title', 'h1'],
                description: ['.problems_problem_content__Xm_eO', '.problem-description'],
                difficulty: ['.difficulty', '[class*="difficulty"]']
            },
            linkedin: {
                title: ['.text-heading-xlarge', '.pv-text-details__left-panel h1', 'h1'],
                description: ['.pv-about__summary-text', '#about', '.display-flex .ph5'],
                difficulty: [] // Not applicable
            }
        };
        
        const platformSelectors = selectors[platform];
        if (!platformSelectors) return null;
        
        // Try multiple selectors for title
        for (const selector of platformSelectors.title) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                title = element.textContent.trim();
                break;
            }
        }
        
        // Try multiple selectors for description
        for (const selector of platformSelectors.description) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                description = element.textContent.trim();
                break;
            }
        }
        
        // Extract difficulty
        if (platformSelectors.difficulty) {
            for (const selector of platformSelectors.difficulty) {
                const element = document.querySelector(selector);
                if (element) {
                    difficulty = element.textContent.trim();
                    break;
                }
            }
        }
        
        // Extract tags
        if (platformSelectors.tags) {
            for (const selector of platformSelectors.tags) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    tags = Array.from(elements).map(el => el.textContent.trim());
                    break;
                }
            }
        }
        
        // Clean up description (remove extra whitespace)
        description = description.replace(/\s+/g, ' ').trim();
        
        // Special handling for LinkedIn
        if (platform === 'linkedin') {
            return extractLinkedInData();
        }

        return {
            title: title || 'Problem',
            description: description || 'No description found',
            difficulty: difficulty,
            tags: tags,
            platform: platform,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
    }

    function extractLinkedInData() {
        const name = document.querySelector('.text-heading-xlarge')?.textContent?.trim() || 'Profile';
        const headline = document.querySelector('.text-body-medium')?.textContent?.trim() || '';
        const about = document.querySelector('.pv-about__summary-text')?.textContent?.trim() || 
                      document.querySelector('#about')?.parentElement?.nextElementSibling?.textContent?.trim() || '';
        
        // Extract experience (simplified)
        const experienceSection = document.querySelector('#experience');
        let experience = '';
        if (experienceSection) {
            const expList = experienceSection.parentElement.nextElementSibling;
            if (expList) experience = expList.textContent.trim().substring(0, 500) + '...';
        }

        return {
            title: name,
            description: `Headline: ${headline}\n\nAbout: ${about}\n\nExperience: ${experience}`,
            platform: 'linkedin',
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
    }
    
    // Observe page changes for single-page applications
    function observePageChanges(platform) {
        let lastUrl = window.location.href;
        
        const observer = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                console.log('🔄 Page changed, re-initializing...');
                
                // Remove old helper if exists
                const oldHelper = document.getElementById('docmagic-helper');
                if (oldHelper) oldHelper.remove();
                
                // Re-inject helper
                setTimeout(() => injectHelper(platform), 1000);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
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
                            ${problemData.platform === 'linkedin' ? `
                            <button class="docmagic-action-btn" data-action="optimize-profile" style="background: #0A66C2; color: white;">
                                🚀 Optimize Profile
                            </button>
                            ` : ''}
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
    
    // Show reload notification
    function showReloadNotification() {
        const notification = document.createElement('div');
        notification.id = 'docmagic-reload-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FEE2E2;
            color: #991B1B;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">⚠️ DocMagic Extension Disconnected</div>
            <div style="margin-bottom: 12px; font-size: 13px;">Please refresh the page to reconnect.</div>
            <button onclick="location.reload()" style="width: 100%; padding: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Refresh Page Now
            </button>
            <button onclick="this.parentElement.remove()" style="width: 100%; margin-top: 6px; padding: 6px; background: transparent; color: #991B1B; border: 1px solid #991B1B; border-radius: 6px; cursor: pointer; font-size: 12px;">
                Dismiss
            </button>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification && notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    // Check if extension context is valid
    function isExtensionContextValid() {
        try {
            return chrome.runtime && chrome.runtime.id;
        } catch (e) {
            return false;
        }
    }
    
    // Smart action handler - uses background script with Gemini AI
    async function handleAction(action, problemData) {
        const resultDiv = document.getElementById('docmagic-result');
        if (!resultDiv) {
            console.error('Result div not found!');
            return;
        }
        
        // Check if extension context is still valid
        if (!isExtensionContextValid()) {
            resultDiv.innerHTML = `
                <div class="docmagic-error">
                    ❌ Extension was reloaded. Please refresh this page (F5) to reconnect.
                    <br><br>
                    <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Refresh Page Now
                    </button>
                </div>
            `;
            return;
        }
        
        resultDiv.innerHTML = '<div class="docmagic-loading">🤖 AI is analyzing your problem...</div>';
        
        try {
            const prompts = {
                hint: `Give a helpful hint for this coding problem (don't reveal the solution):\n\nTitle: ${problemData.title}\nDescription: ${problemData.description}\n\nProvide a hint that guides thinking.`,
                approach: `Explain the approach to solve this problem:\n\nTitle: ${problemData.title}\nDescription: ${problemData.description}\n\nProvide step-by-step approach without code.`,
                solution: `Solve this coding problem:\n\nTitle: ${problemData.title}\nDescription: ${problemData.description}\n\nProvide: approach, complete code in JavaScript, time/space complexity. Format as JSON.`,
                complexity: `Analyze the complexity for this problem:\n\nTitle: ${problemData.title}\nDescription: ${problemData.description}\n\nProvide time and space complexity analysis.`,
                'optimize-profile': `Analyze this LinkedIn profile and provide optimization tips:\n\nName: ${problemData.title}\n${problemData.description}\n\nProvide:\n1. Headline improvements\n2. About section rewrite\n3. Key skills to highlight\n4. General profile rating (0-10)`
            };
            
            const prompt = prompts[action];
            
            console.log('📤 Sending message to background:', action);
            
            // Double-check context before sending
            if (!isExtensionContextValid()) {
                resultDiv.innerHTML = `
                    <div class="docmagic-error">
                        ❌ Extension connection lost. 
                        <button onclick="location.reload()" style="margin-left: 10px; padding: 0.5rem 1rem; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </div>
                `;
                return;
            }
            
            chrome.runtime.sendMessage(
                { type: 'SOLVE_PROBLEM', prompt },
                (response) => {
                    // Check for Chrome runtime errors
                    if (chrome.runtime.lastError) {
                        console.error('Chrome runtime error:', chrome.runtime.lastError);
                        
                        // Check if it's a context invalidation error
                        if (chrome.runtime.lastError.message.includes('Extension context invalidated')) {
                            resultDiv.innerHTML = `
                                <div class="docmagic-error">
                                    ❌ Extension was reloaded. Please refresh this page.
                                    <br><br>
                                    <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                        Refresh Page Now
                                    </button>
                                </div>
                            `;
                        } else {
                            resultDiv.innerHTML = `<div class="docmagic-error">❌ Extension error: ${chrome.runtime.lastError.message}</div>`;
                        }
                        return;
                    }
                    
                    console.log('📥 Received response:', response);
                    
                    if (!response) {
                        resultDiv.innerHTML = '<div class="docmagic-error">❌ No response from AI. Please check your API key in settings.</div>';
                        return;
                    }
                    
                    if (response.error) {
                        resultDiv.innerHTML = `<div class="docmagic-error">❌ ${response.error}</div>`;
                    } else if (response.data) {
                        displayResult(action, response.data, resultDiv);
                    } else {
                        resultDiv.innerHTML = '<div class="docmagic-error">❌ Invalid response from AI.</div>';
                    }
                }
            );
            
        } catch (error) {
            console.error('Error in handleAction:', error);
            resultDiv.innerHTML = `<div class="docmagic-error">❌ Failed to get AI help: ${error.message}</div>`;
        }
    }
    
    // Handle messages from background script
    function handleMessage(request, sender, sendResponse) {
        if (request.type === 'SHOW_SOLUTION') {
            showInlineResult('Solution', request.data);
        } else if (request.type === 'SHOW_EXPLANATION') {
            showInlineResult('Explanation', request.data);
        } else if (request.type === 'SHOW_HINT') {
            showInlineResult('Hint', request.data);
        } else if (request.type === 'MCP_SCAN_PAGE') {
            // Return page content for MCP analysis
            const content = extractProblemData(platform);
            sendResponse({ content: content });
            return true;
        } else if (request.type === 'MCP_ANALYSIS_COMPLETE') {
            // Display MCP analysis results
            displayMCPAnalysis(request.analysis);
        } else if (request.type === 'VOICE_LISTENING_STATE') {
            updateVoiceIndicator(request.isListening);
        } else if (request.type === 'VOICE_COMMAND') {
            handleVoiceCommand(request);
        }
        sendResponse({ received: true });
    }
    
    // Show result inline on the page
    function showInlineResult(title, data) {
        // Remove existing result if any
        const existing = document.getElementById('docmagic-inline-result');
        if (existing) existing.remove();
        
        const resultBox = document.createElement('div');
        resultBox.id = 'docmagic-inline-result';
        resultBox.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 400px;
            max-height: 600px;
            overflow-y: auto;
            background: white;
            border: 2px solid #10B981;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        
        resultBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #10B981;">📚 ${title}</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #EF4444; color: white; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer;">✕</button>
            </div>
            <div style="color: #333; line-height: 1.6;">
                ${formatResultData(data)}
            </div>
        `;
        
        document.body.appendChild(resultBox);
    }
    
    function formatResultData(data) {
        if (typeof data === 'string') return `<p>${data}</p>`;
        
        let html = '';
        if (data.hint) html += `<p><strong>💡 Hint:</strong> ${data.hint}</p>`;
        if (data.approach) html += `<p><strong>🧩 Approach:</strong><br>${data.approach}</p>`;
        if (data.code) html += `<pre style="background: #f5f5f5; padding: 10px; border-radius: 6px; overflow-x: auto;"><code>${escapeHtml(data.code)}</code></pre>`;
        if (data.timeComplexity) html += `<p><strong>⏱️ Time:</strong> ${data.timeComplexity}</p>`;
        if (data.spaceComplexity) html += `<p><strong>💾 Space:</strong> ${data.spaceComplexity}</p>`;
        if (data.explanation) html += `<p><strong>📖 Explanation:</strong><br>${data.explanation}</p>`;
        if (data.content) html += `<p>${data.content}</p>`;
        
        return html || '<p>Result received!</p>';
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Display MCP Analysis
    function displayMCPAnalysis(analysis) {
        // Remove existing analysis if any
        const existing = document.getElementById('docmagic-mcp-analysis');
        if (existing) existing.remove();
        
        const analysisBox = document.createElement('div');
        analysisBox.id = 'docmagic-mcp-analysis';
        analysisBox.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            overflow-y: auto;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 999998;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
        `;
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 16px;">🔬 AI Analysis</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">×</button>
            </div>
        `;
        
        if (analysis.patterns && analysis.patterns.length > 0) {
            html += `<p><strong>🎯 Patterns:</strong> ${analysis.patterns.join(', ')}</p>`;
        }
        
        if (analysis.dataStructures && analysis.dataStructures.length > 0) {
            html += `<p><strong>💾 Suggested DS:</strong> ${analysis.dataStructures[0].dataStructure}</p>`;
        }
        
        if (analysis.approaches && analysis.approaches.length > 0) {
            const recommended = analysis.approaches.filter(a => a.recommended)[0] || analysis.approaches[0];
            html += `<p><strong>✅ Best Approach:</strong> ${recommended.name} (${recommended.timeComplexity})</p>`;
        }
        
        if (analysis.hints && analysis.hints.length > 0) {
            html += `<p><strong>💡 Hint:</strong> ${analysis.hints[0].hint}</p>`;
        }
        
        html += `<button onclick="this.parentElement.remove()" style="margin-top: 10px; width: 100%; padding: 8px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Got it!</button>`;
        
        analysisBox.innerHTML = html;
        document.body.appendChild(analysisBox);
    }
    
    // Update voice indicator
    function updateVoiceIndicator(isListening) {
        let indicator = document.getElementById('docmagic-voice-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'docmagic-voice-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #10B981;
                color: white;
                border-radius: 25px;
                font-weight: 600;
                z-index: 999999;
                display: none;
                animation: pulse 1.5s infinite;
            `;
            indicator.textContent = '🎤 Listening...';
            document.body.appendChild(indicator);
            
            // Add pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
        
        indicator.style.display = isListening ? 'block' : 'none';
    }
    
    // Handle voice commands
    function handleVoiceCommand(request) {
        console.log('Voice command received:', request.action);
        
        switch (request.action) {
            case 'solve':
            case 'hint':
            case 'approach':
                const problemData = extractProblemData(platform);
                showHelpModal(problemData);
                break;
            case 'start':
                // Start interview mode
                chrome.runtime.sendMessage({ type: 'START_INTERVIEW' });
                break;
        }
    }
    
    // Job Portal Features
    function detectJobPosting() {
        const platform = detectPlatform();
        if (!['linkedin-jobs', 'indeed', 'wellfound', 'glassdoor'].includes(platform)) return null;
        
        let jobData = {
            title: '',
            company: '',
            description: '',
            requirements: '',
            platform: platform
        };
        
        // Extract job details based on platform
        if (platform === 'linkedin-jobs') {
            jobData.title = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim() || '';
            jobData.company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim() || '';
            jobData.description = document.querySelector('.jobs-description__content')?.textContent?.trim() || '';
        } else if (platform === 'indeed') {
            jobData.title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() || '';
            jobData.company = document.querySelector('[data-company-name="true"]')?.textContent?.trim() || '';
            jobData.description = document.getElementById('jobDescriptionText')?.textContent?.trim() || '';
        }
        
        return jobData.description ? jobData : null;
    }
    
    // Auto-generate resume for job posting
    async function handleJobPosting() {
        const jobData = detectJobPosting();
        if (!jobData) return;
        
        // Show floating action button
        showJobAssistant(jobData);
    }
    
    function showJobAssistant(jobData) {
        // Remove existing assistant
        const existing = document.getElementById('docmagic-job-assistant');
        if (existing) existing.remove();
        
        const assistant = document.createElement('div');
        assistant.id = 'docmagic-job-assistant';
        assistant.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 999999;
            max-width: 300px;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        
        assistant.innerHTML = `
            <div style="font-weight: 700; font-size: 1.1em; margin-bottom: 8px;">
                🎯 DocMagic Job Assistant
            </div>
            <div style="font-size: 0.9em; margin-bottom: 12px; opacity: 0.95;">
                Detected: ${jobData.title} at ${jobData.company}
            </div>
            <button id="generate-tailored-resume" style="
                width: 100%;
                padding: 10px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 8px;
            ">
                📝 Generate Tailored Resume
            </button>
            <button id="auto-fill-application" style="
                width: 100%;
                padding: 10px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid white;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 8px;
            ">
                ✨ Auto-Fill Application
            </button>
            <button id="start-voice-interview" style="
                width: 100%;
                padding: 10px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid white;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            ">
                🎤 Practice Interview (10 min)
            </button>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 8px;
                right: 8px;
                background: transparent;
                color: white;
                border: none;
                font-size: 1.2em;
                cursor: pointer;
                padding: 4px;
            ">×</button>
        `;
        
        document.body.appendChild(assistant);
        
        // Add event listeners
        document.getElementById('generate-tailored-resume')?.addEventListener('click', async () => {
            await generateTailoredResumeForJob(jobData);
        });
        
        document.getElementById('auto-fill-application')?.addEventListener('click', async () => {
            await autoFillJobApplication(jobData);
        });
        
        document.getElementById('start-voice-interview')?.addEventListener('click', () => {
            startVoiceInterviewForJob(jobData);
        });
    }
    
    async function generateTailoredResumeForJob(jobData) {
        showInlineResult('Generating Resume', 'Analyzing job description and creating tailored resume...');
        
        try {
            // Send to background for AI processing
            chrome.runtime.sendMessage({
                type: 'GENERATE_TAILORED_RESUME',
                jobData: jobData
            }, (response) => {
                if (response && response.resume) {
                    displayGeneratedResume(response.resume);
                } else {
                    showInlineResult('Error', 'Failed to generate resume. Please try again.');
                }
            });
        } catch (error) {
            console.error('Error generating resume:', error);
            showInlineResult('Error', error.message);
        }
    }
    
    function displayGeneratedResume(resume) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            ">
                <h2 style="margin-bottom: 1rem; color: #667eea;">📝 Tailored Resume Generated!</h2>
                <div style="white-space: pre-wrap; line-height: 1.6;">${JSON.stringify(resume, null, 2)}</div>
                <div style="margin-top: 1.5rem; display: flex; gap: 10px;">
                    <button onclick="navigator.clipboard.writeText(${JSON.stringify(JSON.stringify(resume))})" style="
                        flex: 1;
                        padding: 12px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        📋 Copy Resume
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        flex: 1;
                        padding: 12px;
                        background: #6B7280;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async function autoFillJobApplication(jobData) {
        showInlineResult('Auto-Filling', 'Filling application form automatically...');
        
        // This would interact with form fields on the page
        // Implementation depends on specific job portal structure
        chrome.runtime.sendMessage({
            type: 'AUTO_FILL_JOB_APPLICATION',
            jobData: jobData
        });
    }
    
    function startVoiceInterviewForJob(jobData) {
        chrome.runtime.sendMessage({
            type: 'START_VOICE_INTERVIEW',
            jobData: jobData
        });
    }
    
    // Check for job postings on page load
    if (detectPlatform()?.includes('jobs') || detectPlatform()?.includes('indeed') || 
        detectPlatform()?.includes('wellfound') || detectPlatform()?.includes('glassdoor')) {
        setTimeout(handleJobPosting, 2000);
    }
    
    function displayResult(action, result, container) {
        let html = '';
        
        // Handle both object and string responses
        const data = typeof result === 'string' ? { content: result } : result;
        
        switch(action) {
            case 'hint':
                html = `<div class="docmagic-hint">
                    <h4>💡 Hint:</h4>
                    <p>${data.hint || data.content || 'Think about the problem step by step...'}</p>
                </div>`;
                break;
                
            case 'approach':
                html = `<div class="docmagic-approach">
                    <h4>🧩 Approach:</h4>
                    <p>${data.approach || data.content || 'Analyzing problem...'}</p>
                </div>`;
                break;
                
            case 'solution':
                const code = data.code || data.content || '// Solution code here';
                html = `<div class="docmagic-solution">
                    <h4>✅ Solution:</h4>
                    ${data.approach ? `<p><strong>Approach:</strong> ${data.approach}</p>` : ''}
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 6px; overflow-x: auto;"><code>${escapeHtml(code)}</code></pre>
                    <button class="docmagic-copy-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(code)}'))" style="margin-top: 10px; padding: 8px 16px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        📋 Copy Code
                    </button>
                    ${data.timeComplexity ? `<p style="margin-top: 10px;"><strong>⏱️ Time:</strong> ${data.timeComplexity}</p>` : ''}
                    ${data.spaceComplexity ? `<p><strong>💾 Space:</strong> ${data.spaceComplexity}</p>` : ''}
                </div>`;
                break;
                
                html = `<div class="docmagic-complexity">
                    <h4>⏱️ Complexity Analysis:</h4>
                    <p><strong>Time:</strong> ${data.timeComplexity || data.content || 'O(n)'}</p>
                    <p><strong>Space:</strong> ${data.spaceComplexity || 'O(1)'}</p>
                    ${data.explanation || data.complexityExplanation ? `<p>${data.explanation || data.complexityExplanation}</p>` : ''}
                </div>`;
                break;

            case 'optimize-profile':
                html = `<div class="docmagic-solution">
                    <h4>🚀 Profile Optimization:</h4>
                    <div style="white-space: pre-wrap;">${data.content || data.reply || JSON.stringify(data, null, 2)}</div>
                </div>`;
                break;
        }
        
        container.innerHTML = html;
    }
    
})();
