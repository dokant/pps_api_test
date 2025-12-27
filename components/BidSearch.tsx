import React, { useState, useEffect } from 'react';

interface BidResult {
  bid_no: string;
  bid_name: string;
  institution: string;
  winner: string;
  winner_bizno: string;
  amount: number;
  rate: number;
  participants: number;
  date: string;
  bid_type: string;
}

interface SearchResponse {
  success: boolean;
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
  statistics: {
    avg_rate: number;
    avg_amount: number;
    total_amount: number;
    avg_participants: number;
  } | null;
  results: BidResult[];
}

const BidSearch: React.FC = () => {
  // 검색 조건
  const [keyword, setKeyword] = useState('');
  const [institution, setInstitution] = useState('');
  const [company, setCompany] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  // 결과
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 20;

  // 초기 로드
  useEffect(() => {
    fetchData(0);
  }, []);

  // 검색 실행
  const fetchData = async (offset: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', LIMIT.toString());
      params.set('offset', offset.toString());

      if (keyword) params.set('keyword', keyword);
      if (institution) params.set('institution', institution);
      if (company) params.set('company', company);
      if (minAmount) params.set('min_amount', minAmount.replace(/,/g, ''));
      if (maxAmount) params.set('max_amount', maxAmount.replace(/,/g, ''));
      if (minRate) params.set('min_rate', minRate);
      if (maxRate) params.set('max_rate', maxRate);

      const res = await fetch(`/api/search?${params}`);
      const result: SearchResponse = await res.json();

      if (result.success) {
        setData(result);
      } else {
        setError('검색 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('API 호출 중 오류가 발생했습니다.');
      console.error(err);
    }

    setIsLoading(false);
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(0);
  };

  // 초기화
  const handleReset = () => {
    setKeyword('');
    setInstitution('');
    setCompany('');
    setMinAmount('');
    setMaxAmount('');
    setMinRate('');
    setMaxRate('');
    setCurrentPage(1);
    fetchData(0);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData((page - 1) * LIMIT);
  };

  // 숫자 포맷
  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);

  const formatAmount = (num: number) => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000) return `${(num / 10000).toFixed(0)}만`;
    return formatNumber(num);
  };

  // 입찰유형 색상
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'goods': return '#a855f7';
      case 'service': return '#60a5fa';
      case 'construction': return '#eab308';
      default: return '#9da6b9';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'goods': return '물품';
      case 'service': return '용역';
      case 'construction': return '공사';
      default: return type || '-';
    }
  };

  // 페이지네이션 계산
  const totalPages = data ? Math.ceil(data.total_count / LIMIT) : 0;
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      {/* Header */}
      <header className="px-10 py-10 bg-background-dark border-b border-border-dark">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-2">
          <h1 className="text-white text-4xl font-black tracking-tighter">입찰 정보 검색</h1>
          <p className="text-[#9da6b9] text-base">
            {data ? `총 ${formatNumber(data.total_count)}건의 낙찰 데이터에서 검색합니다.` : '과거 낙찰 정보를 검색합니다.'}
          </p>
        </div>
      </header>

      <div className="p-10 space-y-8 max-w-[1400px] mx-auto w-full pb-20">
        {/* 검색 필터 */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 공고명 */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-white text-sm font-bold block px-1">공고명</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9da6b9] material-symbols-outlined text-[20px]">search</span>
                <input 
                  className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 pl-12 pr-4 focus:ring-primary text-sm" 
                  placeholder="공고명 검색..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* 발주기관 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">발주기관</label>
              <input 
                className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 focus:ring-primary text-sm" 
                placeholder="기관명 입력"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>

            {/* 낙찰업체 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">낙찰업체</label>
              <input 
                className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 focus:ring-primary text-sm" 
                placeholder="업체명 입력"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* 최소금액 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">최소 낙찰금액</label>
              <div className="relative">
                <input 
                  className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 text-right pr-10 text-sm font-mono" 
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <span className="absolute right-4 top-3 text-[#9da6b9] text-sm">원</span>
              </div>
            </div>

            {/* 최대금액 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">최대 낙찰금액</label>
              <div className="relative">
                <input 
                  className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 text-right pr-10 text-sm font-mono" 
                  placeholder="금액 입력"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <span className="absolute right-4 top-3 text-[#9da6b9] text-sm">원</span>
              </div>
            </div>

            {/* 최소낙찰률 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">최소 낙찰률</label>
              <div className="relative">
                <input 
                  className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 text-right pr-10 text-sm font-mono" 
                  placeholder="0"
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                />
                <span className="absolute right-4 top-3 text-[#9da6b9] text-sm">%</span>
              </div>
            </div>

            {/* 최대낙찰률 */}
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">최대 낙찰률</label>
              <div className="relative">
                <input 
                  className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 text-right pr-10 text-sm font-mono" 
                  placeholder="100"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                />
                <span className="absolute right-4 top-3 text-[#9da6b9] text-sm">%</span>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 bg-surface-darker px-6 py-3 rounded-xl text-white text-sm font-bold border border-white/5 hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              초기화
            </button>
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary px-10 py-3 rounded-xl text-white text-sm font-bold shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all disabled:bg-slate-600"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'autorenew' : 'search'}
              </span>
              {isLoading ? '검색중...' : '검색하기'}
            </button>
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* 검색 통계 */}
        {data && data.statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
              <p className="text-[#9da6b9] text-xs mb-1">검색 결과</p>
              <p className="text-white text-xl font-black">{formatNumber(data.total_count)}건</p>
            </div>
            <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
              <p className="text-[#9da6b9] text-xs mb-1">평균 낙찰률</p>
              <p className="text-primary text-xl font-black">{data.statistics.avg_rate.toFixed(2)}%</p>
            </div>
            <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
              <p className="text-[#9da6b9] text-xs mb-1">평균 낙찰금액</p>
              <p className="text-white text-xl font-black">{formatAmount(data.statistics.avg_amount)}</p>
            </div>
            <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
              <p className="text-[#9da6b9] text-xs mb-1">평균 참가업체</p>
              <p className="text-white text-xl font-black">{data.statistics.avg_participants.toFixed(0)}개</p>
            </div>
          </div>
        )}

        {/* 결과 테이블 */}
        {data && (
          <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-background-dark/50 border-b border-border-dark">
                  <tr className="text-[10px] text-[#9da6b9] uppercase font-black">
                    <th className="py-4 px-4 w-20">구분</th>
                    <th className="py-4 px-4">공고명</th>
                    <th className="py-4 px-4 w-36">발주기관</th>
                    <th className="py-4 px-4 w-36">낙찰업체</th>
                    <th className="py-4 px-4 text-right w-28">낙찰금액</th>
                    <th className="py-4 px-4 text-center w-24">낙찰률</th>
                    <th className="py-4 px-4 text-center w-20">참가</th>
                    <th className="py-4 px-4 w-28">낙찰일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.results.map((bid, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black border uppercase tracking-tight"
                          style={{ 
                            backgroundColor: `${getTypeColor(bid.bid_type)}15`, 
                            color: getTypeColor(bid.bid_type), 
                            borderColor: `${getTypeColor(bid.bid_type)}20` 
                          }}
                        >
                          {getTypeLabel(bid.bid_type)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white text-sm font-bold block truncate max-w-xs" title={bid.bid_name}>
                          {bid.bid_name}
                        </span>
                        <span className="text-[#9da6b9] text-xs">{bid.bid_no}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#9da6b9] font-medium truncate max-w-[140px]" title={bid.institution}>
                        {bid.institution}
                      </td>
                      <td className="py-4 px-4 text-xs text-white truncate max-w-[140px]" title={bid.winner}>
                        {bid.winner}
                      </td>
                      <td className="py-4 px-4 text-right text-sm text-white font-mono font-bold">
                        {formatAmount(bid.amount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-primary font-mono font-bold">{bid.rate?.toFixed(2)}%</span>
                      </td>
                      <td className="py-4 px-4 text-center text-[#9da6b9]">
                        {bid.participants}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#9da6b9]">
                        {bid.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="p-6 bg-background-dark/50 border-t border-border-dark flex items-center justify-between">
              <span className="text-xs text-[#9da6b9] font-medium">
                Showing <span className="text-white">{((currentPage - 1) * LIMIT) + 1}</span> to <span className="text-white">{Math.min(currentPage * LIMIT, data.total_count)}</span> of <span className="text-white">{formatNumber(data.total_count)}</span> results
              </span>
              <div className="flex gap-1">
                {/* 이전 버튼 */}
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="size-8 flex items-center justify-center rounded-lg text-xs font-black text-[#9da6b9] hover:bg-white/5 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>

                {pageNumbers.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => typeof p === 'number' && handlePageChange(p)}
                    disabled={p === '...'}
                    className={`size-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                      p === currentPage 
                        ? 'bg-primary text-white' 
                        : p === '...' 
                          ? 'text-[#9da6b9] cursor-default' 
                          : 'text-[#9da6b9] hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* 다음 버튼 */}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="size-8 flex items-center justify-center rounded-lg text-xs font-black text-[#9da6b9] hover:bg-white/5 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidSearch;
