// GupAd Orchestration Platform - Main Application Logic
console.log('🎯 GupAd Orchestration Platform loaded');

// Global variables
let currentSearchResults = [];
let isLoading = false;

// DOM elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('queryInput');
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
        // Simulate API call
        await simulateSearch(query);
    } catch (error) {
        console.error('Search error:', error);
        showAlert('An error occurred during search', 'danger');
    } finally {
        showLoading(false);
    }
}

// Simulate search functionality
async function simulateSearch(query) {
    console.log('Simulating search for:', query);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock data - more comprehensive and robust
    const mockResults = [
        {
            name: 'High-Value Tech Enthusiasts',
            type: 'Interest',
            platform: 'Facebook',
            coverage: '2.3M',
            cpm: '$12.50',
            id: 'tech_enthusiasts_001'
        },
        {
            name: 'E-commerce Shoppers',
            type: 'Behavior',
            platform: 'Google',
            coverage: '5.1M',
            cpm: '$8.75',
            id: 'ecommerce_shoppers_002'
        },
        {
            name: 'Mobile App Users',
            type: 'Demographic',
            platform: 'TikTok',
            coverage: '8.7M',
            cpm: '$6.25',
            id: 'mobile_users_003'
        },
        {
            name: 'Premium Travelers',
            type: 'Interest',
            platform: 'Instagram',
            coverage: '1.8M',
            cpm: '$15.20',
            id: 'premium_travelers_004'
        },
        {
            name: 'Fitness Enthusiasts',
            type: 'Behavior',
            platform: 'YouTube',
            coverage: '3.2M',
            cpm: '$9.80',
            id: 'fitness_enthusiasts_005'
        }
    ];
    
    console.log('Generated mock results:', mockResults);
    currentSearchResults = mockResults;
    
    // Display results
    displayResults(mockResults);
    
    // Generate AI proposals
    generateAIProposals(query);
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
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${signal.name || 'N/A'}</td>
            <td><span class="badge bg-primary">${signal.type || 'Unknown'}</span></td>
            <td>${signal.platform || 'N/A'}</td>
            <td>${signal.coverage || 'N/A'}</td>
            <td>${signal.cpm || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="activateSignal('${signal.id || 'unknown'}')">
                    <i class="bi bi-plus-circle me-1"></i>Activate
                </button>
            </td>
        `;
        signalsTableBody.appendChild(row);
    });
    
    console.log('Table updated successfully');
    
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
    
    if (!proposalsContent || !proposalsTabCount) return;
    
    proposalsTabCount.textContent = proposals.length;
    
    if (proposals.length === 0) {
        proposalsContent.innerHTML = '<p class="text-muted">No custom proposals available.</p>';
        return;
    }
    
    let proposalsHTML = '';
    proposals.forEach(proposal => {
        proposalsHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-title">${proposal.name}</h6>
                    <p class="card-text text-muted">${proposal.description}</p>
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">Estimated Reach: ${proposal.estimatedReach}</small>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted">Confidence: ${proposal.confidence}</small>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary mt-2" onclick="activateProposal('${proposal.name}')">
                        <i class="bi bi-robot me-1"></i>Activate AI Segment
                    </button>
                </div>
            </div>
        `;
    });
    
    proposalsContent.innerHTML = proposalsHTML;
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
function activateSignal(signalId) {
    console.log('Activating signal:', signalId);
    showAlert(`Signal "${signalId}" activated successfully!`, 'success');
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
    
    // Add any additional initialization logic here
    // For example, setting up tooltips, modals, etc.
}

// Update metrics display
function updateMetrics(results) {
    const totalSignals = document.getElementById('totalSignals');
    const avgCoverage = document.getElementById('avgCoverage');
    const avgCPM = document.getElementById('avgCPM');
    
    if (totalSignals) {
        totalSignals.textContent = results.length;
    }
    
    if (avgCoverage && results.length > 0) {
        // Calculate average coverage (simplified)
        const avg = Math.round(results.length * 2.5); // Mock calculation
        avgCoverage.textContent = `${avg}M`;
    }
    
    if (avgCPM && results.length > 0) {
        // Calculate average CPM (simplified)
        const avg = Math.round(results.length * 3.5); // Mock calculation
        avgCPM.textContent = `$${avg}.50`;
    }
}

// Export functions for global access
window.activateSignal = activateSignal;
window.activateProposal = activateProposal;
