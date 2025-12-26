import React, { useState } from 'react';
import { ViewType } from './types';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import InstitutionAnalysis from './components/InstitutionAnalysis';
import FailureAnalysis from './components/FailureAnalysis';
import BidSearch from './components/BidSearch';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case ViewType.DASHBOARD: return <Dashboard />;
      case ViewType.SIMULATOR: return <Simulator />;
      case ViewType.COMPETITOR: return <CompetitorAnalysis />;
      case ViewType.INSTITUTION: return <InstitutionAnalysis />;
      case ViewType.FAILURE_ANALYSIS: return <FailureAnalysis />;
      case ViewType.BID_ANALYSIS: return <BidSearch />;
      case ViewType.SETTINGS: return <Settings />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: ViewType.DASHBOARD, label: '대시보드 개요', icon: 'dashboard' },
    { id: ViewType.BID_ANALYSIS, label: '입찰 정보 검색', icon: 'search' },
    { id: ViewType.SIMULATOR, label: '투찰 시뮬레이터', icon: 'calculate' },
    { id: ViewType.COMPETITOR, label: '경쟁사 분석', icon: 'corporate_fare' },
    { id: ViewType.INSTITUTION, label: '기관별 패턴', icon: 'apartment' },
    { id: ViewType.FAILURE_ANALYSIS, label: '실패 원인 분석', icon: 'analytics' },
    { id: ViewType.SETTINGS, label: '설정', icon: 'settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden font-display">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-background-dark border-r border-white/5 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 flex items-center justify-center rounded-lg size-10 text-primary">
                <span className="material-symbols-outlined text-[24px]">gavel</span>
              </div>
              <div>
                <h1 className="text-white text-lg font-bold leading-tight">ProcurePro AI</h1>
                <p className="text-[#9da6b9] text-xs font-normal">공공조달 전략 시스템</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id
                    ? 'bg-primary/10 text-primary shadow-lg shadow-primary/5 font-bold'
                    : 'text-[#9da6b9] hover:bg-surface-dark/50 hover:text-white font-medium'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${currentView === item.id ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 px-2">
              <div
                className="size-10 rounded-full bg-center bg-cover border-2 border-surface-dark ring-2 ring-primary/20"
                style={{ backgroundImage: `url('https://picsum.photos/100/100?random=1')` }}
              ></div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-bold truncate">김담당 매니저</p>
                <p className="text-[#9da6b9] text-xs truncate">전략기획팀 (Premium)</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-background-dark border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">gavel</span>
            <span className="font-bold text-white">ProcurePro AI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
