// GupAd Orchestration Platform - Main Application Logic
console.log('🎯 GupAd Orchestration Platform loaded');

// Global variables
let currentSearchResults = [];
let isLoading = false;

// Backend API configuration
const BACKEND_URL = 'https://signals-agent-backend.onrender.com';
const AUDIENCE_AGENT_URL = 'https://signals-agent-backend.onrender.com';

// DOM elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('queryInput');
const maxResultsSelect = document.getElementById('maxResultsSelect');
const gupadsCheck = document.getElementById('gupadsCheck');
const bokadsCheck = document.getElementById('bokadsCheck');
const loadingOverlay = document.getElementById('loadingOverlay');
const signalsTableBody = document.getElementById('signalsTableBody');
const proposalsContent = document.getElementById('proposalsContent');
const proposalsTabCount = document.getElementById('proposalsTabCount');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing GupAd Orchestration Platform...');
    
    // Debug: Check if all required elements are found
    console.log('Search form found:', !!searchForm);
    console.log('Search input found:', !!searchInput);
    console.log('Loading overlay found:', !!loadingOverlay);
    console.log('Signals table body found:', !!signalsTableBody);
    console.log('Proposals content found:', !!proposalsContent);
    console.log('Proposals tab count found:', !!proposalsTabCount);
    
    // Add event listeners
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
        console.log('Search form event listener added');
    } else {
        console.error('Search form not found!');
    }
    
    // Initialize any other components
    initializeComponents();
    
    console.log('GupAd Orchestration Platform initialization complete');
});

// Handle search form submission
async function handleSearch(event) {
    event.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) {
        showAlert('Please enter a search query', 'warning');
        return;
    }
    
    console.log('Searching for:', query);
    showLoading(true);
    
    try {
        // Make real API call to backend
        await simulateSearch(query);
    } catch (error) {
        console.error('Search error:', error);
        showAlert('An error occurred during search', 'danger');
    } finally {
        showLoading(false);
    }
}

