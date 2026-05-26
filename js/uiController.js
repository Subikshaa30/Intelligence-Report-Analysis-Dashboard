/* ===== UI CONTROLLER ===== */
/* Handles UI interactions and state management */

class UIController {
    constructor() {
        this.selectedSuspect = null;
        this.isAnimating = false;
        this.bindElements();
        this.bindEvents();
    }

    /**
     * Cache DOM elements
     */
    bindElements() {
        this.suspectListEl = document.getElementById('suspectList');
        this.scoreValueEl = document.getElementById('scoreValue');
        this.aliasesValueEl = document.getElementById('aliasesValue');
        this.whatListEl = document.getElementById('whatList');
        this.whenWhereListEl = document.getElementById('whenWhereList');
        this.playBtnEl = document.getElementById('playBtn');
        this.peopleListEl = document.getElementById('peopleList');
        this.placesListEl = document.getElementById('placesList');
        this.organizationsListEl = document.getElementById('organizationsList');
        this.networkContainerEl = document.getElementById('networkContainer');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.playBtnEl.addEventListener('click', () => this.onPlayClick());
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.onTabClick(e));
        });

        // Reports Board toggle and close buttons' event listeners are bound below after ReportsBoard definition
    }

    /**
     * Initialize suspect list
     */
    initSuspectList() {
        const suspects = dataManager.getSuspectsSortedByScore();

        this.suspectListEl.innerHTML = '';
        suspects.forEach(suspect => {
            const li = document.createElement('li');
            li.textContent = suspect.name;
            li.addEventListener('click', () => this.selectSuspect(suspect.name, li));
            this.suspectListEl.appendChild(li);
        });

        console.log('✓ Suspect list initialized: ' + suspects.length + ' suspects');
    }

    /**
     * Handle suspect selection
     */
    selectSuspect(suspectName, liElement) {
        this.selectedSuspect = suspectName;

        // Update active state
        document.querySelectorAll('.suspect-list li').forEach(li => li.classList.remove('active'));
        liElement.classList.add('active');

        // Load details
        this.loadSuspectDetails(suspectName);

        // Reset network
        networkVisualizer.clear();
        networkVisualizer.initVisualization();
        this.resetRightPanels();

        console.log('Selected suspect: ' + suspectName);
    }

    /**
     * Load and display suspect details
     */
    loadSuspectDetails(suspectName) {
        const suspectData = dataManager.getSuspectByName(suspectName);
        if (!suspectData) return;

        this.scoreValueEl.textContent = suspectData.score;

        if (suspectData.aliases && suspectData.aliases.length > 0) {
            this.aliasesValueEl.textContent = suspectData.aliases.join(', ');
        } else {
            this.aliasesValueEl.textContent = 'None';
        }

        this.whatListEl.innerHTML = '';
        if (suspectData.what && suspectData.what.length > 1) {
            suspectData.what.slice(1).forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                this.whatListEl.appendChild(li);
            });
        }

        this.whenWhereListEl.innerHTML = '';
        if (suspectData['when & where'] && suspectData['when & where'].length > 1) {
            suspectData['when & where'].slice(1).forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                this.whenWhereListEl.appendChild(li);
            });
        }
    }

    /**
     * Reset right panels
     */
    resetRightPanels() {
        [this.peopleListEl, this.placesListEl, this.organizationsListEl].forEach(el => {
            el.innerHTML = '<li class="placeholder">Select a suspect</li>';
        });
    }

    /**
     * Update right panels with data
     */
    updateRightPanels(people, places, orgs) {
        this.updatePanel(this.peopleListEl, people, 'No people involved');
        this.updatePanel(this.placesListEl, places, 'No places found');
        this.updatePanel(this.organizationsListEl, orgs, 'No organizations found');
    }

    /**
     * Helper to update a single panel
     */
    updatePanel(element, data, emptyMessage) {
        element.innerHTML = '';
        if (data.length > 0) {
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                element.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = emptyMessage;
            li.className = 'placeholder';
            element.appendChild(li);
        }
    }

    /**
     * Handle play button click
     */
    async onPlayClick() {
        if (!this.selectedSuspect || this.isAnimating) return;

        this.isAnimating = true;
        this.playBtnEl.disabled = true;

        document.getElementById('networkOverlay').style.display = 'block';

        // Reset visualization
        networkVisualizer.clear();
        networkVisualizer.initVisualization();
        this.resetRightPanels();

        // Get suspect data
        const suspectData = dataManager.getSuspectByName(this.selectedSuspect);
        if (!suspectData) {
            console.warn('Suspect not found:', this.selectedSuspect);
            this.isAnimating = false;
            this.playBtnEl.disabled = false;
            document.getElementById('networkOverlay').style.display = 'none';
            return;
        }
        const fileIds = suspectData.files;

        // Create nodes and links
        const nodes = fileIds.map((id, i) => ({
            id,
            x: i * 120,
            y: 0
        }));

        const links = [];
        fileIds.forEach((id, i) => {
            if (i > 0) {
                links.push({
                    source: nodes[i - 1],
                    target: nodes[i]
                });
            }
        });

        // Render initial graph
        networkVisualizer.renderGraph(nodes, links);

        // Animate with panel updates
        const DELAY = 2000;
        for (let i = 0; i < fileIds.length; i++) {
            const nodeId = fileIds[i];

            // Reveal node
            networkVisualizer.g.selectAll('.node')
                .filter(d => d.id === nodeId)
                .transition()
                .duration(500)
                .attr('opacity', 1);

            networkVisualizer.g.selectAll('.node-label')
                .filter(d => d.id === nodeId)
                .transition()
                .duration(500)
                .attr('opacity', 1);

            // Show tooltip
            const report = dataManager.getReportById(nodeId);
            if (report) {
                const tooltip = document.getElementById('tooltip');
                tooltip.innerHTML = `<div><strong>Date:</strong> ${report.REPORTDATE}</div><div><strong>Source:</strong> ${report.REPORTSOURCE}</div>`;
                tooltip.style.display = 'block';
                const node = networkVisualizer.nodeMap.get(nodeId);
                tooltip.style.left = (node.x + 100) + 'px';
                tooltip.style.top = (node.y + 250) + 'px';
            }

            // Update right panels with cumulative data
            const accumulated = dataManager.accumulateData(
                fileIds.slice(0, i + 1),
                this.selectedSuspect,
                suspectData.aliases || []
            );
            this.updateRightPanels(accumulated.people, accumulated.places, accumulated.orgs);

            // Wait before next node
            if (i < fileIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, DELAY));
            }
        }

        const reportsForNetwork = getReportsByIds(fileIds);
        prepareReportsBoard(reportsForNetwork);  // load reports but DON'T show


        document.getElementById('tooltip').style.display = 'none';
        document.getElementById('networkOverlay').style.display = 'none';
        this.isAnimating = false;
        this.playBtnEl.disabled = false;
    }

    /**
     * Handle tab click
     */
    onTabClick(event) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
}

