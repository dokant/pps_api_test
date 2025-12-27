import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardData {
  summary: {
    total_bids: number;
    total_companies: number;
    total_institutions: number;
    total_amount: number;
    avg_rate: number;
    avg_participants: number;
  };
  recent_30days: {
    bids: number;
    amount: number;
    avg_rate: number;
    trend: number;
  };
  monthly_trend: Array<{
    month: string;
    count: number;
    amount: number;
    avg_rate: number;
  }>;
  by_type: Array<{
    type: string;
    count: number;
    amount: number;
    avg_rate: number;
  }>;
  top_institutions: Array<{
    name: string;
    count: number;
    amount: number;
  }>;
  top_companies: Array<{
    name: string;
    count: number;
    amount: number;
    avg_rate: number;
  }>;
  recent_bids: Array<{
    bid_name: string;
    institution: string;
    winner: string;
    amount: number;
    rate: number;
    date: string;
  }>;
  rate_distribution: Array<{
    range: string;
    count: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('API 호출 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);

  const formatAmount = (num: number) => {
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(1)}조`;
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000) return `${(num / 10000).toFixed(0)}만`;
    return formatNumber(num);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'goods': return '물품';
      case 'service': return '용역';
      case 'construction': return '공사';
      default: return type || '기타';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'goods': return '#a855f7';
      case 'service': return '#60a5fa';
      case 'construction': return '#eab308';
      default: return '#9da6b9';
    }
  };

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">autorenew</span>
          <p className="text-[#9da6b9] mt-4">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <p className="text-red-400 mt-4">{error}</p>
          <button onClick={fetchDashboard} className="mt-4 bg-primary px-4 py-2 rounded-lg text-white">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      {/* Header */}
      <header className="px-6 md:px-8 py-6 border-b border-white/5 backdrop-blur-sm z-30 sticky top-0 bg-background-dark/80">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end max-w-7xl mx-auto w-full gap-4">
          <div>
            <h2 className="text-white text-3xl font-black tracking-tight">대시보드 개요</h2>
            <p className="text-[#9da6b9] text-base">실시간 낙찰 데이터 분석 현황입니다.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-surface-dark px-3 py-2 rounded-xl text-[#9da6b9] text-xs font-bold flex items-center gap-2 border border-white/5">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>{today}</span>
            </div>
            <button 
              onClick={fetchDashboard}
              className="bg-primary px-4 py-2 rounded-xl text-white font-bold text-sm shadow-xl shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all flex-1 md:flex-none justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              새로고침
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full pb-20">
        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-[64px] text-white">description</span>
            </div>
            <p className="text-[#9da6b9] text-xs font-black uppercase tracking-widest">총 낙찰 건수</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-white text-3xl font-bold tracking-tight">{formatNumber(data.summary.total_bids)}건</p>
            </div>
          </div>

          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-[64px] text-white">verified</span>
            </div>
            <p className="text-[#9da6b9] text-xs font-black uppercase tracking-widest">평균 낙찰률</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-white text-3xl font-bold tracking-tight">{data.summary.avg_rate}%</p>
            </div>
          </div>

          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-[64px] text-white">payments</span>
            </div>
            <p className="text-[#9da6b9] text-xs font-black uppercase tracking-widest">총 낙찰금액</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-white text-3xl font-bold tracking-tight">{formatAmount(data.summary.total_amount)}</p>
            </div>
          </div>

          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-[64px] text-white">trending_up</span>
            </div>
            <p className="text-[#9da6b9] text-xs font-black uppercase tracking-widest">최근 30일</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-white text-3xl font-bold tracking-tight">{formatNumber(data.recent_30days.bids)}건</p>
              <span className={`${data.recent_30days.trend >= 0 ? 'text-[#0bda5e]' : 'text-[#fa6238]'} text-sm font-bold flex items-center mb-1`}>
                <span className="material-symbols-outlined text-[16px]">
                  {data.recent_30days.trend >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {Math.abs(data.recent_30days.trend)}%
              </span>
            </div>
          </div>
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">show_chart</span>
              월별 낙찰 추이
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282e39" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 11 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2330', border: '1px solid #282e39', borderRadius: '12px' }}
                    formatter={(value: number, name: string) => [
                      name === 'count' ? `${value}건` : `${value}%`,
                      name === 'count' ? '낙찰건수' : '평균낙찰률'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="count" fill="#135bec44" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avg_rate" stroke="#0bda5e" strokeWidth={2} dot={{ fill: '#0bda5e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rate Distribution */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">pie_chart</span>
              낙찰률 분포
            </h3>
            <div className="space-y-3">
              {data.rate_distribution.map((item, idx) => {
                const maxCount = Math.max(...data.rate_distribution.map(d => d.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#9da6b9]">{item.range}</span>
                      <span className="text-white font-bold">{formatNumber(item.count)}건</span>
                    </div>
                    <div className="h-2 bg-background-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Type & Top Lists */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* By Type */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">category</span>
              입찰유형별 현황
            </h3>
            <div className="space-y-4">
              {data.by_type.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background-dark/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span 
                      className="px-2 py-1 rounded text-[10px] font-black"
                      style={{ backgroundColor: `${getTypeColor(item.type)}20`, color: getTypeColor(item.type) }}
                    >
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatNumber(item.count)}건</p>
                    <p className="text-[#9da6b9] text-xs">{item.avg_rate}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Institutions */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">apartment</span>
              상위 발주기관
            </h3>
            <div className="space-y-3">
              {data.top_institutions.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-background-dark/50 rounded-xl">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                    ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                      idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                      idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-[#9da6b9]'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{item.name}</p>
                    <p className="text-[#9da6b9] text-xs">{formatNumber(item.count)}건</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">corporate_fare</span>
              상위 낙찰업체
            </h3>
            <div className="space-y-3">
              {data.top_companies.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-background-dark/50 rounded-xl">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                    ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                      idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                      idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-[#9da6b9]'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{item.name}</p>
                    <p className="text-[#9da6b9] text-xs">{formatNumber(item.count)}건 • {item.avg_rate}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Bids */}
        <section className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
          <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            최근 낙찰 내역
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-[#9da6b9] uppercase font-black border-b border-white/5">
                <tr>
                  <th className="py-3 px-4 text-left">공고명</th>
                  <th className="py-3 px-4 text-left">발주기관</th>
                  <th className="py-3 px-4 text-left">낙찰업체</th>
                  <th className="py-3 px-4 text-right">낙찰금액</th>
                  <th className="py-3 px-4 text-center">낙찰률</th>
                  <th className="py-3 px-4 text-center">일자</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recent_bids.map((bid, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium truncate max-w-[200px]" title={bid.bid_name}>{bid.bid_name}</td>
                    <td className="py-3 px-4 text-[#9da6b9] truncate max-w-[120px]">{bid.institution}</td>
                    <td className="py-3 px-4 text-[#9da6b9] truncate max-w-[120px]">{bid.winner}</td>
                    <td className="py-3 px-4 text-right text-white font-mono">{formatAmount(bid.amount)}</td>
                    <td className="py-3 px-4 text-center text-primary font-bold">{bid.rate?.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-center text-[#9da6b9]">{bid.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
