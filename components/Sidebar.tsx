import React, { useState } from 'react';
import { AcademicLevel, HistoryItem, BrandSettings } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: string[];
  activeModule: string;
  onModuleChange: (m: string) => void;
  activeLevel: AcademicLevel;
  onLevelChange: (l: AcademicLevel) => void;
  topic: string;
  onTopicChange: (t: string) => void;
  onClearCanvas: () => void;
  onToggleSettings: () => void;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onRenameHistory?: (id: string, newTitle: string) => void;
  brandSettings: BrandSettings;
  templates: any[];
  activeTemplate: any;
  onTemplateSelect: (t: any) => void;
  isSingleReadingText: boolean;
  onSingleReadingTextChange: (val: boolean) => void;
  isRelaxingBackgroundEnabled: boolean;
  onRelaxingBackgroundChange: (val: boolean) => void;
  onRandomizeBackground: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, onClose,
  activeModule, onModuleChange,
  activeLevel, onLevelChange,
  topic, onTopicChange,
  onClearCanvas, onToggleSettings,
  history, onLoadHistory, onDeleteHistory, onRenameHistory,
  brandSettings,
  templates, activeTemplate, onTemplateSelect,
  isSingleReadingText, onSingleReadingTextChange,
  isRelaxingBackgroundEnabled, onRelaxingBackgroundChange,
  onRandomizeBackground
}) => {
  const [editingHistId, setEditingHistId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const startRename = (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    setEditingHistId(item.id);
    setTempTitle(item.title);
  };

  const submitRename = (id: string) => {
    if (onRenameHistory && tempTitle.trim()) {
      onRenameHistory(id, tempTitle);
    }
    setEditingHistId(null);
  };

  return (
    <aside className={`w-[240px] bg-white h-full fixed left-0 top-0 text-slate-900 flex flex-col z-[110] border-r border-slate-200 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <i className="fa-solid fa-sparkles text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">Test Builder</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Version 2.0</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-100 hover:text-orange-600 transition-all"
            title="Hide Sidebar"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {['GRAMMAR', 'READING', 'VOCABULARY'].map(mod => (
            <button
              key={mod}
              onClick={() => onModuleChange(mod.charAt(0) + mod.slice(1).toLowerCase())}
              className={`flex-1 py-2 rounded-lg text-[9px] font-bold transition-all ${
                activeModule.toUpperCase() === mod 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {activeModule.toUpperCase() === 'READING' && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">One Reading Text for All Parts</span>
            <button 
              onClick={() => onSingleReadingTextChange(!isSingleReadingText)}
              className={`w-8 h-4 rounded-full transition-all relative ${isSingleReadingText ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isSingleReadingText ? 'left-[18px]' : 'left-[2px]'}`}></div>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Relaxing Background</span>
            <button 
              onClick={() => onRelaxingBackgroundChange(!isRelaxingBackgroundEnabled)}
              className={`w-8 h-4 rounded-full transition-all relative ${isRelaxingBackgroundEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isRelaxingBackgroundEnabled ? 'left-[18px]' : 'left-[2px]'}`}></div>
            </button>
          </div>
          {isRelaxingBackgroundEnabled && (
            <button 
              onClick={onRandomizeBackground}
              className="w-full py-2 bg-white text-emerald-600 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-shuffle"></i> Randomize Scene
            </button>
          )}
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 block px-1">Neural History</label>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
            {history.length === 0 && (
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center space-y-2">
                <i className="fa-solid fa-clock-rotate-left text-slate-200 text-xl"></i>
                <p className="text-[9px] font-bold text-slate-300 uppercase">No History Yet</p>
              </div>
            )}
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onLoadHistory(item)}
                className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  {editingHistId === item.id ? (
                    <input 
                      autoFocus
                      value={tempTitle}
                      onChange={e => setTempTitle(e.target.value)}
                      onBlur={() => submitRename(item.id)}
                      onKeyDown={e => e.key === 'Enter' && submitRename(item.id)}
                      className="text-[10px] font-black text-slate-900 uppercase bg-slate-50 border-none outline-none w-full"
                    />
                  ) : (
                    <span className="text-[10px] font-black text-slate-900 uppercase truncate pr-6">{item.title}</span>
                  )}
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => startRename(e, item)} className="h-6 w-6 bg-slate-50 text-slate-400 rounded-lg hover:text-orange-600"><i className="fa-solid fa-pen text-[8px]"></i></button>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.id); }} className="h-6 w-6 bg-slate-50 text-slate-400 rounded-lg hover:text-rose-600"><i className="fa-solid fa-trash text-[8px]"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100 space-y-4">
        <button 
          onClick={onToggleSettings}
          className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
        >
          <i className="fa-solid fa-gear"></i> Workspace Settings
        </button>
        <div className="flex items-center gap-2 text-slate-400">
          <div className="h-5 w-5 rounded-full border border-emerald-500 flex items-center justify-center">
            <i className="fa-solid fa-check text-[8px] text-emerald-500"></i>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">AI Engine Ready</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;