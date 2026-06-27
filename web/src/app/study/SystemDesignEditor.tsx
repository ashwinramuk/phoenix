"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Building blocks an interviewer expects in a system-design diagram.
const PALETTE = [
  "Client",
  "API Gateway",
  "Service",
  "Database",
  "Cache",
  "Queue",
  "Load Balancer",
  "CDN",
  "Blob Store",
  "Vector DB",
];

let idCounter = 1;

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
}

// A drag-and-drop canvas: add nodes from the palette, drag them around,
// connect them by dragging between handles. The diagram is reported up as JSON.
export default function SystemDesignEditor({
  onChange,
}: {
  onChange: (d: DiagramData) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Report the current diagram to the parent on any change (drag, connect, add).
  useEffect(() => {
    onChange({ nodes, edges });
  }, [nodes, edges, onChange]);

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge(c, eds)),
    [setEdges],
  );

  const addNode = (label: string) => {
    const node: Node = {
      id: `n${idCounter++}`,
      data: { label },
      position: { x: 60 + Math.random() * 240, y: 40 + Math.random() * 220 },
      style: {
        background: "#1e293b",
        color: "#e2e8f0",
        border: "1px solid #3b82f6",
        borderRadius: 8,
        fontSize: 12,
        padding: 6,
      },
    };
    setNodes((nds) => [...nds, node]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {PALETTE.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => addNode(label)}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded"
          >
            + {label}
          </button>
        ))}
      </div>
      <div
        style={{ height: 440 }}
        className="rounded-lg border border-slate-700 overflow-hidden"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        Click palette to add components · drag to arrange · drag between nodes to connect.
      </p>
    </div>
  );
}
