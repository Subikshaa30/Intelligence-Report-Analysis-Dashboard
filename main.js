/* ===== MAIN APPLICATION BOOTSTRAP ===== */
/* Initialize and coordinate all modules */

console.log('=== Intelligence Reports Dashboard ===');
console.log('Loading application...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('\n✓ DOM loaded');
    
    // Initialize all modules (in order)
    console.log('\n--- Initializing Modules ---');
    networkVisualizer.initVisualization();
    uiController.initSuspectList();
    // geomapVisualizer.init();
    
    console.log('\n✓ Application ready!');
    console.log('  - 27 suspects loaded');
    console.log('  - 111 reports available');
    console.log('  - Ready for interaction');
    console.log('\nSelect a suspect and click Play to start animation');
    setupGeomapToggle();

});

function setupGeomapToggle() {
    const btn = document.getElementById('geomapToggleBtn');
    const mainPage = document.getElementById('mainPage');
    const geomapPage = document.getElementById('geomapPage');
    
    let isOnGeomap = false;
    
    btn.addEventListener('click', () => {
        isOnGeomap = !isOnGeomap;
        
        if (isOnGeomap) {
            // Show GeoMap
            mainPage.classList.add('hidden');
            geomapPage.classList.add('active');
            btn.textContent = '📊 Back';
            
            // Initialize geomap if needed
            if (typeof geomapVisualizer !== 'undefined') {
                setTimeout(() => {
                    try {
                        geomapVisualizer.init();
                    } catch (e) {
                        console.error('Error initializing geomap:', e);
                    }
                }, 100);
            }
        } else {
            // Show Main Page
            mainPage.classList.remove('hidden');
            geomapPage.classList.remove('active');
            btn.textContent = '🗺️ GeoMap';
        }
    });
}

// Tooltip Modal Logic
document.addEventListener('DOMContentLoaded', () => {
  const infoBtn = document.getElementById('infoBtn');
  const modal = document.getElementById('howtoModal');
  const closeBtn = document.getElementById('howtoCloseBtn');

  if (infoBtn && modal && closeBtn) {
    infoBtn.onclick = function() {
      modal.style.display = 'block';
    };

    // Close on × button click
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      modal.style.display = 'none';
    };

    // Close when clicking outside dialog content
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };

    // Close on pressing Escape key
    window.addEventListener('keydown', function(e) {
      if (modal.style.display === 'block' && (e.key === 'Escape' || e.key === 'Esc')) {
        modal.style.display = 'none';
      }
    });
  }
});

document.getElementById('fullResetBtn').addEventListener('click', function() {
  location.reload();
});
