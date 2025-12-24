
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CompetitorAnalysis: React.FC = () => {
  const scatterData = [
    { x: 1, y: 88, status: 'WIN' },
    { x: 1.5, y: 92, status: 'LOSS' },
    { x: 2, y: 85, status: 'LOSS' },
    { x: 2.5, y: 87.5, status: 'WIN' },
    { x: 3, y: 89, status: 'LOSS' },
    { x: 3.5, y: 86.5, status: 'WIN' },
    { x: 4, y: 91, status: 'LOSS' },
    { x: 4.5, y: 88.2, status: 'WIN' },
    { x: 5, y: 84.5, status: 'LOSS' },
    { x: 5.5, y: 87.1, status: 'WIN' },
    { x: 6, y: 90.2, status: 'LOSS' },
  ];

  const agencies = [
    { name: '한국전력공사', value: 35, color: '#135bec' },
    { name: '조달청', value: 22, color: '#60a5fa' },
    { name: '한국토지주택공사', value: 15, color: '#93c5fd' },
    { name: '서울대학교병원', value: 10, color: '#a5b4fc' },
    { name: '기타', value: 18, color: '#4b5563' },
  ];

  const history = [
    { title: '차세대 정보시스템 유지보수', agency: '국민건강보험공단', price: '2,450,000,000', rate: '87.995%', result: 'LOSS', resultColor: '#ef4444' },
    { title: '스마트시티 통합플랫폼 구축', agency: '부산광역시', price: '1,280,000,000', rate: '88.120%', result: 'WIN', resultColor: '#22c55e' },
    { title: '행정정보시스템 고도화 사업', agency: '행정안전부', price: '5,600,000,000', rate: '86.745%', result: 'LOSS', resultColor: '#ef4444' },
    { title: '데이터센터 인프라 증설', agency: '한국데이터산업진흥원', price: '980,000,000', rate: '87.750%', result: 'LOSS', resultColor: '#ef4444' },
    { title: '교육행정시스템 서버 교체', agency: '경기도교육청', price: '450,000,000', rate: '87.995%', result: 'WIN', resultColor: '#22c55e' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      <header className="px-10 py-10 bg-background-dark border-b border-border-dark">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-white text-4xl font-black tracking-tighter">경쟁사 분석</h1>
            <p className="text-[#9da6b9] text-base font-normal max-w-2xl">
              경쟁사의 입찰 패턴, 낙찰 이력, 주력 수요기관을 분석하여 전략적인 입찰 계획을 수립하세요.
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[450px]">
            <div className="bg-surface-dark border border-border-dark rounded-xl flex items-stretch overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <div className="flex items-center pl-4 text-[#9da6b9]">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="w-full bg-transparent border-none text-white text-sm py-4 px-4 focus:ring-0 placeholder:text-slate-500" placeholder="사업자등록번호 또는 기업명 검색..." defaultValue="123-45-67890" />
              <button className="bg-primary px-8 text-white text-sm font-black hover:bg-blue-600">분석하기</button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-10 space-y-8 max-w-[1200px] mx-auto w-full pb-20">
        {/* Profile Card */}
        <section className="bg-surface-dark border border-border-dark rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex-shrink-0 size-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[64px] text-slate-500">domain</span>
          </div>
          <div className="flex flex-col justify-between flex-1 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-white text-2xl font-black leading-tight">테크윈 시스템 (주)</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-tight">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Normal Operation
                </span>
              </div>
              <p className="text-[#9da6b9] text-sm">대표이사: 김철수 | 사업자등록번호: 123-45-67890</p>
              <p className="text-[#9da6b9] text-sm mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                서울특별시 구로구 디지털로 55, 대륭포스트타워 3차 1004호
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-background-dark/50 text-[#9da6b9] text-xs font-bold border border-white/5">소프트웨어 개발</span>
              <span className="px-3 py-1.5 rounded-lg bg-background-dark/50 text-[#9da6b9] text-xs font-bold border border-white/5">정보통신공사</span>
              <span className="px-3 py-1.5 rounded-lg bg-background-dark/50 text-[#9da6b9] text-xs font-bold border border-white/5">시스템 통합(SI)</span>
            </div>
          </div>
          <div className="min-w-[160px] border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10 flex flex-col justify-center">
            <span className="text-[#9da6b9] text-sm font-medium mb-1">경쟁력 점수</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white">87</span>
              <span className="text-slate-500 text-sm font-bold">/ 100</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-primary h-full rounded-full" style={{ width: '87%' }}></div>
            </div>
            <span className="text-xs text-primary font-black mt-2">상위 5% 이내</span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">총 낙찰 건수 (최근 1년)</p>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">trophy</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">42건</span>
              <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-2 py-0.5 rounded-md flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 5%
              </span>
            </div>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">낙찰 성공률</p>
              <span className="material-symbols-outlined text-blue-400 bg-blue-400/10 p-2 rounded-xl">pie_chart</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">18.5%</span>
              <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-2 py-0.5 rounded-md flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 1.2%
              </span>
            </div>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">누적 수주액</p>
              <span className="material-symbols-outlined text-purple-400 bg-purple-400/10 p-2 rounded-xl">payments</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">124억</span>
              <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-2 py-0.5 rounded-md flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 21억
              </span>
            </div>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[#9da6b9] text-sm font-bold">평균 투찰률</p>
              <span className="material-symbols-outlined text-orange-400 bg-orange-400/10 p-2 rounded-xl">trending_flat</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">87.9%</span>
              <span className="text-orange-500 text-[10px] font-black bg-orange-500/10 px-2 py-0.5 rounded-md flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> 0.5%
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pattern Analysis */}
          <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-8 flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-white font-black text-xl">투찰 성향 분석 (최근 6개월)</h3>
              <select className="bg-background-dark border-white/10 text-[#9da6b9] text-[10px] font-bold rounded-lg px-3 py-2 focus:ring-primary">
                <option>전체 보기</option>
                <option>낙찰건만 보기</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282e39" vertical={false} />
                  <XAxis type="number" dataKey="x" axisLine={false} tick={false} domain={[0, 7]} />
                  <YAxis type="number" dataKey="y" axisLine={false} tick={{ fill: '#9da6b9', fontSize: 10 }} domain={[80, 100]} />
                  <ZAxis type="number" range={[100, 200]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2330', border: '1px solid #282e39', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Scatter name="Wins" data={scatterData.filter(d => d.status === 'WIN')} fill="#22c55e" />
                  <Scatter name="Losses" data={scatterData.filter(d => d.status === 'LOSS')} fill="#4b5563" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold px-4">
              <span>1월</span>
              <span>2월</span>
              <span>3월</span>
              <span>4월</span>
              <span>5월</span>
              <span>6월</span>
            </div>
          </div>

          {/* Agencies Analysis */}
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 flex flex-col shadow-xl">
            <h3 className="text-white font-black text-xl mb-10">주력 수요기관 TOP 5</h3>
            <div className="space-y-6 flex-1">
              {agencies.map((agency, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{agency.name}</span>
                    <span className="text-[#9da6b9]">{agency.value}%</span>
                  </div>
                  <div className="h-2 bg-background-dark rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${agency.value}%`, backgroundColor: agency.color }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-5 bg-background-dark/50 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] text-[#9da6b9] font-black uppercase tracking-widest">AI Insight</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                해당 기업은 <span className="text-primary font-bold">공기업</span> 발주 사업에서 특히 높은 승률(28%)을 보이고 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Participation History */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
          <h3 className="text-white font-black text-xl mb-6">최근 입찰 참여 현황</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-[#9da6b9] uppercase font-black bg-background-dark border-b border-border-dark">
                <tr>
                  <th className="px-6 py-4">공고명</th>
                  <th className="px-6 py-4">수요기관</th>
                  <th className="px-6 py-4 text-right">투찰금액</th>
                  <th className="px-6 py-4 text-center">투찰률</th>
                  <th className="px-6 py-4 text-center">결과</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{row.title}</td>
                    <td className="px-6 py-4 text-[#9da6b9]">{row.agency}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">{row.price}</td>
                    <td className="px-6 py-4 text-center font-mono text-[#9da6b9]">{row.rate}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-1 rounded text-[10px] font-black border" style={{ backgroundColor: `${row.resultColor}15`, color: row.resultColor, borderColor: `${row.resultColor}20` }}>
                        {row.result === 'WIN' ? '낙찰' : '패찰'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
