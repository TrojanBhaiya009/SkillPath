"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GraphNode, GraphEdge } from "@/lib/schema";

interface PathGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
}

const NODE_RADIUS = 28;
const COURSE_SIZE = 36;
const ROLE_WIDTH = 180;
const ROLE_HEIGHT = 56;
const COL_GAP = 120;
const ROW_GAP = 90;
const LEFT_MARGIN = 60;
const TOP_MARGIN = 60;

function getNodePosition(
  node: GraphNode,
  nodes: GraphNode[],
  edges: GraphEdge[],
  roleName: string
): { x: number; y: number; col: number } {
  const skillNodes = nodes.filter((n) => n.label === "Skill");
  const knownSkills = skillNodes.filter((n) => n.state === "known");
  const learnSkills = skillNodes.filter((n) => n.state === "learn");

  const depthMap = new Map<string, number>();
  learnSkills.forEach((n) => {
    const incoming = edges.filter(
      (e) => e.to === n.id && e.type === "PREREQUISITE_OF"
    );
    let maxDepth = 0;
    incoming.forEach((e) => {
      const fromDepth = depthMap.get(e.from) ?? 0;
      maxDepth = Math.max(maxDepth, fromDepth + 1);
    });
    depthMap.set(n.id, maxDepth);
  });

  const maxDepth = Math.max(0, ...Array.from(depthMap.values()));

  if (node.label === "Role") {
    return { x: LEFT_MARGIN + (maxDepth + 1) * COL_GAP + knownSkills.length * COL_GAP, y: TOP_MARGIN, col: maxDepth + 1 + knownSkills.length };
  }

  if (node.state === "known") {
    const idx = knownSkills.findIndex((n) => n.id === node.id);
    return { x: LEFT_MARGIN + idx * COL_GAP, y: TOP_MARGIN, col: idx };
  }

  if (node.state === "learn") {
    const depth = depthMap.get(node.id) ?? 0;
    const sameDepth = learnSkills.filter((n) => depthMap.get(n.id) === depth);
    const idx = sameDepth.findIndex((n) => n.id === node.id);
    return {
      x: LEFT_MARGIN + knownSkills.length * COL_GAP + depth * COL_GAP,
      y: TOP_MARGIN + idx * ROW_GAP,
      col: knownSkills.length + depth,
    };
  }

  if (node.label === "Course") {
    const skillId = edges.find((e) => e.from === node.id && e.type === "TEACHES")?.to;
    const skillNode = nodes.find((n) => n.id === skillId);
    if (skillNode) {
      const skillPos = getNodePosition(skillNode, nodes, edges, roleName);
      return { x: skillPos.x, y: skillPos.y + ROW_GAP, col: skillPos.col };
    }
  }

  return { x: 0, y: 0, col: 0 };
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  size = 10
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(
    x - size * Math.cos(angle - Math.PI / 6),
    y - size * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x - size * Math.cos(angle + Math.PI / 6),
    y - size * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashLen = 8
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dashes = Math.floor(dist / (dashLen * 2));
  const stepX = dx / (dashes * 2);
  const stepY = dy / (dashes * 2);

  ctx.beginPath();
  for (let i = 0; i < dashes; i++) {
    const sx = x1 + i * 2 * stepX;
    const sy = y1 + i * 2 * stepY;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + stepX, sy + stepY);
  }
  ctx.stroke();
}

