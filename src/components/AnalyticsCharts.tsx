'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

type Article = {
    id: number;
    published_at: string;
    importance_score?: number;
    tags?: string[];
    source?: { topic_id: number };
};

type Topic = {
    id: number;
    keyword: string;
};

type Props = {
    articles: Article[];
    topics: Topic[];
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export const AnalyticsCharts = ({ articles, topics }: Props) => {
    // 過去7日間の記事数推移
    const timelineData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = articles.filter((a) =>
                format(parseISO(a.published_at), 'yyyy-MM-dd') === dateStr
            ).length;
            return {
                date: format(date, 'MM/dd', { locale: ja }),
                count,
            };
        });
        return last7Days;
    }, [articles]);

    // トピック別記事数
    const topicDistribution = useMemo(() => {
        const topicCounts = new Map<number, number>();
        articles.forEach((a) => {
            if (a.source?.topic_id) {
                topicCounts.set(a.source.topic_id, (topicCounts.get(a.source.topic_id) || 0) + 1);
            }
        });

        return Array.from(topicCounts.entries())
            .map(([topicId, count]) => ({
                name: topics.find((t) => t.id === topicId)?.keyword || `トピック${topicId}`,
                value: count,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [articles, topics]);

    // 重要度スコア分布
    const importanceDist = useMemo(() => {
        const ranges = [
            { name: '低 (0-39)', min: 0, max: 39, count: 0 },
            { name: '通常 (40-59)', min: 40, max: 59, count: 0 },
            { name: '注目 (60-79)', min: 60, max: 79, count: 0 },
            { name: '重要 (80-100)', min: 80, max: 100, count: 0 },
        ];

        articles.forEach((a) => {
            const score = a.importance_score || 50;
            const range = ranges.find((r) => score >= r.min && score <= r.max);
            if (range) range.count++;
        });

        return ranges;
    }, [articles]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Chart */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">記事数の推移（過去7日間）</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Importance Distribution */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">重要度スコアの分布</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={importanceDist}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Topic Distribution */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-white mb-4">トピック別記事数（上位5件）</h3>
                <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={topicDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {topicDistribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