// ReportsBoard managing dialogs
class ReportsBoard {
    constructor() {
    this.container = document.getElementById('reportsBoardOverlay'); // Outer overlay
    this.innerContainer = document.getElementById('reportsBoardInnerContainer'); // Actual board div inside

    this.dialogs = [];

    // Clicking inside the board should NOT close it
    this.innerContainer.addEventListener('click', e => {
      e.stopPropagation();
    });

    // Clicking outside (on overlay but outside board) closes board
    this.container.addEventListener('click', e => {
      if (e.target === this.container) {
        this.hide();
      }
    });
  }
    show() {
        this.container.style.display = 'block';
    }
    hide() {
        this.container.style.display = 'none';
    }
    clear() {
        this.dialogs.forEach(d => this.container.removeChild(d));
        this.dialogs = [];
    }
    addReport(report, index) {
    const dialog = document.createElement('div');
    dialog.className = 'report-dialog';
    dialog.style.position = 'absolute';
    dialog.style.top = `${30 + index * 40}px`;
    dialog.style.left = `${30 + index * 40}px`;

    // Create a short snippet and full description sections
    const fullDescription = report.REPORTDESCRIPTION || 'N/A';
    const shortDescription = fullDescription.length > 100 ? fullDescription.slice(0, 100) + '...' : fullDescription;

    dialog.innerHTML = `
      <div class="report-number">${index + 1}</div>
      <button class="report-close" title="Close report">&times;</button>
      <div><strong>Report ID:</strong> ${report.ID}</div>
      <div><strong>Date:</strong> ${report.REPORTDATE}</div>
      <div><strong>Source:</strong> ${report.REPORTSOURCE}</div>
      <div class="description-container">
        <p class="description-text">${shortDescription}</p>
        ${fullDescription.length > 100 ? '<button class="toggle-desc-btn">Show more</button>' : ''}
        <p class="full-description" style="display:none;">${fullDescription}</p>
      </div>
    `;


    dialog.querySelector('.report-close').addEventListener('click', () => {
      this.container.removeChild(dialog);
      this.dialogs = this.dialogs.filter(d => d !== dialog);
    });

    if(fullDescription.length > 100) {
      const toggleBtn = dialog.querySelector('.toggle-desc-btn');
      const shortDescEl = dialog.querySelector('.description-text');
      const fullDescEl = dialog.querySelector('.full-description');

      toggleBtn.addEventListener('click', () => {
        const expanded = fullDescEl.style.display === 'block';
        if (expanded) {
          fullDescEl.style.display = 'none';
          shortDescEl.style.display = 'block';
          toggleBtn.textContent = 'Show more';
        } else {
          fullDescEl.style.display = 'block';
          shortDescEl.style.display = 'none';
          toggleBtn.textContent = 'Show less';
        }
      });
    }

    this.makeDraggable(dialog);
    this.container.appendChild(dialog);
    this.dialogs.push(dialog);
  }

