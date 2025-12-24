
import React from 'react';

const BidSearch: React.FC = () => {
  const bids = [
    { type: '용역', typeColor: '#60a5fa', id: '202405-00123', title: '2024년 정보시스템 통합 유지관리 사업', agency: '서울특별시', price: '150,000,000', deadline: '2024.05.20', dday: 'D-5', status: '진행중', statusColor: '#22c55e' },
    { type: '물품', typeColor: '#a855f7', id: '202405-00156', title: '소방 안전 장비 구매 및 설치', agency: '경기도 소방재난본부', price: '45,000,000', deadline: '2024.05.22', dday: 'D-7', status: '진행중', statusColor: '#22c55e' },
    { type: '공사', typeColor: '#eab308', id: '202405-00089', title: '시민체육관 리모델링 공사 입찰 공고', agency: '부산광역시', price: '2,100,000,000', deadline: '2024.05.16', dday: '마감임박', status: '긴급', statusColor: '#ef4444', pulse: true },
    { type: '용역', typeColor: '#60a5fa', id: '202404-00992', title: '디지털 교과서 플랫폼 구축 사업 감리', agency: '교육부', price: '80,000,000', deadline: '2024.05.10', dday: '종료', status: '마감', statusColor: '#64748b' },
    { type: '물품', typeColor: '#a855f7', id: '202405-00210', title: '친환경 업무용 차량 임대 계약', agency: '환경부', price: '60,000,000', deadline: '2024.05.28', dday: 'D-13', status: '진행중', statusColor: '#22c55e' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      <header className="px-10 py-10 bg-background-dark border-b border-border-dark">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-2">
          <h1 className="text-white text-4xl font-black tracking-tighter">입찰 공고 검색</h1>
          <p className="text-[#9da6b9] text-base">세부 필터를 사용하여 조건에 맞는 공고를 찾아보세요.</p>
        </div>
      </header>

      <div className="p-10 space-y-10 max-w-[1200px] mx-auto w-full pb-20">
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-2">
              <label className="text-white text-sm font-bold block px-1">공고명 또는 공고번호</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9da6b9] material-symbols-outlined text-[20px]">search</span>
                <input className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 pl-12 pr-4 focus:ring-primary text-sm" placeholder="예: 202405..." />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-2">
              <label className="text-white text-sm font-bold block px-1">세부품명번호</label>
              <input className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 focus:ring-primary text-sm" placeholder="물품 식별 번호 입력" />
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">업종코드</label>
              <select className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 focus:ring-primary text-sm appearance-none">
                <option>업종 선택</option>
                <option>시설공사</option>
                <option>용역</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">참가제한지역</label>
              <select className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 focus:ring-primary text-sm appearance-none">
                <option>전국</option>
                <option>서울</option>
                <option>경기</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">추정가격 (최소)</label>
              <div className="relative">
                <input className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 text-right pr-10 text-sm font-mono" placeholder="0" />
                <span className="absolute right-4 top-3 text-[#9da6b9] text-sm">원</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm font-bold block px-1">추정가격 (최대)</label>
              <div className="relative">
                <input className="w-full bg-background-dark border-border-dark text-white rounded-xl py-3 px-4 text-right pr-10 text-sm font-mono" placeholder="금액 입력" />
                <span className="absolute right-4 top-3 text-[#9da6b9] text-sm">원</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button className="flex items-center gap-2 bg-surface-darker px-6 py-3 rounded-xl text-white text-sm font-bold border border-white/5 hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              초기화
            </button>
            <button className="flex items-center gap-2 bg-primary px-10 py-3 rounded-xl text-white text-sm font-bold shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all">
              <span className="material-symbols-outlined text-[18px]">search</span>
              검색하기
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <p className="text-white text-lg font-black tracking-tight">검색 결과 <span className="text-primary ml-1">1,240</span>건</p>
            <select className="bg-transparent border-none text-xs font-black text-[#9da6b9] uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-white">
              <option>등록일순</option>
              <option>마감일순</option>
            </select>
          </div>

          <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-background-dark/50 border-b border-border-dark">
                  <tr className="text-[10px] text-[#9da6b9] uppercase font-black">
                    <th className="py-5 px-6 w-24">구분</th>
                    <th className="py-5 px-6 w-32">공고번호</th>
                    <th className="py-5 px-6">공고명</th>
                    <th className="py-5 px-6 w-40">공고기관</th>
                    <th className="py-5 px-6 text-right w-40">추정가격</th>
                    <th className="py-5 px-6 w-32">입찰마감</th>
                    <th className="py-5 px-6 text-center w-24">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bids.map((bid, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black border uppercase tracking-tight" style={{ backgroundColor: `${bid.typeColor}15`, color: bid.typeColor, borderColor: `${bid.typeColor}20` }}>
                          {bid.type}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-xs text-[#9da6b9] font-mono">{bid.id}</td>
                      <td className="py-5 px-6">
                        <span className="text-white text-sm font-bold group-hover:text-primary transition-colors block truncate max-w-sm">{bid.title}</span>
                      </td>
                      <td className="py-5 px-6 text-xs text-[#9da6b9] font-medium">{bid.agency}</td>
                      <td className="py-5 px-6 text-right text-sm text-white font-mono font-bold tracking-tight">{bid.price}</td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs text-[#9da6b9]">{bid.deadline}</span>
                          <span className={`text-[10px] font-black uppercase ${bid.dday === '마감임박' ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>{bid.dday}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black" style={{ backgroundColor: `${bid.statusColor}15`, color: bid.statusColor }}>
                          {bid.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-background-dark/50 border-t border-border-dark flex items-center justify-between">
              <span className="text-xs text-[#9da6b9] font-medium">Showing <span className="text-white">1</span> to <span className="text-white">10</span> of <span className="text-white">1,240</span> results</span>
              <div className="flex gap-1">
                {[1, 2, 3, '...', 10].map((p, i) => (
                  <button key={i} className={`size-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${p === 1 ? 'bg-primary text-white' : 'text-[#9da6b9] hover:bg-white/5'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidSearch;
