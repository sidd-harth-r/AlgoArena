import { useMemo, useState, useRef, useEffect } from "react";
import type { RecursionTreeNode } from "@/lib/api";

type PositionedNode = {
  id: number;
  x: number;
  y: number;
  node: RecursionTreeNode;
  children: PositionedNode[];
};

type Props = {
  data: RecursionTreeNode;
};

const NODE_WIDTH = 260;
const NODE_HEIGHT = 64;
const X_SPACING = 300;
const Y_SPACING = 130;

export default function SvgTreeViewer({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const layout = useMemo(() => {
    let nextId = 1;
    let leafCount = 0;

    function buildLayout(node: RecursionTreeNode, depth: number): PositionedNode {
      const id = nextId++;
      
      if (!node.children || node.children.length === 0) {
        const x = leafCount * X_SPACING;
        leafCount++;
        return { id, x, y: depth * Y_SPACING, node, children: [] };
      }

      const children = node.children.map(c => buildLayout(c, depth + 1));
      const minX = children[0].x;
      const maxX = children[children.length - 1].x;
      const x = (minX + maxX) / 2;

      return { id, x, y: depth * Y_SPACING, node, children };
    }

    const tree = buildLayout(data, 0);

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    function scan(n: PositionedNode) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
      n.children.forEach(scan);
    }
    scan(tree);

    return { 
      tree, 
      width: Math.max(800, maxX - minX + X_SPACING),
      height: Math.max(400, maxY + Y_SPACING * 1.5),
      offsetX: -minX + X_SPACING / 2
    };
  }, [data]);

  // Handle pan and drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      setScale(s => Math.min(Math.max(0.1, s + delta), 2));
    }
  };

  // Center tree on initial render
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      // Start slightly down and centered horizontally relative to the tree width
      setPan({ x: (containerWidth - layout.width) / 2, y: 40 });
    }
  }, [layout.width]);

  function renderEdges(node: PositionedNode): React.ReactNode[] {
    const edges: React.ReactNode[] = [];
    for (const child of node.children) {
      const startX = node.x + layout.offsetX;
      const startY = node.y + NODE_HEIGHT;
      const endX = child.x + layout.offsetX;
      const endY = child.y;

      const path = `M ${startX} ${startY} C ${startX} ${startY + 40}, ${endX} ${endY - 40}, ${endX} ${endY}`;
      
      edges.push(
        <path
          key={`edge-${node.id}-${child.id}`}
          d={path}
          fill="none"
          stroke="var(--border-strong, #ccc)"
          strokeWidth="2"
        />
      );
      edges.push(...renderEdges(child));
    }
    return edges;
  }

  function renderNodes(node: PositionedNode): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    
    const cx = node.x + layout.offsetX;
    const cy = node.y;

    const hasError = !!node.node.error;
    const hasReturn = node.node.return_value !== undefined;
    
    // Formatting node text
    const funcName = node.node.func === "<module>" ? "main()" : node.node.func;
    const argVals = Object.values(node.node.args).map(v => String(v).length > 40 ? String(v).slice(0,37) + '...' : String(v)).join(', ');
    const displayLabel = `${funcName}(${argVals})`;
    const retLabel = hasError ? "Error" : (hasReturn ? node.node.return_value : "...");

    const borderColor = hasError ? "var(--accent-rose)" : "var(--accent-flame)";
    const bgColor = hasError ? "rgba(155,32,32,0.1)" : "rgba(250,93,0,0.08)";
    const textColor = "var(--text-primary)";

    nodes.push(
      <g key={`node-${node.id}`} transform={`translate(${cx}, ${cy})`}>
        {/* Node Box */}
        <rect
          x={-NODE_WIDTH / 2}
          y={0}
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          rx={32}
          fill={bgColor}
          stroke={borderColor}
          strokeWidth="2"
          className="transition-all hover:brightness-110 pointer-events-auto cursor-pointer"
        />
        {/* Main Label */}
        <text
          x="0"
          y={26}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={textColor}
          className="mono pointer-events-none"
        >
          {displayLabel.length > 34 ? displayLabel.slice(0,31) + '...' : displayLabel}
        </text>
        {/* Return Label */}
        <text
          x="0"
          y={48}
          textAnchor="middle"
          fontSize="12"
          fill={hasError ? "var(--accent-rose)" : "var(--text-muted)"}
          className="mono pointer-events-none"
        >
          {retLabel && retLabel.length > 36 ? retLabel.slice(0, 33) + '...' : retLabel}
        </text>

        {/* Full tooltip on hover via title tag */}
        <title>{displayLabel}{'\n'}Return: {node.node.return_value || (hasError ? node.node.error : "none")}</title>
      </g>
    );

    for (const child of node.children) {
      nodes.push(...renderNodes(child));
    }
    return nodes;
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden" 
      style={{ background: 'var(--bg-tertiary)', borderRadius: 8, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Zoom hint */}
      <div className="absolute bottom-3 right-3 text-xs opacity-50 pointer-events-none" style={{ color: 'var(--text-primary)' }}>
        Drag to Pan • Ctrl+Scroll to Zoom
      </div>
      
      <svg
        width="100%"
        height="100%"
        className="pointer-events-none"
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          <g className="edges">
            {renderEdges(layout.tree)}
          </g>
          <g className="nodes pointer-events-auto">
            {renderNodes(layout.tree)}
          </g>
        </g>
      </svg>
    </div>
  );
}
