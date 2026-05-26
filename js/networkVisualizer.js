/* ===== NETWORK VISUALIZER (WITH ARROWS) ===== */
/* Shows direction of relationships with arrows */

class NetworkVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.g = null;
        this.width = 0;
        this.height = 0;
        this.nodes = [];
        this.links = [];
        this.nodeMap = new Map();
        this.animationInProgress = false;
    }

    initVisualization() {
        if (!this.container) {
            console.error('Network container not found!');
            return;
        }

        this.container.innerHTML = '';
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        console.log(`Network size: ${this.width}x${this.height}`);

        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('background', '#fafafa');

        // Define arrow marker for lines
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 28)
            .attr('refY', 5)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 5, 0 10')
            .attr('fill', '#2c5aa0');

        this.g = this.svg.append('g');
    }

    renderGraph(nodes, links) {
        this.nodes = nodes;
        this.links = links;
        this.nodeMap.clear();

        nodes.forEach(node => this.nodeMap.set(node.id, node));

        // Simple grid layout
        this.layoutNodesInGrid(nodes);

        // Draw links FIRST (so they appear behind nodes)
        const linkSelection = this.g.selectAll('.link')
            .data(links, (d, i) => i);

        linkSelection.exit().remove();

        linkSelection.enter()
            .append('line')
            .attr('class', 'link')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('x1', d => {
                const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
                return source ? source.x : 0;
            })
            .attr('y1', d => {
                const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
                return source ? source.y : 0;
            })
            .attr('x2', d => {
                const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
                return target ? target.x : 0;
            })
            .attr('y2', d => {
                const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
                return target ? target.y : 0;
            })
            .merge(linkSelection);

        // Draw nodes
        const nodeSelection = this.g.selectAll('.node')
            .data(nodes, d => d.id);

        nodeSelection.exit().remove();

        nodeSelection.enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 20)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('opacity', 0)
            .merge(nodeSelection)
            .on('mouseover', (event, d) => this.onNodeHover(event, d))
            .on('mouseout', () => this.hideTooltip());



        // Draw labels
        const labelSelection = this.g.selectAll('.node-label')
            .data(nodes, d => `label-${d.id}`);

        labelSelection.exit().remove();

        labelSelection.enter()
            .append('text')
            .attr('class', 'node-label')
            .text(d => d.id)
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('opacity', 0)
            .merge(labelSelection);

        // Center everything
        this.centerView();
    }

    /**
     * Simple grid layout - nodes arranged horizontally
     */
    layoutNodesInGrid(nodes) {
        const padding = 60;
        const spaceBetweenNodes = 120;

        nodes.forEach((node, i) => {
            node.x = padding + (i * spaceBetweenNodes);
            node.y = this.height / 2;
        });
    }

    /**
     * Center all nodes in view
     */
    centerView() {
        if (this.nodes.length === 0) return;

        const xs = this.nodes.map(n => n.x);
        const ys = this.nodes.map(n => n.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = maxX - minX;
        const height = maxY - minY;
        const midX = minX + width / 2;
        const midY = minY + height / 2;

        const padding = 80;
        const scale = Math.min(
            (this.width - padding) / width,
            (this.height - padding) / height,
            1.5
        );

        const translate = [
            this.width / 2 - scale * midX,
            this.height / 2 - scale * midY
        ];

        this.g.transition()
            .duration(800)
            .attr('transform', `translate(${translate[0]},${translate[1]}) scale(${scale})`);
    }

    /**
     * Node hover - show tooltip
     */
    onNodeHover(event, d) {
        if (this.animationInProgress) return;
        const report = dataManager.getReportById(d.id);
        if (report) {
            const tooltip = document.getElementById('tooltip');
            tooltip.innerHTML = `
                <div style="font-weight: bold;">${d.id}</div>
                <div><strong>Date:</strong> ${report.REPORTDATE}</div>
                <div><strong>Source:</strong> ${report.REPORTSOURCE}</div>
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.pageX - 60) + 'px';
            tooltip.style.top = (event.pageY - 50) + 'px';
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }

    reset() {
        this.nodes = [];
        this.links = [];
        this.nodeMap.clear();
        this.animationInProgress = false;
        this.hideTooltip();
        this.g.selectAll('*').remove();
    }

    clear() {
        this.reset();
        this.container.innerHTML = '';
    }
}

const networkVisualizer = new NetworkVisualizer('networkContainer');