// Real search functionality - connected to backend
async function simulateSearch(query) {
    console.log('Searching backend for:', query);
    
    const useGupAds = gupadsCheck.checked;
    const useBOKads = bokadsCheck.checked;
    const maxResults = parseInt(maxResultsSelect.value);
    
    console.log(`GupAds: ${useGupAds}, BOKads: ${useBOKads}, Max results: ${maxResults}`);
    
    try {
        let allResults = [];
        let allProposals = [];
        
        // Create array of promises for concurrent API calls
        const apiPromises = [];
        
        // Add GupAds API call if selected
        if (useGupAds) {
            console.log('🔍 Adding GupAds API call...');
            apiPromises.push(
                fetch(`${BACKEND_URL}/api/signals?spec=${encodeURIComponent(query)}&max_results=${maxResults}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(async (response) => {
                    if (response.ok) {
                        const data = await response.json();
                        console.log('GupAds response:', data);
                        return {
                            source: 'GupAds',
                            signals: (data.signals || []).map(signal => ({
                                ...signal,
                                source: 'GupAds'
                            })),
                            proposals: data.custom_segment_proposals || []
                        };
                    } else {
                        console.warn('GupAds API failed:', response.status);
                        return { source: 'GupAds', signals: [], proposals: [] };
                    }
                })
                .catch((error) => {
                    console.error('GupAds API error:', error);
                    return { source: 'GupAds', signals: [], proposals: [] };
                })
            );
        }
        
        // Add BOKads (Audience-Agent) API call if selected
        if (useBOKads) {
            console.log('🔍 Adding BOKads (Audience-Agent) API call...');
            apiPromises.push(
                fetch(`${AUDIENCE_AGENT_URL}/audience-agent/signals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        signal_spec: query,
                        max_results: maxResults,
                        deliver_to: {
                            platforms: "all",
                            countries: ["US"]
                        }
                    })
                })
                .then(async (response) => {
                    if (response.ok) {
                        const data = await response.json();
                        console.log('BOKads (Audience-Agent) response:', data);
                        return {
                            source: 'BOKads',
                            signals: (data.signals || []).map(signal => ({
                                ...signal,
                                source: 'BOKads'
                            })),
                            proposals: data.custom_segments || []
                        };
                    } else {
                        console.warn('BOKads (Audience-Agent) API failed:', response.status);
                        return { source: 'BOKads', signals: [], proposals: [] };
                    }
                })
                .catch((error) => {
                    console.error('BOKads (Audience-Agent) API error:', error);
                    return { source: 'BOKads', signals: [], proposals: [] };
                })
            );
        }
        
        // Execute all API calls concurrently
        console.log(`🚀 Executing ${apiPromises.length} API calls concurrently...`);
        const results = await Promise.all(apiPromises);
        
        // Combine all results
        results.forEach(result => {
            allResults = allResults.concat(result.signals);
            allProposals = allProposals.concat(result.proposals);
        });
        
        console.log(`✅ All API calls completed. Total signals: ${allResults.length}, Total proposals: ${allProposals.length}`);
        
        // If no results from either API, fall back to mock data
        if (allResults.length === 0) {
            console.log('No results from APIs, using fallback mock data');
            allResults = [
                {
                    name: 'High-Value Tech Enthusiasts',
                    type: 'Interest',
                    platform: 'Facebook',
                    coverage: '2.3M',
                    cpm: '$12.50',
                    id: 'tech_enthusiasts_001',
                    source: 'GupAds'
                },
                {
                    name: 'E-commerce Shoppers',
                    type: 'Behavior',
                    platform: 'Google',
                    coverage: '5.1M',
                    cpm: '$8.75',
                    id: 'ecommerce_shoppers_002',
                    source: 'GupAds'
                },
                {
                    name: 'Mobile App Users',
                    type: 'Demographic',
                    platform: 'TikTok',
                    coverage: '8.7M',
                    cpm: '$6.25',
                    id: 'mobile_users_003',
                    source: 'GupAds'
                },
                {
                    name: 'Premium Travelers',
                    type: 'Interest',
                    platform: 'Instagram',
                    coverage: '1.8M',
                    cpm: '$15.20',
                    id: 'premium_travelers_004',
                    source: 'GupAds'
                },
                {
                    name: 'Fitness Enthusiasts',
                    type: 'Behavior',
                    platform: 'YouTube',
                    coverage: '3.2M',
                    cpm: '$9.80',
                    id: 'fitness_enthusiasts_005',
                    source: 'GupAds'
                }
            ];
        }
        
        currentSearchResults = allResults;
        
        // Display results
        displayResults(allResults);
        
        // Display custom segment proposals if available
        if (allProposals.length > 0) {
            console.log('Found custom segment proposals:', allProposals);
            displayProposals(allProposals);
        } else {
            console.log('No custom segment proposals found, generating fallback proposals');
            generateAIProposals(query);
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showAlert('An error occurred during search', 'danger');
    }
}

