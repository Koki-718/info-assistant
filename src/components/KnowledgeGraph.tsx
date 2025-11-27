'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type Node = {
    id: string;
    group: number; // 1: Topic, 2: Article
    val: number; // Size
    name: string;
};

type Link = {
    source: string;
    target: string;
};

type GraphData = {
    nodes: Node[];
    links: Link[];
};

export function KnowledgeGraph({ topics, articles }: { topics: any[], articles: any[] }) {
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(600);

    useEffect(() => {
        if (containerRef.current) {
            setWidth(containerRef.current.clientWidth);
        }

        const nodes: Node[] = [];
        const links: Link[] = [];

        // Add Topics
        topics.forEach(t => {
            nodes.push({ id: t.id, group: 1, val: 20, name: t.keyword });
        });

        // Add Articles and Links
        articles.forEach(a => {
            nodes.push({ id: a.id, group: 2, val: 10, name: a.title });
            if (a.source && a.source.topic_id) {
                links.push({ source: a.source.topic_id, target: a.id });
            }
        });

        setData({ nodes, links });
    }, [topics, articles]);

    return (
        <div ref={containerRef} className="w-full h-[400px] bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg relative">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-medium text-sm bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm">Knowledge Graph</h3>
            </div>
            <ForceGraph2D
                width={width}
                height={400}
                graphData={data}
                nodeLabel="name"
                nodeColor={node => node.group === 1 ? '#6366f1' : '#94a3b8'} // Indigo for topics, Slate for articles
                backgroundColor="#1e293b"
                linkColor={() => '#334155'}
                nodeRelSize={6}
            />
        </div>
    );
}
