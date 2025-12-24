
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const FailureAnalysis: React.FC = () => {
  const pieData = [
    { name: '가격 경쟁력 부족', value: 45, color: '#135bec' },
    { name: '기술 점수 미달', value: 30, color: '#8b5cf6' },
    { name: '서류 미비', value: 15, color: '#f97316' },
    { name: '기타 사유', value: 10, color: '#64748b' },
  ];

  const gapData = [
    { name: 'A사 (1위)', value: 98.5, label: '98.5% (낙찰)', type: 'WIN', color: '#22c55e' },
    { name: 'B사', value: 99.2, label: '99.2%', type: 'LOSS', color: '#64748b' },
    { name: '자사', value: 102.7, label: '102.7%', type: 'SELF', color: '#135bec' },
    { name: 'C사', value: 103.5, label: '103.5%', type: 'LOSS', color: '#64748b' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      <header className="px-10 py-10 sticky top-0 bg-background-dark/80 backdrop-blur-sm z-50 border-b border-border-dark">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-white text-4xl font-black tracking-tighter">실패 원인 분석</h1>
            <p className="text-[#9da6b9] text-base">지난 30일간의 입찰 데이터를 기반으로 취약점을 진단하고 개선책을 제시합니다.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-surface-dark px-4 py-2.5 rounded-xl text-white text-sm font-bold border border-border-dark">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              Oct 1 - Oct 30
            </button>
            <button className="flex items-center gap-2 bg-primary px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]">download</span>
              리포트 다운로드
            </button>
          </div>
        </div>
      </header>

      <div className="p-10 space-y-8 max-w-[1200px] mx-auto w-full pb-20">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">총 유찰 건수</p>
              <span className="material-symbols-outlined text-red-500 bg-red-500/10 p-1.5 rounded-lg text-[20px]">trending_up</span>
            </div>
            <p className="text-3xl font-black text-white">124건</p>
            <p className="text-red-500 text-xs font-bold">+12% vs last month</p>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">재입찰 비중</p>
              <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-1.5 rounded-lg text-[20px]">trending_down</span>
            </div>
            <p className="text-3xl font-black text-white">15%</p>
            <p className="text-green-500 text-xs font-bold">-2% vs last month</p>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">평균 투찰가 차이</p>
              <span className="material-symbols-outlined text-orange-500 bg-orange-500/10 p-1.5 rounded-lg text-[20px]">warning</span>
            </div>
            <p className="text-3xl font-black text-white">+4.2%</p>
            <p className="text-orange-500 text-xs font-bold uppercase tracking-tight">High above winning bid</p>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">기술 점수 미달</p>
              <span className="material-symbols-outlined text-red-500 bg-red-500/10 p-1.5 rounded-lg text-[20px]">trending_up</span>
            </div>
            <p className="text-3xl font-black text-white">32건</p>
            <p className="text-red-500 text-xs font-bold">+5% vs last month</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Failure Donut */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-white text-lg font-black">유찰 사유 비중 (Top 5)</h3>
                  <p className="text-[#9da6b9] text-sm">지난 30일 데이터 기준</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary"></span>
                  <span className="text-[10px] text-[#9da6b9] font-bold uppercase tracking-widest">Major Reason</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative size-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black text-white tracking-tighter">45%</span>
                    <span className="text-[10px] text-[#9da6b9] font-black uppercase">Price Gap</span>
                  </div>
                </div>
                <div className="flex-1 space-y-5 w-full">
                  {pieData.map((entry, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-white">{entry.name}</span>
                        <span className="text-[#9da6b9]">{entry.value}%</span>
                      </div>
                      <div className="h-2 bg-background-dark rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${entry.value}%`, backgroundColor: entry.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gap Chart */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-white text-lg font-black">경쟁사 대비 투찰가 차이</h3>
                  <p className="text-[#9da6b9] text-sm">낙찰가 대비 평균 <span className="text-red-500 font-bold">+4.2%</span> 높게 투찰됨</p>
                </div>
                <button className="text-primary text-xs font-black hover:underline uppercase tracking-tight">Full Analysis</button>
              </div>
              <div className="space-y-6">
                {gapData.map((row, i) => (
                  <div key={i} className="grid grid-cols-[80px_1fr_80px] items-center gap-6">
                    <span className={`text-sm font-black ${row.type === 'SELF' ? 'text-white' : 'text-[#9da6b9]'}`}>{row.name}</span>
                    <div className={`relative h-10 bg-background-dark/50 rounded-lg overflow-hidden flex items-center ${row.type === 'SELF' ? 'ring-2 ring-primary/40' : ''}`}>
                      <div className="h-full opacity-60 transition-all duration-1000" style={{ width: `${row.value - 30}%`, backgroundColor: row.color }}></div>
                      <span className="absolute left-4 text-xs font-black text-white drop-shadow-md">{row.label}</span>
                    </div>
                    <span className={`text-right text-xs font-black uppercase tracking-tight ${row.type === 'WIN' ? 'text-[#22c55e]' : row.type === 'SELF' ? 'text-red-500' : 'text-[#9da6b9]'}`}>
                      {row.type === 'WIN' ? 'Winning' : row.type === 'SELF' ? '+4.2%' : `+${(row.value - 98.5).toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-surface-dark to-surface-darker border border-white/5 rounded-2xl p-8 flex flex-col shadow-2xl h-full">
              <div className="flex items-center gap-4 mb-10">
                <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <span className="material-symbols-outlined text-[32px]">lightbulb</span>
                </div>
                <div>
                  <h3 className="text-white text-lg font-black tracking-tight">AI 전략 인사이트</h3>
                  <p className="text-[#9da6b9] text-[10px] font-black uppercase tracking-widest">Failure Patterns</p>
                </div>
              </div>
              <div className="space-y-10">
                <div className="flex gap-4">
                  <span className="text-primary font-black text-2xl tracking-tighter opacity-50">01</span>
                  <div className="space-y-1.5">
                    <p className="text-white font-black text-sm">가격 마진율 조정 권고</p>
                    <p className="text-[#9da6b9] text-xs leading-relaxed font-medium">
                      최근 건설 분야 입찰에서 평균 <span className="text-red-500 font-bold">4.2%</span> 높은 가격으로 탈락했습니다. 마진율을 2% 하향 조정 시 낙찰 확률이 <span className="text-green-500 font-bold">15%</span> 상승합니다.
                    </p>
                  </div>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex gap-4">
                  <span className="text-purple-500 font-black text-2xl tracking-tighter opacity-50">02</span>
                  <div className="space-y-2">
                    <p className="text-white font-black text-sm">기술 제안서 개선</p>
                    <p className="text-[#9da6b9] text-xs leading-relaxed font-medium">
                      기술 점수 미달 건수가 전월 대비 5% 증가했습니다. 특히 '안전 관리 계획' 항목 보완이 시급합니다.
                    </p>
                    <button className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-300 transition-colors uppercase border border-white/5">
                      Case Studies
                    </button>
                  </div>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex gap-4">
                  <span className="text-orange-500 font-black text-2xl tracking-tighter opacity-50">03</span>
                  <div className="space-y-1.5">
                    <p className="text-white font-black text-sm">서류 자동 검수 활성화</p>
                    <p className="text-[#9da6b9] text-xs leading-relaxed font-medium">
                      단순 서류 미비로 인한 탈락이 15%를 차지합니다. AI 사전 검수 툴을 활용하여 리스크를 제거하십시오.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailureAnalysis;