    makeDraggable(element) {
        let offsetX, offsetY;
        element.addEventListener('mousedown', (e) => {
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            const move = (event) => {
                let x = event.clientX - offsetX;
                let y = event.clientY - offsetY;
                const rect = this.container.getBoundingClientRect();
                const elRect = element.getBoundingClientRect();
                x = Math.max(0, Math.min(x, rect.width - elRect.width));
                y = Math.max(0, Math.min(y, rect.height - elRect.height));
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
            };
            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });
    }
}

const reportsBoard = new ReportsBoard();



document.getElementById('reportsBoardToggleBtn').addEventListener('click', () => {
  if (reportsBoard.container.style.display === 'block') {
    reportsBoard.hide();
  } else {
    reportsBoard.show();
  }
});


document.getElementById('reportsBoardCloseBtn').addEventListener('click', () => {
    reportsBoard.hide();
});

reportsBoard.container.addEventListener('click', (e) => {
    if (e.target === reportsBoard.container) {
        reportsBoard.hide();
    }
});

// Helper function to get report objects by ids
function getReportsByIds(reportIds) {
    return reportIds
        .map(id => dataManager.getReportById(id))
        .filter(report => report !== undefined && report !== null);
}

// Show only reports related to current network nodes/suspect
function showReports(reports) {
    reportsBoard.clear();
    reportsBoard.show();
    reports.forEach((report, i) => {
        reportsBoard.addReport(report, i);
    });
}
function prepareReportsBoard(reports) {
  reportsBoard.clear();       // clear old dialogs
  reports.forEach((report, i) => {
    reportsBoard.addReport(report, i);
  });
  reportsBoard.hide();        // keep hidden until user clicks button
}




// Create global instance
const uiController = new UIController();

