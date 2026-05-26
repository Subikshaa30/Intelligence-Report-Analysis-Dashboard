class GeoMapVisualizer {
    constructor() {
        this.map = null;
        this.markers = [];
    }

    init() {
        console.log('GeoMap: Creating real geopolitical map...');
        const container = document.getElementById('geomapContainer');
        
        if (!container) {
            console.error('GeoMap: Container not found!');
            return;
        }
        
        // Add Leaflet CSS if not already added
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(link);
        }
        
        // Add Leaflet JS if not already added
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            script.onload = () => this.createMap(container);
            document.head.appendChild(script);
        } else {
            this.createMap(container);
        }
    }

    createMap(container) {
            // Remove any previous Leaflet map instance
    if (this.map) {
        this.map.remove();
        this.map = null;
    }
    // Remove any potential leaflet id on the DOM node (very important for re-mounting same div)
    if (container._leaflet_id) {
        delete container._leaflet_id;
    }
        container.innerHTML = '';
        
        // Create Leaflet map
        this.map = L.map(container).setView([20, 0], 2);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Extract and plot places
        this.plotPlaces();
        
        console.log('✓ GeoMap: Real map created with ' + this.markers.length + ' locations');
    }

    plotPlaces() {
        const placeCounts = {};
        
        // Count place occurrences
        dataManager.inputData.forEach(report => {
            if (report.places) {
                report.places.forEach(place => {
                    const cityName = place.split('/')[0].trim();
                    placeCounts[cityName] = (placeCounts[cityName] || 0) + 1;
                });
            }
        });
        
        // Real coordinates for cities
        const coordinates = {
            'Paris': [48.8566, 2.3522],
            'Montreal': [45.5017, -73.5673],
            'Buffalo': [42.8864, -78.8784],
            'London': [51.5074, -0.1278],
            'Miami Beach': [25.7907, -80.1300],
            'Miami': [25.7617, -80.1918],
            'New York': [40.7128, -74.0060],
            'Newark': [40.7357, -74.1724],
            'Camden': [39.9526, -75.1216],
            'Nassau': [25.0834, -77.3484],
            'Freeport': [26.5500, -78.7744],
            'Chicago': [41.8781, -87.6298],
            'Houston': [29.7604, -95.3698],
            'Dallas': [32.7767, -96.7970],
            'Toronto': [43.6529, -79.3957],
            'Detroit': [42.3314, -83.0458],
            'San Francisco': [37.7749, -122.4194],
            'Los Angeles': [34.0522, -118.2437],
            'Inglewood': [33.9731, -118.2479],
            'Culver City': [34.0195, -118.3911],
            'Denver': [39.7392, -104.9903],
            'Washington': [38.9072, -77.0369],
            'Boston': [42.3601, -71.0589],
            'Phoenix': [33.4484, -112.0742],
            'Philadelphia': [39.9526, -75.1652],
            'Havana': [23.1136, -82.3666],
            'Cairo': [30.0444, 31.2357],
            'Moscow': [55.7558, 37.6173],
            'Peshawar': [34.0151, 71.5249],
            'Karachi': [24.8607, 67.0011],
            'Chitral': [35.8707, 71.7833],
            'Islamabad': [33.6844, 73.0479],
            'Casablanca': [33.5731, -7.5898],
            'Dubai': [25.2048, 55.2708],
            'Madrid': [40.4168, -3.7038],
            'Panama City': [8.9824, -79.5199],
            'Bogota': [4.7110, -74.0721],
            'Buenos Aires': [34.6037, -58.3816],
            'Santo Domingo': [18.4861, -69.9312],
            'Calamar': [10.2008, -75.5000],
            'Cartagena': [10.3932, -75.5158],
            'Mexico City': [19.4326, -99.1332],
            'Chetumal': [18.4972, -88.3093],
            'Ojinaga': [29.5585, -104.3944],
            'San Antonio': [29.4241, -98.4936],
            'Arlington': [32.7357, -97.2266],
            'Bellaire': [29.6234, -95.4458],
            'Kansas City': [39.0997, -94.5786],
            'Columbia': [38.9517, -92.3341],
            'Reston': [38.9496, -77.3598],
            'Laurel': [39.1022, -76.8437],
            'Baltimore': [39.2904, -76.6122],
            'Brooklyn': [40.6501, -73.9496],
            'Charlotte': [35.2271, -80.8431],
            'Windsor': [42.3158, -83.4747],
            'Marrakech': [31.6295, -8.0100],
            'Riyadh': [24.7136, 46.6753],
            'Jeddah': [21.5169, 39.1725],
            'Peshawar': [34.0151, 71.5249],
            'Parachinar': [33.8812, 71.1098],
            'Hyderabad': [25.2768, 68.2195],
            'Gwadar': [25.1857, 62.3237],
            'Orgun': [32.2667, 69.2167],
            'Kabul': [34.5553, 69.2075],
            'Kandahar': [31.6257, 65.7245],
            'Ashkhabad': [37.9601, 58.3261],
            'Tehran': [35.6892, 51.3890],
            'Antwerp': [51.2194, 4.4025],
            'Amsterdam': [52.3676, 4.9041],
            'Kuala Lumpur': [3.1390, 101.6869],
            'Caracas': [10.4806, -66.9036],
            'Santo Domingo': [18.4861, -69.9312],
            'Tampico': [22.2693, -97.8631],
            'Piedras Negras': [28.6989, -100.5063],
            'Ciudad Acuña': [29.9470, -101.0040],
            'Victoria': [27.7769, -97.1555],
            'Carrizo Springs': [28.5210, -99.8430],
            'Uvalde': [29.1546, -99.7843],
            'Eagle Pass': [28.4058, -100.4943],
            'Dulles': [38.8951, -77.0369],
            'Herndon': [38.9697, -77.3863],
            'Roanoke': [37.2707, -79.9406],
            'Heathrow': [51.4705, -0.4619],
            'Stockholm': [59.3293, 18.0686],
            'Lisbon': [38.7223, -9.1393],
            'Warsaw': [52.2297, 21.0122],
            'Prague': [50.0755, 14.4378],
            'Budapest': [47.4979, 19.0402],
            'Athens': [37.9838, 23.7275],
            'Istanbul': [41.0082, 28.9784],
            'Beirut': [33.8886, 35.4955],
            'Baghdad': [33.3128, 44.3615],
            'Amman': [31.9454, 35.9284],
            'Jerusalem': [31.7683, 35.2137],
            'Tel Aviv': [32.0853, 34.7818]
        };
        
        const maxCount = Math.max(...Object.values(placeCounts));
        
        Object.entries(placeCounts).forEach(([cityName, count]) => {
            const coords = coordinates[cityName];
            if (!coords) return; // Skip if no coordinates found
            
            const radius = 5 + (count / maxCount) * 35;
            const color = this.getColorFromIntensity(count / maxCount);
            
            // Create circle marker
            const marker = L.circleMarker([coords[0], coords[1]], {
                radius: radius,
                fillColor: color,
                color: '#333',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.7
            }).addTo(this.map);
            
            // Popup on click
            marker.bindPopup(`
                <strong>${cityName}</strong><br/>
                Reports: ${count}
            `);
            
            // Tooltip on hover
            marker.bindTooltip(`${cityName} (${count} reports)`, { permanent: false });
            
            this.markers.push(marker);
        });
    }

    getColorFromIntensity(intensity) {
        // Red scale: low=light red, high=dark red
        if (intensity < 0.2) return '#fee5e5';
        if (intensity < 0.4) return '#fcae91';
        if (intensity < 0.6) return '#fb6a4a';
        if (intensity < 0.8) return '#de2d26';
        return '#a50f15';
    }
}

const geomapVisualizer = new GeoMapVisualizer();
