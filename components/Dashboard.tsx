
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const kpis = [
    { label: '진행 중인 입찰', value: '142건', trend: 12, icon: 'gavel', trendUp: true },
    { label: '오늘의 낙찰률', value: '87.5%', trend: 2.4, icon: 'verified', trendUp: true },
    { label: '마감 임박 (24h)', value: '12건', trend: 5, icon: 'timer', trendUp: false },
    { label: '이번 달 예상 수익', value: '₩1.2억', trend: 0.8, icon: 'savings', trendUp: true },
  ];

  const alerts = [
    { type: 'URGENT', title: '강남구청 노후 서버 교체 사업', time: '2시간 전', message: '마감까지 1시간 남았습니다. 최종 투찰가를 확인하세요.' },
    { type: 'WIN', title: '경기도 교육청 정보화 사업', time: '5시간 전', message: '축하합니다! (주)프로큐어 합계점수 98.4점으로 낙찰되었습니다.' },
    { type: 'INFO', title: '신규 경쟁사 분석 완료', time: '오전 09:15', message: '테크윈 시스템의 최근 3개월 투찰 패턴 분석이 완료되었습니다.' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      <header className="px-6 md:px-8 py-6 border-b border-white/5 backdrop-blur-sm z-30 sticky top-0 bg-background-dark/80">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end max-w-7xl mx-auto w-full gap-4">
          <div>
            <h2 className="text-white text-3xl font-black tracking-tight">대시보드 개요</h2>
            <p className="text-[#9da6b9] text-base">환영합니다. 오늘의 주요 지표와 실시간 입찰 현황입니다.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-surface-dark px-3 py-2 rounded-xl text-[#9da6b9] text-xs font-bold flex items-center gap-2 border border-white/5">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>2024년 10월 24일</span>
            </div>
            <button className="bg-primary px-4 py-2 rounded-xl text-white font-bold text-sm shadow-xl shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all flex-1 md:flex-none justify-center">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              새로고침
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full pb-20">
        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-lg transition-transform hover:-translate-y-1">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[64px] text-white">{kpi.icon}</span>
              </div>
              <p className="text-[#9da6b9] text-xs font-black uppercase tracking-widest">{kpi.label}</p>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-white text-3xl font-bold tracking-tight">{kpi.value}</p>
                <span className={`${kpi.trendUp ? 'text-[#0bda5e]' : 'text-[#fa6238]'} text-sm font-bold flex items-center mb-1`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {kpi.trendUp ? 'trending_up' : 'trending_down'}
                  </span>
                  {kpi.trend}%
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Map and Alerts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-dark border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[450px] shadow-lg">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">public</span>
                실시간 입찰 지역 분포
              </h3>
              <div className="flex bg-surface-darker p-1 rounded-lg gap-1 border border-white/5">
                <button className="p-1.5 rounded-md bg-surface-dark text-white shadow-sm"><span className="material-symbols-outlined text-[18px]">map</span></button>
                <button className="p-1.5 rounded-md text-[#9da6b9] hover:text-white"><span className="material-symbols-outlined text-[18px]">list</span></button>
              </div>
            </div>
            <div className="flex-1 relative bg-surface-darker">
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-[0.3]"
                style={{ backgroundImage: `url('https://picsum.photos/1200/800?random=map')` }}
              ></div>
              <div className="absolute top-4 left-4 z-10 w-full max-w-xs">
                <div className="bg-surface-dark/90 backdrop-blur-md rounded-xl border border-white/10 p-1 flex items-center shadow-2xl">
                  <span className="material-symbols-outlined text-[#9da6b9] px-3 text-[20px]">search</span>
                  <input className="bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-slate-500 w-full" placeholder="전국 지역구 검색..." />
                </div>
              </div>
              
              {/* Animated Map Pins */}
              <div className="absolute top-[30%] left-[45%] group cursor-pointer">
                <div className="size-4 bg-primary rounded-full border-2 border-white shadow-[0_0_20px_rgba(19,91,236,1)] animate-ping absolute inset-0"></div>
                <div className="size-4 bg-primary rounded-full border-2 border-white relative"></div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-surface-dark p-2 rounded shadow-2xl border border-white/10 z-20 whitespace-nowrap">
                  <p className="text-xs text-white font-bold">서울 본청 - 24건 진행</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-dark border border-white/5 rounded-2xl flex flex-col shadow-xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">notifications_active</span>
                실시간 알림
              </h3>
              <span className="size-2 bg-orange-500 rounded-full animate-pulse"></span>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[400px]">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-surface-darker/50 p-4 rounded-xl border border-white/5 space-y-2 hover:bg-surface-darker transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      alert.type === 'URGENT' ? 'bg-red-500/10 text-red-500' : 
                      alert.type === 'WIN' ? 'bg-green-500/10 text-green-500' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {alert.type}
                    </span>
                    <span className="text-[10px] text-[#9da6b9] font-bold">{alert.time}</span>
                  </div>
                  <h4 className="text-white text-sm font-bold group-hover:text-primary transition-colors">{alert.title}</h4>
                  <p className="text-[#9da6b9] text-xs leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-background-dark/50 border-t border-white/5">
              <button className="w-full text-center text-xs text-[#9da6b9] font-bold hover:text-white transition-colors py-2">전체 알림 보기</button>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              AI 추천 분석
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-[#9da6b9] font-black uppercase tracking-widest">낙찰 하한율 예측</p>
                  <h4 className="text-white text-lg font-bold mt-1">서울지방조달청</h4>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[10px] font-black">94% CONFIDENCE</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">87.745</span>
                <span className="text-[#9da6b9] text-lg font-bold">%</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-surface-darker rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(19,91,236,0.5)]" style={{ width: '87%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500">최근 3개월 유사 공고 12,450건 분석 결과</p>
              </div>
            </div>

            <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] text-[#9da6b9] font-black uppercase tracking-widest">경쟁사 벤치마킹</p>
                <button className="text-primary text-[10px] font-black uppercase hover:underline">Full Report</button>
              </div>
              <div className="space-y-4 flex-1">
                {[
                  { name: '(주)테크윈', win: 5, color: '#0bda5e' },
                  { name: '미래정보기술', win: 2, color: '#0bda5e' },
                  { name: '대한씨앤에스', win: 0, color: '#fa6238' },
                ].map((comp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-darker/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                        {comp.name[0]}
                      </div>
                      <span className="text-white text-sm font-bold">{comp.name}</span>
                    </div>
                    <span className={`text-xs font-black`} style={{ color: comp.color }}>
                      {comp.win > 0 ? `낙찰 ${comp.win}건` : '최근 패찰'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] text-[#9da6b9] font-black uppercase tracking-widest">수요기관 성향 분석</p>
                <span className="material-symbols-outlined text-[#9da6b9] text-[18px]">info</span>
              </div>
              <div className="flex gap-2 mb-6">
                <span className="bg-primary/20 text-primary px-2.5 py-1 rounded-full text-[10px] font-black border border-primary/20">예산 소진형</span>
                <span className="bg-white/5 text-slate-500 px-2.5 py-1 rounded-full text-[10px] font-black border border-white/5">엄격 심사</span>
              </div>
              <div className="bg-surface-darker p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-bold">한국전력공사</span>
                  <span className="text-orange-500 text-[10px] font-black">HIGH RISK</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-[10px] text-orange-500 font-bold text-right">낙찰 하한율 편차 큼</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
