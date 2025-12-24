
import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [notif, setNotif] = useState({ email: true, push: true, sms: false });

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark pb-20">
      <header className="px-6 md:px-10 py-10 bg-background-dark border-b border-border-dark">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-white text-4xl font-black tracking-tighter">시스템 설정</h1>
          <p className="text-[#9da6b9] text-base mt-2">사용자 프로필 및 알림 환경 설정을 관리합니다.</p>
        </div>
      </header>

      <div className="p-6 md:p-10 space-y-10 max-w-4xl mx-auto w-full">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="material-symbols-outlined text-primary">person</span>
            사용자 정보
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
            <div className="relative group">
              <div 
                className="size-24 rounded-full bg-center bg-cover border-4 border-background-dark shadow-xl"
                style={{ backgroundImage: `url('https://picsum.photos/200/200?random=1')` }}
              ></div>
              <button className="absolute bottom-0 right-0 size-8 bg-primary rounded-full flex items-center justify-center text-white border-2 border-background-dark shadow-lg">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9da6b9] font-black uppercase tracking-widest">이름</label>
                <input className="w-full bg-background-dark border-border-dark text-white rounded-xl py-2 px-4 focus:ring-primary" defaultValue="김담당 매니저" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#9da6b9] font-black uppercase tracking-widest">소속 부서</label>
                <input className="w-full bg-background-dark border-border-dark text-white rounded-xl py-2 px-4 focus:ring-primary" defaultValue="전략기획팀" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] text-[#9da6b9] font-black uppercase tracking-widest">이메일 주소</label>
                <input className="w-full bg-background-dark border-border-dark text-white rounded-xl py-2 px-4 focus:ring-primary" defaultValue="manager@procurepro.ai" />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="material-symbols-outlined text-primary">notifications</span>
            알림 설정
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-white font-bold">이메일 알림</p>
                  <p className="text-[#9da6b9] text-xs">주요 낙찰 소식 및 일간 리포트 전송</p>
                </div>
                <button 
                  onClick={() => setNotif({...notif, email: !notif.email})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${notif.email ? 'bg-primary' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${notif.email ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-white font-bold">푸시 알림</p>
                  <p className="text-[#9da6b9] text-xs">브라우저 실시간 긴급 공고 알림</p>
                </div>
                <button 
                  onClick={() => setNotif({...notif, push: !notif.push})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${notif.push ? 'bg-primary' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${notif.push ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-white font-bold">SMS 알림</p>
                  <p className="text-[#9da6b9] text-xs">입찰 마감 1시간 전 긴급 문자</p>
                </div>
                <button 
                  onClick={() => setNotif({...notif, sms: !notif.sms})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${notif.sms ? 'bg-primary' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${notif.sms ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="material-symbols-outlined text-primary">security</span>
            보안 및 데이터
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">API Access Key</p>
                <p className="text-[#9da6b9] text-xs font-mono">•••••••••••••••••••••</p>
              </div>
              <button className="text-primary text-xs font-bold hover:underline">새로 고침</button>
            </div>
            <div className="h-px bg-white/5"></div>
            <button className="text-red-500 text-sm font-bold flex items-center gap-2 self-start hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all">
              <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              계정 데이터 영구 삭제
            </button>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-10">
          <button className="px-8 py-3 rounded-xl bg-surface-dark text-white font-bold border border-white/5 hover:bg-white/5 transition-all">취소</button>
          <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all">설정 저장</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
