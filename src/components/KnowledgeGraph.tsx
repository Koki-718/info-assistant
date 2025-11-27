'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type Node = {
    id: string;
    group: string; // 'article' | 'topic' | 'person' | 'organization' | 'technology' | 'event' | 'location'
    val: number; // Size
    name: string;
    color?: string;
    importance?: number; // For articles
};

type Link = {
    source: string;
    target: string;
    value?: number;
};

type GraphData = {
    nodes: Node[];
    links: Link[];
};

// Obsidian-like colors
const COLORS = {
    background: '#0b0e14', // Deep dark background
    text: '#dadada',
    node: {
        article: '#94a3b8', // Default article
        article_important: '#ef4444', // High importance
        topic: '#6366f1', // Indigo
        person: '#f59e0b', // Amber
        organization: '#10b981', // Emerald
        technology: '#06b6d4', // Cyan
        event: '#a855f7', // Purple
        location: '#ec4899', // Pink
        other: '#64748b' // Slate
    },
    link: 'rgba(148, 163, 184, 0.2)' // Subtle link color
};

export function KnowledgeGraph({ topics, articles }: { topics: any[], articles: any[] }) {
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(null);

    // Controls state
    const [showControls, setShowControls] = useState(true);
    const [filters, setFilters] = useState({
        articles: true,
        topics: true,
        entities: true
    });
    const [physics, setPhysics] = useState({
        charge: -30,
        linkDistance: 50
    });

    useEffect(() => {
        if (containerRef.current) {
            setWidth(containerRef.current.clientWidth);
            setHeight(containerRef.current.clientHeight);
        }

        // Resize observer
        const ro = new ResizeObserver(entries => {
            for (let entry of entries) {
                setWidth(entry.contentRect.width);
                setHeight(entry.contentRect.height);
            }
        });

        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Generate Graph Data
    const data = useMemo(() => {
        const nodes: Node[] = [];
        const links: Link[] = [];
        const nodeIds = new Set<string>();

        // Helper to add node if unique
        const addNode = (node: Node) => {
            if (!nodeIds.has(node.id)) {
                nodes.push(node);
                nodeIds.add(node.id);
            }
        };

        // 1. Add Topics
        if (filters.topics) {
            topics.forEach(t => {
                addNode({
                    id: `topic-${t.id}`,
                    group: 'topic',
                    val: 8,
                    name: t.keyword || 'No Keyword',
                    color: COLORS.node.topic
                });
            });
        }

        // 2. Add Articles and Entities
        articles.forEach(a => {
            // Add Article Node
            if (filters.articles) {
                const isImportant = (a.importance_score || 0) >= 80;
                addNode({
                    id: `article-${a.id}`,
                    group: 'article',
                    val: isImportant ? 6 : 4,
                    name: a.title || 'No Title',
                    color: isImportant ? COLORS.node.article_important : COLORS.node.article,
                    importance: a.importance_score
                });

                // Link Article to Topic
                if (filters.topics && a.source && a.source.topic_id) {
                    links.push({ source: `topic-${a.source.topic_id}`, target: `article-${a.id}` });
                }

                // Add Entities and Links
                if (filters.entities && a.entities && Array.isArray(a.entities)) {
                    a.entities.forEach((e: any) => {
                        if (!e.name) return; // Skip invalid entities

                        const entityId = `entity-${e.name}-${e.type}`;

                        // Determine color based on type
                        let color = COLORS.node.other;
                        if (e.type === 'person') color = COLORS.node.person;
                        if (e.type === 'organization') color = COLORS.node.organization;
                        if (e.type === 'technology') color = COLORS.node.technology;
                        if (e.type === 'event') color = COLORS.node.event;
                        if (e.type === 'location') color = COLORS.node.location;

                        addNode({
                            id: entityId,
                            group: e.type,
                            val: 3, // Smaller than articles
                            name: e.name,
                            color: color
                        });

                        // Link Article to Entity
                        links.push({ source: `article-${a.id}`, target: entityId });
                    });
                }
            }
        });

        return { nodes, links };
    }, [topics, articles, filters]);

    return (
        <div ref={containerRef} className="w-full h-[600px] bg-[#0b0e14] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative group">

            {/* Header / Title */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-slate-200 font-medium text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    Knowledge Graph
                </h3>
            </div>

            {/* Controls Toggle */}
            <button
                onClick={() => setShowControls(!showControls)}
                className="absolute top-4 right-4 z-20 p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg backdrop-blur-md transition border border-white/10"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>

            {/* Control Panel */}
            {showControls && (
                <div className="absolute top-16 right-4 z-20 w-64 bg-[#1a1d24]/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl text-xs text-slate-300 animate-fadeIn">
                    <div className="space-y-4">
                        {/* Filters */}
                        <div>
                            <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                                フィルタ
                            </h4>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between cursor-pointer hover:text-white transition">
                                    <span>トピック</span>
                                    <input type="checkbox" checked={filters.topics} onChange={e => setFilters({ ...filters, topics: e.target.checked })} className="accent-indigo-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer hover:text-white transition">
                                    <span>記事</span>
                                    <input type="checkbox" checked={filters.articles} onChange={e => setFilters({ ...filters, articles: e.target.checked })} className="accent-slate-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer hover:text-white transition">
                                    <span>エンティティ</span>
                                    <input type="checkbox" checked={filters.entities} onChange={e => setFilters({ ...filters, entities: e.target.checked })} className="accent-emerald-500" />
                                </label>
                            </div>
                        </div>

                        <div className="h-px bg-slate-700/50 my-2"></div>

                        {/* Physics */}
                        <div>
                            <h4 className="font-semibold text-slate-100 mb-2 flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                力の強さ
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span>反発力</span>
                                        <span>{physics.charge}</span>
                                    </div>
                                    <input
                                        type="range" min="-100" max="-5"
                                        value={physics.charge}
                                        onChange={e => setPhysics({ ...physics, charge: Number(e.target.value) })}
                                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span>リンク距離</span>
                                        <span>{physics.linkDistance}</span>
                                    </div>
                                    <input
                                        type="range" min="10" max="200"
                                        value={physics.linkDistance}
                                        onChange={e => setPhysics({ ...physics, linkDistance: Number(e.target.value) })}
                                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-700/50 my-2"></div>

                        {/* Legend */}
                        <div>
                            <h4 className="font-semibold text-slate-100 mb-2">凡例</h4>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>トピック</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>重要記事</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>人物</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>組織</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span>技術</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>イベント</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ForceGraph2D
                ref={fgRef}
                width={width}
                height={height}
                graphData={data}
                nodeLabel="name"
                nodeColor={(node: any) => node.color}
                nodeRelSize={6}
                backgroundColor={COLORS.background}
                linkColor={() => COLORS.link}
                linkWidth={1}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}

                // Physics settings for stability
                d3VelocityDecay={0.6} // Increase friction to stop movement faster
                d3AlphaDecay={0.05} // Faster cooling
                cooldownTicks={100} // Stop simulation after 100 ticks
                onEngineStop={() => {
                    // Ensure it stops completely
                    fgRef.current?.pauseAnimation();
                }}

                // Custom Node Rendering with Text
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name || ''; // Guard against null
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                    // Draw Node Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color || COLORS.node.other;
                    ctx.fill();

                    // Draw Text Label (truncated if too long)
                    if (label && (globalScale > 1.5 || node.group === 'topic' || (node.importance && node.importance >= 80))) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        // Truncate text if too long
                        let displayLabel = label;
                        if (displayLabel.length > 10) {
                            displayLabel = displayLabel.substring(0, 9) + '...';
                        }

                        ctx.fillText(displayLabel, node.x, node.y + node.val + fontSize);
                    }
                }}

                onNodeClick={node => {
                    // Focus on node
                    fgRef.current?.centerAt(node.x, node.y, 1000);
                    fgRef.current?.zoom(3, 2000);
                }}
            />
        </div>
    );
}