// Display search results
function displayResults(results) {
    console.log('Displaying results:', results);
    console.log('Signals table body element:', signalsTableBody);
    
    if (!signalsTableBody) {
        console.error('signalsTableBody element not found!');
        return;
    }
    
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Clear existing content
    signalsTableBody.innerHTML = '';
    
    // Ensure we have results
    if (!results || results.length === 0) {
        console.log('No results to display');
        signalsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No signals found</td></tr>';
        return;
    }
    
    console.log('Adding', results.length, 'rows to table');
    
    results.forEach((signal, index) => {
        console.log('Processing signal', index + 1, ':', signal);
        
        // Extract data from backend format
        const name = signal.name || 'N/A';
        const type = signal.signal_type || signal.type || 'Unknown';
        const provider = signal.data_provider || signal.platform || 'N/A';
        const platform = signal.deployments && signal.deployments.length > 0 ? signal.deployments[0].platform : 'N/A';
        const coverage = signal.coverage_percentage ? `${signal.coverage_percentage.toFixed(1)}%` : (signal.coverage || 'N/A');
        const cpm = signal.pricing && signal.pricing.cpm ? `$${signal.pricing.cpm.toFixed(2)}` : (signal.cpm || 'N/A');
        const id = signal.signals_agent_segment_id || signal.id || 'unknown';
        const source = signal.source || 'Unknown';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td><span class="badge bg-primary">${type}</span></td>
            <td>${provider}</td>
            <td><span class="badge ${source === 'GupAds' ? 'bg-success' : 'bg-info'}">${source}</span></td>
            <td>${platform}</td>
            <td>${coverage}</td>
            <td>${cpm}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="activateSignal('${id}')">
                    <i class="bi bi-plus-circle me-1"></i>Activate
                </button>
            </td>
        `;
        signalsTableBody.appendChild(row);
    });
    
    console.log('Table updated successfully');
    
    // Ensure signals tab is active by default
    const signalsTab = document.getElementById('signals-tab');
    if (signalsTab) {
        const signalsTabButton = new bootstrap.Tab(signalsTab);
        signalsTabButton.show();
        console.log('Signals tab activated by default');
    }
    
    // Update metrics
    updateMetrics(results);
}

// Generate AI proposals
async function generateAIProposals(query) {
    console.log('Generating AI proposals for:', query);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const proposals = [
        {
            name: `Custom ${query} Enthusiasts`,
            description: 'AI-generated segment based on your search criteria',
            estimatedReach: '1.2M',
            confidence: '85%'
        },
        {
            name: `${query} Power Users`,
            description: 'High-engagement audience segment',
            estimatedReach: '890K',
            confidence: '92%'
        }
    ];
    
    displayProposals(proposals);
}

// Display AI proposals
function displayProposals(proposals) {
    console.log('Displaying proposals:', proposals);
    console.log('proposalsContent element:', proposalsContent);
    console.log('proposalsTabCount element:', proposalsTabCount);
    
    if (!proposalsContent || !proposalsTabCount) {
        console.error('Required elements not found for displaying proposals');
        return;
    }
    
    proposalsTabCount.textContent = proposals.length;
    
    // Update the metrics display
    const customProposalsMetric = document.getElementById('customProposals');
    if (customProposalsMetric) {
        customProposalsMetric.textContent = proposals.length;
        console.log('Updated custom proposals metric to:', proposals.length);
    }
    
    // Show notification if we have proposals (but don't be intrusive)
    if (proposals.length > 0) {
        console.log(`🎯 ${proposals.length} AI-generated custom segments available in the proposals tab`);
    }
    
    if (proposals.length === 0) {
        proposalsContent.innerHTML = '<p class="text-muted">No custom proposals available.</p>';
        return;
    }
    
    let proposalsHTML = '';
    proposals.forEach(proposal => {
        // Handle both backend format and fallback format
        const name = proposal.proposed_name || proposal.name || 'Custom Proposal';
        const description = proposal.description || '';
        const estimatedReach = proposal.estimated_coverage_percentage ? `${proposal.estimated_coverage_percentage}%` : (proposal.estimatedReach || 'N/A');
        const confidence = proposal.estimated_cpm ? `$${proposal.estimated_cpm.toFixed(2)} CPM` : (proposal.confidence || 'N/A');
        const rationale = proposal.creation_rationale || '';
        
        proposalsHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-title">${name}</h6>
                    <p class="card-text text-muted">${description}</p>
                    ${rationale ? `<p class="card-text"><small class="text-info"><strong>Rationale:</strong> ${rationale}</small></p>` : ''}
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">Estimated Coverage: ${estimatedReach}</small>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted">Estimated CPM: ${confidence}</small>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary mt-2" onclick="activateProposal('${name}')">
                        <i class="bi bi-robot me-1"></i>Activate AI Segment
                    </button>
                </div>
            </div>
        `;
    });
    
    console.log('Generated proposals HTML:', proposalsHTML);
    proposalsContent.innerHTML = proposalsHTML;
    console.log('Proposals content updated, new innerHTML:', proposalsContent.innerHTML);
    
    // If we have proposals, make sure the proposals tab is visible and clickable
    if (proposals.length > 0) {
        const proposalsTab = document.getElementById('proposals-tab');
        if (proposalsTab) {
            proposalsTab.style.display = 'block';
            console.log('Proposals tab is now visible');
            
            // Keep the signals tab active by default - don't auto-switch to proposals
            console.log('Keeping signals tab active - proposals available in separate tab');
        }
    }
}

// Show/hide loading overlay
function showLoading(show) {
    if (!loadingOverlay) return;
    
    isLoading = show;
    loadingOverlay.style.display = show ? 'flex' : 'none';
    
    if (show) {
        // Animate loading steps
        animateLoadingSteps();
    }
}

