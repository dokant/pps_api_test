import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Competitor {
  company_name: string;
  bizno: string;
  win_count: number;
  total_amount: number;
  avg_amount: number;
  avg_rate: number;
  min_rate: number;
  max_rate: number;
  avg_participants: number;
}

interface CompetitorResponse {
  success: boolean;
  filter: {
    institution: string | null;
    bid_type: string | null;
  };
  summary: {
    total_companies: number;
    total_bids: number;
    total_amount: number;
    avg_participants: number;
    market_concentration: number;
    competition_intensity: {
      level: string;
      color: string;
    };
  };
  competitors: Competitor[];
}

const CompetitorAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [institutionFilter, setInstitutionFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CompetitorResponse | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Competitor | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    fetchCompetitors();
  }, []);

  // API 호출
  const fetchCompetitors = async (institution?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = '/api/competitors?limit=20';
      if (institution) {
        url += `&institution=${encodeURIComponent(institution)}`;
      }
      
      const res = await fetch(url);
      const result: CompetitorResponse = await res.json();
      
      if (result.success) {
        setData(result);
        if (result.competitors.length > 0) {
          setSelectedCompany(result.competitors[0]);
        }
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('API 호출 중 오류가 발생했습니다.');
      console.error(err);
    }
    
    setIsLoading(false);
  };

  // 검색 실행
  const handleSearch = () => {
    if (institutionFilter.trim()) {
      fetchCompetitors(institutionFilter.trim());
    } else {
      fetchCompetitors();
    }
  };

  // 숫자 포맷
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatAmount = (num: number) => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만`;
    }
    return formatNumber(num);
  };

  // 차트 데이터 생성
  const getChartData = () => {
    if (!data) return [];
    return data.competitors.slice(0, 10).map((c, idx) => ({
      name: c.company_name.length > 8 ? c.company_name.substring(0, 8) + '...' : c.company_name,
      fullName: c.company_name,
      count: c.win_count,
      rate: c.avg_rate
    }));
  };

  // 경쟁 강도 색상
  const getIntensityColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-400 bg-green-500/10';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/10';
      case 'orange': return 'text-orange-400 bg-orange-500/10';
      case 'red': return 'text-red-400 bg-red-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      {/* Header */}
      <header className="px-10 py-10 bg-background-dark border-b border-border-dark">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-white text-4xl font-black tracking-tighter">경쟁사 분석</h1>
            <p className="text-[#9da6b9] text-base font-normal max-w-2xl">
              {data 
                ? `${formatNumber(data.summary.total_companies)}개 업체의 ${formatNumber(data.summary.total_bids)}건 낙찰 데이터 분석`
                : '상위 낙찰업체 현황과 경쟁 강도를 분석합니다.'}
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[450px]">
            <div className="bg-surface-dark border border-border-dark rounded-xl flex items-stretch overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <div className="flex items-center pl-4 text-[#9da6b9]">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="w-full bg-transparent border-none text-white text-sm py-4 px-4 focus:ring-0 placeholder:text-slate-500" 
                placeholder="발주기관명으로 검색 (예: 교육청, 경찰청)" 
                value={institutionFilter}
                onChange={(e) => setInstitutionFilter(e.target.value)}
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

        {/* Summary Stats */}
        {data && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-[#9da6b9] text-sm font-bold">총 낙찰업체</p>
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">corporate_fare</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight">{formatNumber(data.summary.total_companies)}</span>
                <span className="text-[#9da6b9] text-sm">개사</span>
              </div>
            </div>

            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-[#9da6b9] text-sm font-bold">총 낙찰건수</p>
                <span className="material-symbols-outlined text-blue-400 bg-blue-400/10 p-2 rounded-xl">description</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight">{formatNumber(data.summary.total_bids)}</span>
                <span className="text-[#9da6b9] text-sm">건</span>
              </div>
            </div>

            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-[#9da6b9] text-sm font-bold">총 낙찰금액</p>
                <span className="material-symbols-outlined text-purple-400 bg-purple-400/10 p-2 rounded-xl">payments</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight">{formatAmount(data.summary.total_amount)}</span>
                <span className="text-[#9da6b9] text-sm">원</span>
              </div>
            </div>

            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-slate-600 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-[#9da6b9] text-sm font-bold">경쟁 강도</p>
                <span className="material-symbols-outlined text-orange-400 bg-orange-400/10 p-2 rounded-xl">speed</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-black px-3 py-1 rounded-lg ${getIntensityColor(data.summary.competition_intensity.color)}`}>
                  {data.summary.competition_intensity.level}
                </span>
              </div>
              <p className="text-xs text-[#9da6b9]">평균 {data.summary.avg_participants.toFixed(1)}개 업체 참여</p>
            </div>
          </section>
        )}

        {/* Main Content */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top 10 Chart */}
            <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
              <h3 className="text-white font-black text-xl mb-6">낙찰 건수 TOP 10</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#282e39" horizontal={true} vertical={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 11 }} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e2330', border: '1px solid #282e39', borderRadius: '12px' }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}건 (평균 ${props.payload.rate?.toFixed(1)}%)`,
                        props.payload.fullName
                      ]}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {getChartData().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#135bec' : index < 3 ? '#60a5fa' : '#135bec44'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Selected Company Detail */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
              <h3 className="text-white font-black text-xl mb-6">업체 상세 정보</h3>
              {selectedCompany ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">업체명</p>
                    <p className="text-white text-lg font-bold">{selectedCompany.company_name}</p>
                    <p className="text-[#9da6b9] text-sm">{selectedCompany.bizno}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background-dark rounded-xl p-4">
                      <p className="text-[#9da6b9] text-xs mb-1">낙찰 건수</p>
                      <p className="text-white text-2xl font-black">{selectedCompany.win_count}건</p>
                    </div>
                    <div className="bg-background-dark rounded-xl p-4">
                      <p className="text-[#9da6b9] text-xs mb-1">총 낙찰금액</p>
                      <p className="text-white text-2xl font-black">{formatAmount(selectedCompany.total_amount)}</p>
                    </div>
                    <div className="bg-background-dark rounded-xl p-4">
                      <p className="text-[#9da6b9] text-xs mb-1">평균 낙찰률</p>
                      <p className="text-primary text-2xl font-black">{selectedCompany.avg_rate.toFixed(2)}%</p>
                    </div>
                    <div className="bg-background-dark rounded-xl p-4">
                      <p className="text-[#9da6b9] text-xs mb-1">평균 경쟁</p>
                      <p className="text-white text-2xl font-black">{selectedCompany.avg_participants.toFixed(0)}개</p>
                    </div>
                  </div>

                  <div className="bg-background-dark rounded-xl p-4">
                    <p className="text-[#9da6b9] text-xs mb-2">낙찰률 범위</p>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{selectedCompany.min_rate.toFixed(1)}%</span>
                      <div className="flex-1 h-2 bg-surface-dark rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full"
                          style={{ 
                            marginLeft: `${selectedCompany.min_rate - 80}%`,
                            width: `${selectedCompany.max_rate - selectedCompany.min_rate}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-mono">{selectedCompany.max_rate.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <p className="text-xs text-[#9da6b9] font-bold uppercase tracking-widest mb-2">AI 분석</p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      이 업체는 평균 <span className="text-primary font-bold">{selectedCompany.avg_rate.toFixed(1)}%</span> 투찰률로 
                      <span className="text-white font-bold"> {selectedCompany.win_count}건</span>을 낙찰받았습니다.
                      {selectedCompany.avg_participants < 10 
                        ? ' 경쟁이 적은 입찰에 주로 참여하는 패턴입니다.'
                        : ' 경쟁이 치열한 입찰에서도 강한 경쟁력을 보입니다.'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[#9da6b9]">업체를 선택하세요</p>
              )}
            </div>
          </div>
        )}

        {/* Competitors Table */}
        {data && (
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
            <h3 className="text-white font-black text-xl mb-6">상위 낙찰업체 목록</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-[#9da6b9] uppercase font-black bg-background-dark border-b border-border-dark">
                  <tr>
                    <th className="px-4 py-4">순위</th>
                    <th className="px-4 py-4">업체명</th>
                    <th className="px-4 py-4 text-right">낙찰건수</th>
                    <th className="px-4 py-4 text-right">총 낙찰금액</th>
                    <th className="px-4 py-4 text-right">평균금액</th>
                    <th className="px-4 py-4 text-center">평균 낙찰률</th>
                    <th className="px-4 py-4 text-center">평균 경쟁</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.competitors.map((company, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedCompany?.bizno === company.bizno ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black
                          ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                            idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                            idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/5 text-[#9da6b9]'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-white">{company.company_name}</p>
                        <p className="text-xs text-[#9da6b9]">{company.bizno}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-white font-bold">{company.win_count}건</td>
                      <td className="px-4 py-4 text-right font-mono text-slate-300">{formatAmount(company.total_amount)}</td>
                      <td className="px-4 py-4 text-right font-mono text-[#9da6b9]">{formatAmount(company.avg_amount)}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-primary font-mono font-bold">{company.avg_rate.toFixed(2)}%</span>
                      </td>
                      <td className="px-4 py-4 text-center text-[#9da6b9]">{company.avg_participants.toFixed(0)}개</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">autorenew</span>
              <p className="text-[#9da6b9] mt-4">데이터를 불러오는 중...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