export function PathGraph({ nodes, edges, onNodeClick }: PathGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const nodePositionsRef = useRef<Map<string, { x: number; y: number; col: number }>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      setDimensions({ width: rect.width, height: rect.height });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setTimeout(() => setAnimationProgress(1), 0);
      return;
    }

    let start: number | null = null;
    const duration = 600;
    let frameId: number;

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setAnimationProgress(progress);
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [edges.length]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    ctx.scale(dpr, dpr);

    const roleName = nodes.find((n) => n.label === "Role")?.name || "";

    const nodePositions = new Map<string, { x: number; y: number; col: number }>();
    nodes.forEach((node) => {
      nodePositions.set(node.id, getNodePosition(node, nodes, edges, roleName));
    });
    nodePositionsRef.current = nodePositions;

    // Draw edges first (behind nodes)
    // 1. REQUIRES edges (Role -> Skill) - 1px line
    edges
      .filter((e) => e.type === "REQUIRES")
      .forEach((edge) => {
        const from = nodePositions.get(edge.from);
        const to = nodePositions.get(edge.to);
        if (!from || !to) return;

        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);

        const fx = from.x;
        let fy = from.y;
        const tx = to.x;
        let ty = to.y;

        if (fromNode?.label === "Role") {
          fy += ROLE_HEIGHT / 2;
        }
        if (toNode?.label === "Skill") {
          ty -= NODE_RADIUS;
        }

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = "#263040";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

    // 2. TEACHES edges (Course -> Skill) - 1px line dashed
    edges
      .filter((e) => e.type === "TEACHES")
      .forEach((edge) => {
        const from = nodePositions.get(edge.from);
        const to = nodePositions.get(edge.to);
        if (!from || !to) return;

        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);

        const fx = from.x;
        let fy = from.y;
        const tx = to.x;
        let ty = to.y;

        if (fromNode?.label === "Course") {
          fy += COURSE_SIZE / 2;
        }
        if (toNode?.label === "Skill") {
          ty -= NODE_RADIUS;
        }

        drawDashedLine(ctx, fx, fy, tx, ty);
        ctx.strokeStyle = "#263040";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

    // 3. PREREQUISITE_OF edges (Skill -> Skill) - 2px signal with arrowhead, animated
    const prerequisiteEdges = edges.filter((e) => e.type === "PREREQUISITE_OF");
    const maxEdgesToDraw = Math.floor(prerequisiteEdges.length * animationProgress);

    prerequisiteEdges.slice(0, maxEdgesToDraw).forEach((edge) => {
      const from = nodePositions.get(edge.from);
      const to = nodePositions.get(edge.to);
      if (!from || !to) return;

      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);

      const fx = from.x;
      const fy = from.y;
      const tx = to.x;
      const ty = to.y;

      let adjustedFx = fx;
      let adjustedTx = tx;

      if (fromNode?.label === "Skill" && toNode?.label === "Skill") {
        adjustedFx += NODE_RADIUS;
        adjustedTx -= NODE_RADIUS;
      }

      const angle = Math.atan2(ty - fy, adjustedTx - adjustedFx);

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(adjustedTx, ty);
      ctx.strokeStyle = "#3DDC97";
      ctx.lineWidth = 2;
      ctx.stroke();

      drawArrowhead(ctx, adjustedTx, ty, angle, "#3DDC97", 10);

      if (edge.source === "seeded") {
        const mx = (fx + adjustedTx) / 2;
        const my = (fy + ty) / 2;
        ctx.font = "10px var(--font-body)";
        ctx.fillStyle = "#93A1B3";
        ctx.textAlign = "center";
        ctx.fillText("seeded", mx, my - 4);
      }
    });

    // Draw nodes on top of edges
    nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const { x, y } = pos;

      if (node.label === "Role") {
        // Rounded rectangle, panel fill, 2px text stroke, text label
        ctx.beginPath();
        ctx.roundRect(x - ROLE_WIDTH / 2, y - ROLE_HEIGHT / 2, ROLE_WIDTH, ROLE_HEIGHT, 12);
        ctx.fillStyle = "#141A22";
        ctx.fill();
        ctx.strokeStyle = "#E8EEF5";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "600 14px var(--font-display)";
        ctx.fillStyle = "#E8EEF5";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.name, x, y);
      } else if (node.label === "Skill") {
        const isKnown = node.state === "known";
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);

        if (isKnown) {
          // Known: Circle, panel fill, 1px line stroke, muted label
          ctx.fillStyle = "#141A22";
          ctx.fill();
          ctx.strokeStyle = "#263040";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = "600 12px var(--font-body)";
          ctx.fillStyle = "#93A1B3";
        } else {
          // Learn: Circle, signal fill, no stroke, on-signal label
          ctx.fillStyle = "#3DDC97";
          ctx.fill();
          ctx.font = "600 13px var(--font-body)";
          ctx.fillStyle = "#04140D";
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const maxWidth = NODE_RADIUS * 1.8;
        const words = node.name.split(" ");
        let line = "";
        let lineCount = 0;
        const lineHeight = 16;
        const startY = y - ((words.length - 1) * lineHeight) / 2;

        words.forEach((word: string) => {
          const testLine = line + (line ? " " : "") + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line, x, startY + lineCount * lineHeight);
            line = word;
            lineCount++;
          } else {
            line = testLine;
          }
        });
        ctx.fillText(line, x, startY + lineCount * lineHeight);
      } else if (node.label === "Course") {
        // Diamond, panel fill, 1px line stroke, muted label
        const half = COURSE_SIZE / 2;
        ctx.beginPath();
        ctx.moveTo(x, y - half);
        ctx.lineTo(x + half, y);
        ctx.lineTo(x, y + half);
        ctx.lineTo(x - half, y);
        ctx.closePath();
        ctx.fillStyle = "#141A22";
        ctx.fill();
        ctx.strokeStyle = "#263040";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "11px var(--font-body)";
        ctx.fillStyle = "#93A1B3";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const words = node.name.split(" ");
        let line = "";
        let lineCount = 0;
        const lineHeight = 13;
        const startY = y - ((words.length - 1) * lineHeight) / 2;

        words.forEach((word: string) => {
          const testLine = line + (line ? " " : "") + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > COURSE_SIZE * 1.5 && line) {
            ctx.fillText(line, x, startY + lineCount * lineHeight);
            line = word;
            lineCount++;
          } else {
            line = testLine;
          }
        });
        ctx.fillText(line, x, startY + lineCount * lineHeight);
      }
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [nodes, edges, dimensions, animationProgress]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const positions = nodePositionsRef.current;
    for (const [id, pos] of positions.entries()) {
      const node = nodes.find((n) => n.id === id);
      if (!node) continue;

      let hit = false;
      if (node.label === "Role") {
        hit = x >= pos.x - ROLE_WIDTH / 2 && x <= pos.x + ROLE_WIDTH / 2 && y >= pos.y - ROLE_HEIGHT / 2 && y <= pos.y + ROLE_HEIGHT / 2;
      } else if (node.label === "Skill") {
        const dx = x - pos.x;
        const dy = y - pos.y;
        hit = dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS;
      } else if (node.label === "Course") {
        const half = COURSE_SIZE / 2;
        hit = x >= pos.x - half && x <= pos.x + half && y >= pos.y - half && y <= pos.y + half;
      }
      if (hit) {
        onNodeClick(node);
        break;
      }
    }
  };

  return (
    <div className="relative bg-ink rounded-[12px] border border-line overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        aria-hidden="true"
        onClick={handleClick}
      />
      <div className="sr-only" aria-live="polite">
        {nodes.filter((n) => n.label === "Skill" && n.state === "learn").length} skills to learn
      </div>
    </div>
  );
}