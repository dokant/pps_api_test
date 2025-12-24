
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Simulator: React.FC = () => {
  const [baseAmount, setBaseAmount] = useState<string>("142,000,000");
  const [rate, setRate] = useState<number>(100.2);
  const [aValue, setAValue] = useState<string>("12,500,000");
  const [isCalculating, setIsCalculating] = useState(false);
  const [resultPrice, setResultPrice] = useState<number>(124586300);

  const data = [
    { name: '86.5%', value: 20 },
    { name: '87.0%', value: 35 },
    { name: '87.2%', value: 50 },
    { name: '87.5%', value: 65 },
    { name: '87.7%', value: 90 },
    { name: '87.9%', value: 70 },
    { name: '88.1%', value: 45 },
    { name: '88.3%', value: 25 },
    { name: '88.5%', value: 15 },
  ];

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const numericBase = parseInt(baseAmount.replace(/,/g, '')) || 0;
      const numericA = parseInt(aValue.replace(/,/g, '')) || 0;
      // Simulated AI Logic: (Base - A) * (Expected Lower Bound Rate) + A
      const calculated = Math.floor((numericBase - numericA) * 0.87745 + numericA);
      setResultPrice(calculated);
      setIsCalculating(false);
    }, 800);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark pb-10">
      <header className="px-6 md:px-10 py-6 border-b border-border-dark sticky top-0 bg-background-dark/80 backdrop-blur-sm z-40">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            AI Bidding Engine
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-white text-3xl md:text-4xl font-black tracking-tighter">투찰 시뮬레이터</h1>
              <p className="text-[#9da6b9] text-sm md:text-base mt-1">사정률과 A값을 조정하여 최적의 투찰가를 산출합니다.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
              <h3 className="text-white text-xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                입찰 파라미터
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white text-xs font-black uppercase tracking-widest opacity-60">기초금액 (KRW)</label>
                  <input 
                    className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 font-mono focus:ring-primary focus:border-primary" 
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-white text-xs font-black uppercase tracking-widest opacity-60">예상 사정률</label>
                    <span className="text-primary font-mono font-bold">{rate.toFixed(3)}%</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-background-dark rounded-full appearance-none accent-primary cursor-pointer" min="98" max="102" step="0.001" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white text-xs font-black uppercase tracking-widest opacity-60">A값 (고정비용)</label>
                  <input 
                    className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 font-mono text-sm focus:ring-primary focus:border-primary" 
                    value={aValue}
                    onChange={(e) => setAValue(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className={`w-full ${isCalculating ? 'bg-slate-700' : 'bg-primary hover:bg-blue-600'} py-4 rounded-xl text-white font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all mt-4`}
              >
                <span className={`material-symbols-outlined ${isCalculating ? 'animate-spin' : ''}`}>
                  {isCalculating ? 'autorenew' : 'calculate'}
                </span>
                {isCalculating ? '계산 중...' : '시뮬레이션 실행'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-2xl p-6 shadow-lg">
              <p className="text-xs text-[#9da6b9] font-bold uppercase tracking-widest mb-4">AI Pro Tip</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                현재 업종의 평균 낙찰률은 <span className="text-white font-bold">87.745%</span>입니다. 경쟁률이 높을수록 사정률의 정밀도가 승부를 결정짓습니다.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-dark border-2 border-primary/50 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                <p className="text-primary text-[10px] font-black tracking-widest uppercase mb-1">AI Recommended Bid</p>
                <h3 className="text-white text-3xl md:text-4xl font-black font-mono tracking-tighter">
                  {formatCurrency(resultPrice)}
                </h3>
                <p className="text-xs text-[#9da6b9] mt-3">투찰률: <span className="text-white font-bold">87.736%</span></p>
              </div>

              <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
                <p className="text-[#9da6b9] text-[10px] font-black tracking-widest uppercase mb-1">Expected Win Prob.</p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-white text-3xl md:text-4xl font-black tracking-tighter">18.4%</h3>
                  <span className="text-[#0bda5e] text-xs font-bold px-2 py-0.5 bg-green-500/10 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    Very High
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 shadow-xl">
              <h3 className="text-white text-lg font-black mb-8">낙찰 분포 분석 (Market Insights)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#282e39" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 10 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      contentStyle={{ backgroundColor: '#1e2330', border: '1px solid #282e39', borderRadius: '12px' }}
                      itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === '87.7%' ? '#135bec' : '#135bec44'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
