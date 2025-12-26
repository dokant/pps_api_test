import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api, { PredictResponse, ProbabilityResponse } from '../services/api';

const Simulator: React.FC = () => {
  // 입력 상태
  const [estimatedPrice, setEstimatedPrice] = useState<string>("50,000,000");
  const [participants, setParticipants] = useState<number>(10);
  const [myRate, setMyRate] = useState<number>(88.5);
  
  // 결과 상태
  const [isLoading, setIsLoading] = useState(false);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [probResult, setProbResult] = useState<ProbabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 차트 데이터
  const [chartData, setChartData] = useState<Array<{name: string; value: number}>>([]);

  // 숫자 포맷
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(num);
  };

  const parseNumber = (str: string) => {
    return parseInt(str.replace(/,/g, '')) || 0;
  };

  // 예측 실행
  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const price = parseNumber(estimatedPrice);
      
      // 낙찰가 예측 API 호출
      const predict = await api.predict({
        estimated_price: price,
        participants: participants
      });
      
      if (!predict.success) {
        setError(predict.message || '예측 실패');
        setIsLoading(false);
        return;
      }
      
      setPredictResult(predict);
      
      // 추천 투찰률로 확률 계산
      const prob = await api.probability({
        my_rate: predict.recommended_rate.optimal,
        estimated_price: price,
        participants: participants
      });
      
      setProbResult(prob);
      setMyRate(predict.recommended_rate.optimal);
      
      // 차트 데이터 생성
      generateChartData(predict);
      
    } catch (err) {
      setError('API 호출 중 오류가 발생했습니다.');
      console.error(err);
    }
    
    setIsLoading(false);
  };

  // 내 투찰률로 확률 재계산
  const handleCalculateProbability = async () => {
    if (!predictResult) return;
    
    setIsLoading(true);
    
    try {
      const prob = await api.probability({
        my_rate: myRate,
        estimated_price: parseNumber(estimatedPrice),
        participants: participants
      });
      
      setProbResult(prob);
    } catch (err) {
      console.error(err);
    }
    
    setIsLoading(false);
  };

  // 차트 데이터 생성
  const generateChartData = (result: PredictResponse) => {
    const { q1, median, q3 } = result.statistics;
    const optimal = result.recommended_rate.optimal;
    
    // q1 ~ q3 범위에서 차트 데이터 생성
    const step = (q3 - q1) / 8;
    const data = [];
    
    for (let i = 0; i < 9; i++) {
      const rate = q1 + (step * i);
      // 정규분포 근사값 (중앙이 높음)
      const distance = Math.abs(rate - median);
      const value = Math.max(10, 100 - (distance * 15));
      
      data.push({
        name: `${rate.toFixed(1)}%`,
        value: Math.round(value),
        rate: rate,
        isOptimal: Math.abs(rate - optimal) < step / 2
      });
    }
    
    setChartData(data);
  };

  // 투찰금액 계산
  const calculateBidAmount = (rate: number) => {
    const price = parseNumber(estimatedPrice);
    return Math.round(price * rate / 100);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark pb-10">
      {/* 헤더 */}
      <header className="px-6 md:px-10 py-6 border-b border-border-dark sticky top-0 bg-background-dark/80 backdrop-blur-sm z-40">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            AI Bidding Engine (실제 데이터 기반)
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-white text-3xl md:text-4xl font-black tracking-tighter">투찰 시뮬레이터</h1>
              <p className="text-[#9da6b9] text-sm md:text-base mt-1">
                {predictResult 
                  ? `${formatNumber(predictResult.sample_count)}건의 과거 데이터 기반 분석`
                  : '예정가격과 참가업체수를 입력하고 분석을 시작하세요'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto w-full">
        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 입력 패널 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
              <h3 className="text-white text-xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                입찰 조건 입력
              </h3>

              <div className="space-y-5">
                {/* 예정가격 */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-xs font-black uppercase tracking-widest opacity-60">
                    예정가격 (원)
                  </label>
                  <input 
                    className="w-full bg-background-dark border border-border-dark text-white rounded-xl py-3 px-4 font-mono focus:ring-primary focus:border-primary" 
                    value={estimatedPrice}
                    onChange={(e) => {
                      const num = parseNumber(e.target.value);
                      setEstimatedPrice(formatNumber(num));
                    }}
                    placeholder="50,000,000"
                  />
                </div>

                {/* 참가업체수 */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-white text-xs font-black uppercase tracking-widest opacity-60">
                      예상 참가업체수
                    </label>
                    <span className="text-primary font-mono font-bold">{participants}개</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-1.5 bg-background-dark rounded-full appearance-none accent-primary cursor-pointer" 
                    min="2" 
                    max="50" 
                    step="1" 
                    value={participants} 
                    onChange={(e) => setParticipants(parseInt(e.target.value))} 
                  />
                  <div className="flex justify-between text-xs text-[#9da6b9]">
                    <span>2개</span>
                    <span>50개</span>
                  </div>
                </div>
              </div>

              {/* 분석 버튼 */}
              <button 
                onClick={handlePredict}
                disabled={isLoading}
                className={`w-full ${isLoading ? 'bg-slate-700' : 'bg-primary hover:bg-blue-600'} py-4 rounded-xl text-white font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all mt-2`}
              >
                <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>
                  {isLoading ? 'autorenew' : 'query_stats'}
                </span>
                {isLoading ? '분석 중...' : '낙찰가 분석 시작'}
              </button>
            </div>

            {/* 내 투찰률 입력 */}
            {predictResult && (
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-xl">
                <h3 className="text-white text-lg font-black mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit</span>
                  내 투찰률 입력
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9da6b9] text-sm">투찰률</span>
                    <span className="text-white font-mono font-bold">{myRate.toFixed(2)}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-1.5 bg-background-dark rounded-full appearance-none accent-primary cursor-pointer" 
                    min={predictResult.statistics.q1 - 3}
                    max={predictResult.statistics.q3 + 3}
                    step="0.1" 
                    value={myRate} 
                    onChange={(e) => setMyRate(parseFloat(e.target.value))} 
                  />
                  <div className="flex justify-between text-xs text-[#9da6b9]">
                    <span>{(predictResult.statistics.q1 - 3).toFixed(1)}%</span>
                    <span>{(predictResult.statistics.q3 + 3).toFixed(1)}%</span>
                  </div>
                  
                  <div className="text-sm text-[#9da6b9]">
                    투찰금액: <span className="text-white font-bold">{formatCurrency(calculateBidAmount(myRate))}</span>
                  </div>
                  
                  <button 
                    onClick={handleCalculateProbability}
                    disabled={isLoading}
                    className="w-full bg-surface-darker hover:bg-border-dark py-3 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">calculate</span>
                    확률 재계산
                  </button>
                </div>
              </div>
            )}

            {/* AI 팁 */}
            {predictResult && (
              <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-2xl p-6 shadow-lg">
                <p className="text-xs text-[#9da6b9] font-bold uppercase tracking-widest mb-3">AI 분석 TIP</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  분석된 <span className="text-white font-bold">{formatNumber(predictResult.sample_count)}건</span>의 
                  유사 입찰에서 평균 낙찰률은 <span className="text-white font-bold">{predictResult.statistics.mean.toFixed(2)}%</span>입니다.
                  참가업체 {participants}개 기준 추천 범위는 
                  <span className="text-primary font-bold"> {predictResult.recommended_rate.low}% ~ {predictResult.recommended_rate.high}%</span>입니다.
                </p>
              </div>
            )}
          </div>

          {/* 결과 패널 */}
          <div className="lg:col-span-8 space-y-6">
            {/* 결과 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 추천 투찰가 */}
              <div className="bg-surface-dark border-2 border-primary/50 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <p className="text-primary text-[10px] font-black tracking-widest uppercase mb-1">AI 추천 투찰가</p>
                {predictResult ? (
                  <>
                    <h3 className="text-white text-2xl md:text-3xl font-black font-mono tracking-tighter">
                      {formatCurrency(predictResult.recommended_amount.optimal)}
                    </h3>
                    <p className="text-xs text-[#9da6b9] mt-3">
                      추천 투찰률: <span className="text-white font-bold">{predictResult.recommended_rate.optimal}%</span>
                    </p>
                    <p className="text-xs text-[#9da6b9] mt-1">
                      범위: {formatCurrency(predictResult.recommended_amount.low)} ~ {formatCurrency(predictResult.recommended_amount.high)}
                    </p>
                  </>
                ) : (
                  <p className="text-[#9da6b9] text-lg mt-2">분석을 시작하세요</p>
                )}
              </div>

              {/* 낙찰 확률 */}
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 shadow-xl">
                <p className="text-[#9da6b9] text-[10px] font-black tracking-widest uppercase mb-1">낙찰 확률</p>
                {probResult ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-white text-2xl md:text-3xl font-black tracking-tighter">
                        {probResult.win_probability}%
                      </h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1
                        ${probResult.risk.color === 'green' ? 'text-[#0bda5e] bg-green-500/10' : 
                          probResult.risk.color === 'yellow' ? 'text-yellow-400 bg-yellow-500/10' : 
                          'text-red-400 bg-red-500/10'}`}>
                        {probResult.risk.level}
                      </span>
                    </div>
                    <p className="text-xs text-[#9da6b9] mt-3">
                      예상 순위: <span className="text-white font-bold">{probResult.estimated_rank}위</span> / {probResult.total_participants}개 업체
                    </p>
                  </>
                ) : (
                  <p className="text-[#9da6b9] text-lg mt-2">-</p>
                )}
              </div>
            </div>

            {/* 추천 메시지 */}
            {probResult && (
              <div className={`rounded-xl p-4 ${
                probResult.risk.color === 'green' ? 'bg-green-500/10 border border-green-500/30' : 
                probResult.risk.color === 'yellow' ? 'bg-yellow-500/10 border border-yellow-500/30' : 
                'bg-red-500/10 border border-red-500/30'
              }`}>
                <p className={`text-sm ${
                  probResult.risk.color === 'green' ? 'text-green-400' : 
                  probResult.risk.color === 'yellow' ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {probResult.recommendation}
                </p>
              </div>
            )}

            {/* 차트 */}
            {chartData.length > 0 && (
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 shadow-xl">
                <h3 className="text-white text-lg font-black mb-6">낙찰률 분포 분석</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#282e39" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 10 }} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                        contentStyle={{ backgroundColor: '#1e2330', border: '1px solid #282e39', borderRadius: '12px' }}
                        formatter={(value: number, name: string) => [`${value}건`, '빈도']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.isOptimal ? '#135bec' : '#135bec44'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-[#9da6b9] mt-4 text-center">
                  파란색 강조 영역이 AI 추천 투찰률 범위입니다
                </p>
              </div>
            )}

            {/* 유사 사례 */}
            {predictResult && predictResult.similar_cases && (
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 shadow-xl">
                <h3 className="text-white text-lg font-black mb-4">유사 낙찰 사례 (최근 10건)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#9da6b9] text-xs uppercase border-b border-border-dark">
                        <th className="text-left py-3 px-2">공고명</th>
                        <th className="text-left py-3 px-2">발주기관</th>
                        <th className="text-right py-3 px-2">낙찰금액</th>
                        <th className="text-right py-3 px-2">낙찰률</th>
                        <th className="text-right py-3 px-2">참가수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictResult.similar_cases.slice(0, 10).map((item, idx) => (
                        <tr key={idx} className="border-b border-border-dark/50 hover:bg-background-dark/50">
                          <td className="py-3 px-2 text-white max-w-[200px] truncate" title={item.bid_name}>
                            {item.bid_name}
                          </td>
                          <td className="py-3 px-2 text-[#9da6b9] max-w-[120px] truncate" title={item.institution}>
                            {item.institution}
                          </td>
                          <td className="py-3 px-2 text-white text-right font-mono">
                            {formatNumber(item.amount)}
                          </td>
                          <td className="py-3 px-2 text-primary text-right font-mono font-bold">
                            {item.rate?.toFixed(2)}%
                          </td>
                          <td className="py-3 px-2 text-[#9da6b9] text-right">
                            {item.participants}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
