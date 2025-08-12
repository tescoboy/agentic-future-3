// Configuration
const BASE_URL = 'https://signals-agent-backend.onrender.com';

// DOM elements
let searchForm, queryInput, maxResultsSelect, resultsSection, loadingOverlay;

// State
let currentData = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up form listener...');
    initializeElements();
    bindEvents();
});

function initializeElements() {
    searchForm = document.getElementById('searchForm');
    queryInput = document.getElementById('queryInput');
    maxResultsSelect = document.getElementById('maxResultsSelect');
    resultsSection = document.getElementById('resultsSection');
    loadingOverlay = document.getElementById('loadingOverlay');
}

function bindEvents() {
    if (searchForm) {
        console.log('Found search form, adding submit listener...');
        searchForm.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted!');
    
    const query = queryInput.value.trim();
    const maxResults = parseInt(maxResultsSelect.value);
    
    console.log('Query:', query);
    console.log('Max results:', maxResults);
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    showLoadingScreen();
    
    try {
        await fetchSignals(query, maxResults);
    } catch (error) {
        console.error('Error fetching signals:', error);
        hideLoadingScreen();
        alert('Error fetching signals. Please try again.');
    }
}

async function fetchSignals(spec, maxResults) {
    console.log('fetchSignals called with:', spec, maxResults);
    
    const url = `${BASE_URL}/api/signals?spec=${encodeURIComponent(spec)}&max_results=${maxResults}`;
    console.log('Fetching from URL:', url);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        hideLoadingScreen();
        displayResults(data);
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error in fetchSignals:', error);
        hideLoadingScreen();
        
        if (error.name === 'AbortError') {
            alert('Request timed out. Please try again.');
        } else {
            alert(`Error: ${error.message}`);
        }
    }
}

function showLoadingScreen() {
    loadingOverlay.style.display = 'flex';
    
    // Animate steps
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let currentStep = 0;
    
    const stepInterval = setInterval(() => {
        steps.forEach((step, index) => {
            const stepElement = document.getElementById(step);
            if (index === currentStep) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });
        
        currentStep = (currentStep + 1) % steps.length;
    }, 1000);
    
    // Store interval for cleanup
    loadingOverlay.stepInterval = stepInterval;
}

function hideLoadingScreen() {
    loadingOverlay.style.display = 'none';
    
    // Clear step animation
    if (loadingOverlay.stepInterval) {
        clearInterval(loadingOverlay.stepInterval);
    }
}

function displayResults(data) {
    currentData = data;
    resultsSection.style.display = 'block';
    
    renderKPIs(data);
    renderSignalsTable(data);
    renderProposals(data);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function renderKPIs(data) {
    const signals = data.signals || [];
    const proposals = data.custom_segment_proposals || [];
    
    document.getElementById('foundCount').textContent = signals.length;
    document.getElementById('signalsCount').textContent = signals.length;
    document.getElementById('proposalsTabCount').textContent = proposals.length;
    document.getElementById('rankingMethod').textContent = data.ranking_method || 'N/A';
    
    // Calculate coverage and CPM ranges
    if (signals.length > 0) {
        const coverages = signals.map(s => s.coverage_percentage).filter(c => c != null);
        const cpms = signals.map(s => s.pricing?.cpm).filter(c => c != null);
        
        if (coverages.length > 0) {
            const minCoverage = Math.min(...coverages);
            const maxCoverage = Math.max(...coverages);
            document.getElementById('coverageRange').textContent = `${minCoverage.toFixed(1)}% - ${maxCoverage.toFixed(1)}%`;
        }
        
        if (cpms.length > 0) {
            const minCpm = Math.min(...cpms);
            const maxCpm = Math.max(...cpms);
            document.getElementById('cpmRange').textContent = `$${minCpm.toFixed(2)} - $${maxCpm.toFixed(2)}`;
        }
    }
}

function renderSignalsTable(data) {
    const signals = data.signals || [];
    const tableBody = document.getElementById('signalsTableBody');
    tableBody.innerHTML = '';
    
    signals.forEach(signal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${signal.name || 'N/A'}</td>
            <td>${signal.data_provider || 'N/A'}</td>
            <td>${signal.coverage_percentage ? signal.coverage_percentage.toFixed(1) + '%' : 'N/A'}</td>
            <td>${signal.pricing?.cpm ? '$' + signal.pricing.cpm.toFixed(2) : 'N/A'}</td>
            <td>${signal.deployments?.map(d => d.platform).join(', ') || 'N/A'}</td>
            <td>
                <button class="activate-btn" data-signal-id="${signal.signals_agent_segment_id}">
                    Activate
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Bind table events using event delegation
    bindTableEvents();
}

function renderProposals(data) {
    const proposals = data.custom_segment_proposals || [];
    const proposalsContent = document.getElementById('proposalsContent');
    
    if (proposals.length > 0) {
        let proposalsHtml = '<div class="row">';
        proposals.forEach(proposal => {
            proposalsHtml += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="card-title mb-0">${proposal.proposed_name}</h6>
                                <span class="badge bg-primary">AI Generated</span>
                            </div>
                            <p class="card-text mb-3">${proposal.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    Coverage: ${proposal.estimated_coverage_percentage.toFixed(1)}% | 
                                    CPM: $${proposal.estimated_cpm.toFixed(2)}
                                </small>
                                <button class="activate-btn" data-proposal-id="${proposal.custom_segment_id}">
                                    Activate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        proposalsHtml += '</div>';
        proposalsContent.innerHTML = proposalsHtml;
    } else {
        proposalsContent.innerHTML = '<p class="text-muted">No custom proposals available.</p>';
    }
    
    // Bind proposal events
    bindProposalEvents();
}

function bindTableEvents() {
    // Use event delegation for table actions
    const tableBody = document.getElementById('signalsTableBody');
    tableBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('activate-btn')) {
            const signalId = e.target.getAttribute('data-signal-id');
            activateSignal(signalId);
        }
    });
}

function bindProposalEvents() {
    // Use event delegation for proposal actions
    const proposalsContent = document.getElementById('proposalsContent');
    proposalsContent.addEventListener('click', function(e) {
        if (e.target.classList.contains('activate-btn')) {
            const proposalId = e.target.getAttribute('data-proposal-id');
            activateProposal(proposalId);
        }
    });
}

function activateSignal(signalId) {
    alert(`Activating signal: ${signalId}`);
    // TODO: Implement actual signal activation
}

function activateProposal(proposalId) {
    alert(`Activating custom proposal: ${proposalId}`);
    // TODO: Implement actual proposal activation
}

// Utility functions
function formatCurrency(amount) {
    return amount ? `$${parseFloat(amount).toFixed(2)}` : 'N/A';
}

function formatPercentage(value) {
    return value ? `${parseFloat(value).toFixed(1)}%` : 'N/A';
}

function formatPlatforms(deployments) {
    return deployments?.map(d => d.platform).join(', ') || 'N/A';
}