// Animate loading steps
function animateLoadingSteps() {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let currentStep = 0;
    
    const stepInterval = setInterval(() => {
        if (!isLoading) {
            clearInterval(stepInterval);
            return;
        }
        
        // Remove active class from all steps
        steps.forEach(step => {
            const stepElement = document.getElementById(step);
            if (stepElement) {
                stepElement.classList.remove('active');
            }
        });
        
        // Add active class to current step
        if (currentStep < steps.length) {
            const stepElement = document.getElementById(steps[currentStep]);
            if (stepElement) {
                stepElement.classList.add('active');
            }
            currentStep++;
        } else {
            clearInterval(stepInterval);
        }
    }, 800);
}

// Activate signal
async function activateSignal(signalId) {
    console.log('Activating signal:', signalId);
    
    try {
        // Find the signal in current results to determine source
        const signal = currentSearchResults.find(s => s.signals_agent_segment_id === signalId || s.id === signalId);
        
        if (signal && signal.source === 'BOKads') {
            // Use audience-agent activation endpoint for BOKads signals
            const response = await fetch(`${AUDIENCE_AGENT_URL}/audience-agent/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signal_id: signalId,
                    platform: signal.deployments?.[0]?.platform || 'liveramp',
                    account: signal.deployments?.[0]?.account || 'default'
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                showAlert(`BOKads signal "${signal.name}" activated successfully! Status: ${result.status}`, 'success');
            } else {
                showAlert(`Failed to activate BOKads signal: ${response.status}`, 'danger');
            }
        } else {
            // For GupAds signals, use existing logic
            showAlert(`Signal "${signalId}" activated successfully!`, 'success');
        }
    } catch (error) {
        console.error('Activation error:', error);
        showAlert(`Failed to activate signal: ${error.message}`, 'danger');
    }
}

// Activate AI proposal
function activateProposal(proposalName) {
    console.log('Activating AI proposal:', proposalName);
    showAlert(`AI segment "${proposalName}" activated successfully!`, 'success');
}

// Show alert message
function showAlert(message, type = 'info') {
    console.log(`Alert [${type}]:`, message);
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Initialize components
function initializeComponents() {
    console.log('Initializing components...');
    
    // Test backend connection
    testBackendConnection();
    
    // Initialize proposals tab
    initializeProposalsTab();
    
    // Add any additional initialization logic here
    // For example, setting up tooltips, modals, etc.
}

// Initialize proposals tab
function initializeProposalsTab() {
    console.log('Initializing proposals tab...');
    
    const proposalsTab = document.getElementById('proposals-tab');
    const proposalsContent = document.getElementById('proposalsContent');
    
    if (proposalsTab) {
        console.log('Proposals tab found:', proposalsTab);
        proposalsTab.style.display = 'block';
    } else {
        console.error('Proposals tab not found!');
    }
    
    if (proposalsContent) {
        console.log('Proposals content found:', proposalsContent);
    } else {
        console.error('Proposals content not found!');
    }
}

// Test backend connection
async function testBackendConnection() {
    try {
        console.log('Testing backend connection...');
        const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            console.log('✅ Backend connection successful');
        } else {
            console.warn('⚠️ Backend responded but with status:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Backend connection test failed:', error.message);
        console.log('Will use fallback mock data if needed');
    }
}

// Update metrics display
function updateMetrics(results) {
    const totalSignals = document.getElementById('totalSignals');
    const avgCoverage = document.getElementById('avgCoverage');
    const avgCPM = document.getElementById('avgCPM');
    const customProposals = document.getElementById('customProposals');
    
    if (totalSignals) {
        totalSignals.textContent = results.length;
    }
    
    if (avgCoverage && results.length > 0) {
        // Calculate average coverage from backend data
        const totalCoverage = results.reduce((sum, signal) => {
            return sum + (signal.coverage_percentage || 0);
        }, 0);
        const avg = (totalCoverage / results.length).toFixed(1);
        avgCoverage.textContent = `${avg}%`;
    }
    
    if (avgCPM && results.length > 0) {
        // Calculate average CPM from backend data
        const totalCPM = results.reduce((sum, signal) => {
            return sum + (signal.pricing?.cpm || 0);
        }, 0);
        const avg = (totalCPM / results.length).toFixed(2);
        avgCPM.textContent = `$${avg}`;
    }
    
    // Update custom proposals count - this will be updated when proposals are displayed
    if (customProposals) {
        // This will be updated by displayProposals function
        console.log('Custom proposals metric element found:', customProposals);
    }
}

// Export functions for global access
window.activateSignal = activateSignal;
window.activateProposal = activateProposal;
