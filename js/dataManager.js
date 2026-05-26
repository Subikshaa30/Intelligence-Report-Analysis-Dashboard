/* ===== DATA MANAGER ===== */
/* Handles data access, validation, and lookups */

class DataManager {
    constructor() {
        this.inputData = INTELLIGENCE_DATA.inputData;
        this.outputData = INTELLIGENCE_DATA.outputData;
        this.inputDataMap = new Map();
        this.init();
    }

    init() {
        // Build O(1) lookup map
        this.inputData.forEach(report => {
            this.inputDataMap.set(report.ID, report);
        });
        console.log('✓ DataManager initialized');
    }

    /**
     * Get report by ID
     */
    getReportById(id) {
        return this.inputDataMap.get(id) || null;
    }

    /**
     * Get suspect data by name
     */
    getSuspectByName(name) {
        return this.outputData[name] || null;
    }

    /**
     * Get all suspects sorted by score descending
     */
    getSuspectsSortedByScore() {
        return Object.entries(this.outputData)
            .map(([name, data]) => ({
                name,
                score: data.score,
                files: data.files || [],
                aliases: data.aliases || []
            }))
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Get co-suspects from a report (exclude main suspect and aliases)
     */
    getCoSuspects(fileId, mainSuspect, aliases) {
        const report = this.getReportById(fileId);
        if (!report || !report.PERSONS) return [];

        const excludeNames = new Set([mainSuspect, ...aliases]);
        return report.PERSONS.filter(p => p && !excludeNames.has(p));
    }

    /**
     * Get places from a report
     */
    getPlaces(fileId) {
        const report = this.getReportById(fileId);
        if (!report || !report.places) return [];
        return report.places.filter(p => p && p.trim().length > 0);
    }

    /**
     * Get organizations from a report
     */
    getOrganizations(fileId) {
        const report = this.getReportById(fileId);
        if (!report || !report.ORGANIZATIONS) return [];
        return report.ORGANIZATIONS.filter(o => o && o.trim().length > 0);
    }

    /**
     * Accumulate data across multiple files (removes duplicates)
     */
    accumulateData(fileIds, mainSuspect, aliases) {
        const people = [];
        const places = [];
        const orgs = [];
        const seenPeople = new Set();
        const seenPlaces = new Set();
        const seenOrgs = new Set();

        fileIds.forEach(fileId => {
            // People
            this.getCoSuspects(fileId, mainSuspect, aliases).forEach(p => {
                if (!seenPeople.has(p)) {
                    people.push(p);
                    seenPeople.add(p);
                }
            });

            // Places
            this.getPlaces(fileId).forEach(place => {
                if (!seenPlaces.has(place)) {
                    places.push(place);
                    seenPlaces.add(place);
                }
            });

            // Organizations
            this.getOrganizations(fileId).forEach(org => {
                if (!seenOrgs.has(org)) {
                    orgs.push(org);
                    seenOrgs.add(org);
                }
            });
        });

        return { people, places, orgs };
    }

    /**
     * Get report info for tooltip
     */
    getReportInfo(fileId) {
        const report = this.getReportById(fileId);
        if (!report) return null;

        return {
            date: report.REPORTDATE || 'Unknown',
            source: report.REPORTSOURCE || 'Unknown'
        };
    }
}

// Create global instance
const dataManager = new DataManager();
