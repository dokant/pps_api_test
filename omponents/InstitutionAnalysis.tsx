import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Institution {
  name: string;
  bid_count: number;
  total_amount: number;
  avg_amount: number;
  avg_rate: number;
  min_rate: number;
  max_rate: number;
  avg_participants: number;
  unique_winners: number;
}

interface InstitutionDetail {
  institution: {
    name: string;
    bid_count: number;
    total_amount: number;
    avg_amount: number;
    unique_winners: number;
    avg_participants: number;
  };
  rate_statistics: {
    mean: number;
    std: number;
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
  };
  recommended_rate: {
    optimal: number;
    low: number;
    high: number;
  };
  top_winners: Array<{
    company_name: string;
    bizno: string;
    win_count: number;
    total_amount: number;
    avg_rate: number;
  }>;
  monthly_trend: Array<{
    month: string;
    count: number;
    avg_rate: number;
    total_amount: number;
  }>;
  recent_bids: Array<{
    bid_name: string;
    winner: string;
    amount: number;
    rate: number;
    participants: number;
    date: string;
  }>;
}

const InstitutionAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<InstitutionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    fetchInstitutionList();
  }, []);

  // 기관 목록 조회
  const fetchInstitutionList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/institution?limit=30');
      const data = await res.json();
      if (data.success) {
        setInstitutions(data.institutions);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  // 기관 상세 분석
  const fetchInstitutionDetail = async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/institution?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success) {
        setSelectedDetail(data);
      } else {
        setError(data.message || '기관을 찾을 수 없습니다.');
        setSelectedDetail(null);
      }
    } catch (err) {
      setError('API 호출 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  // 검색 실행
  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchInstitutionDetail(searchTerm.trim());
    }
  };

  // 숫자 포맷
  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);
  
  const formatAmount = (num: number) => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000) return `${(num / 10000).toFixed(0)}만`;
    return formatNumber(num);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      {/* Header */}
      <header className="px-10 py-10 bg-background-dark border-b border-border-dark">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-white text-4xl font-black tracking-tighter">기관별 패턴 분석</h1>
            <p className="text-[#9da6b9] text-base font-normal max-w-2xl">
              발주기관별 낙찰률 패턴, 주요 낙찰업체, 월별 추이를 분석합니다.
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[450px]">
            <div className="bg-surface-dark border border-border-dark rounded-xl flex items-stretch overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <div className="flex items-center pl-4 text-[#9da6b9]">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="w-full bg-transparent border-none text-white text-sm py-4 px-4 focus:ring-0 placeholder:text-slate-500" 
                placeholder="기관명 검색 (예: 서울시, 교육청, 경찰청)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-primary px-8 text-white text-sm font-black hover:bg-blue-600 disabled:bg-slate-600"
              >
                {isLoading ? '분석중...' : '분석하기'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-10 space-y-8 max-w-[1400px] mx-auto w-full pb-20">
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* 상세 분석 결과 */}
        {selectedDetail && (
          <>
            {/* 기관 정보 카드 */}
            <section className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 size-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[48px] text-primary">apartment</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-white text-2xl font-black mb-2">{selectedDetail.institution.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-[#9da6b9]">
                    <span>총 {formatNumber(selectedDetail.institution.bid_count)}건 발주</span>
                    <span>•</span>
                    <span>누적 {formatAmount(selectedDetail.institution.total_amount)}원</span>
                    <span>•</span>
                    <span>{selectedDetail.institution.unique_winners}개 업체 낙찰</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#9da6b9] text-xs mb-1">AI 추천 투찰률</p>
                  <p className="text-primary text-3xl font-black">{selectedDetail.recommended_rate.optimal}%</p>
                  <p className="text-[#9da6b9] text-xs mt-1">
                    범위: {selectedDetail.recommended_rate.low}% ~ {selectedDetail.recommended_rate.high}%
                  </p>
                </div>
              </div>
            </section>

            {/* 통계 카드 */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                <p className="text-[#9da6b9] text-xs font-bold mb-2">평균 낙찰률</p>
                <p className="text-white text-2xl font-black">{selectedDetail.rate_statistics.mean.toFixed(2)}%</p>
              </div>
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                <p className="text-[#9da6b9] text-xs font-bold mb-2">중앙값</p>
                <p className="text-white text-2xl font-black">{selectedDetail.rate_statistics.median.toFixed(2)}%</p>
              </div>
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                <p className="text-[#9da6b9] text-xs font-bold mb-2">평균 참가업체</p>
                <p className="text-white text-2xl font-black">{selectedDetail.institution.avg_participants.toFixed(0)}개</p>
              </div>
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                <p className="text-[#9da6b9] text-xs font-bold mb-2">평균 낙찰금액</p>
                <p className="text-white text-2xl font-black">{formatAmount(selectedDetail.institution.avg_amount)}</p>
              </div>
            </section>

            {/* 낙찰률 분포 */}
            <section className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
              <h3 className="text-white font-black text-xl mb-4">낙찰률 분포</h3>
              <div className="flex items-center gap-4">
                <span className="text-[#9da6b9] text-sm w-16">최저</span>
                <div className="flex-1 relative h-8 bg-background-dark rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30"
                    style={{ left: '0%', right: '0%' }}
                  ></div>
                  <div 
                    className="absolute h-full bg-primary/50"
                    style={{ 
                      left: `${(selectedDetail.rate_statistics.q1 - 70) / 0.35}%`,
                      width: `${(selectedDetail.rate_statistics.q3 - selectedDetail.rate_statistics.q1) / 0.35}%`
                    }}
                  ></div>
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-white"
                    style={{ left: `${(selectedDetail.rate_statistics.median - 70) / 0.35}%` }}
                  ></div>
                </div>
                <span className="text-[#9da6b9] text-sm w-16 text-right">최고</span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#9da6b9]">
                <span>{selectedDetail.rate_statistics.min.toFixed(1)}%</span>
                <span>Q1: {selectedDetail.rate_statistics.q1.toFixed(1)}%</span>
                <span>중앙: {selectedDetail.rate_statistics.median.toFixed(1)}%</span>
                <span>Q3: {selectedDetail.rate_statistics.q3.toFixed(1)}%</span>
                <span>{selectedDetail.rate_statistics.max.toFixed(1)}%</span>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 월별 추이 */}
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
                <h3 className="text-white font-black text-xl mb-6">월별 낙찰률 추이</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedDetail.monthly_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#282e39" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e2330', border: '1px solid #282e39', borderRadius: '12px' }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, '평균 낙찰률']}
                      />
                      <Line type="monotone" dataKey="avg_rate" stroke="#135bec" strokeWidth={2} dot={{ fill: '#135bec' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 상위 낙찰업체 */}
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
                <h3 className="text-white font-black text-xl mb-6">상위 낙찰업체 TOP 5</h3>
                <div className="space-y-4">
                  {selectedDetail.top_winners.slice(0, 5).map((winner, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                        ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                          idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                          idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-white/5 text-[#9da6b9]'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">{winner.company_name}</p>
                        <p className="text-[#9da6b9] text-xs">{winner.win_count}건 • {formatAmount(winner.total_amount)}</p>
                      </div>
                      <span className="text-primary font-mono font-bold">{winner.avg_rate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 최근 낙찰 내역 */}
            <section className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
              <h3 className="text-white font-black text-xl mb-6">최근 낙찰 내역</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[10px] text-[#9da6b9] uppercase font-black bg-background-dark border-b border-border-dark">
                    <tr>
                      <th className="px-4 py-3 text-left">공고명</th>
                      <th className="px-4 py-3 text-left">낙찰업체</th>
                      <th className="px-4 py-3 text-right">낙찰금액</th>
                      <th className="px-4 py-3 text-center">낙찰률</th>
                      <th className="px-4 py-3 text-center">참가</th>
                      <th className="px-4 py-3 text-center">일자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedDetail.recent_bids.map((bid, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white max-w-[200px] truncate" title={bid.bid_name}>{bid.bid_name}</td>
                        <td className="px-4 py-3 text-[#9da6b9] max-w-[120px] truncate">{bid.winner}</td>
                        <td className="px-4 py-3 text-right font-mono text-white">{formatAmount(bid.amount)}</td>
                        <td className="px-4 py-3 text-center text-primary font-mono font-bold">{bid.rate?.toFixed(2)}%</td>
                        <td className="px-4 py-3 text-center text-[#9da6b9]">{bid.participants}</td>
                        <td className="px-4 py-3 text-center text-[#9da6b9]">{bid.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* 기관 목록 (상세 선택 전) */}
        {!selectedDetail && (
          <section className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
            <h3 className="text-white font-black text-xl mb-6">상위 발주기관 목록</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] text-[#9da6b9] uppercase font-black bg-background-dark border-b border-border-dark">
                  <tr>
                    <th className="px-4 py-3 text-left">기관명</th>
                    <th className="px-4 py-3 text-right">발주건수</th>
                    <th className="px-4 py-3 text-right">총 금액</th>
                    <th className="px-4 py-3 text-center">평균 낙찰률</th>
                    <th className="px-4 py-3 text-center">평균 참가</th>
                    <th className="px-4 py-3 text-center">낙찰업체</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {institutions.map((inst, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-bold">{inst.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-white">{formatNumber(inst.bid_count)}건</td>
                      <td className="px-4 py-3 text-right font-mono text-[#9da6b9]">{formatAmount(inst.total_amount)}</td>
                      <td className="px-4 py-3 text-center text-primary font-mono font-bold">{inst.avg_rate.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-center text-[#9da6b9]">{inst.avg_participants.toFixed(0)}개</td>
                      <td className="px-4 py-3 text-center text-[#9da6b9]">{inst.unique_winners}개</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => fetchInstitutionDetail(inst.name)}
                          className="text-primary hover:text-blue-400 text-xs font-bold"
                        >
                          상세분석 →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 뒤로가기 버튼 */}
        {selectedDetail && (
          <button 
            onClick={() => setSelectedDetail(null)}
            className="text-[#9da6b9] hover:text-white flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            기관 목록으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};

export default InstitutionAnalysis;
