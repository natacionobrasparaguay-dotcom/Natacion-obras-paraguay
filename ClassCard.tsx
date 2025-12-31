
import React from 'react';
import { SwimmingClass, Category } from '../types';
import { ICONS } from '../constants';

interface ClassCardProps {
  swimmingClass: SwimmingClass;
  onBook: (id: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ swimmingClass, onBook }) => {
  const isFull = swimmingClass.remainingSlots === 0;
  
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      <div className={`h-2.5 w-full ${swimmingClass.category === Category.KIDS ? 'bg-cyan-400' : 'bg-blue-600'}`}></div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                swimmingClass.category === Category.KIDS ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {swimmingClass.category}
              </span>
              {swimmingClass.ageRange && (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600">
                  {swimmingClass.ageRange}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight">{swimmingClass.level}</h3>
          </div>
        </div>

        <div className="space-y-4 mb-8 flex-1">
          <div className="flex items-start gap-4 text-slate-600">
            <div className="mt-0.5 text-blue-500"><ICONS.Calendar /></div>
            <span className="text-sm font-bold">{swimmingClass.days.join(', ')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            {/* Ícono de Pileta/Agua reemplazando al reloj */}
            <div className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c.6.5 1.2 1 2.5 1 3 0 3-2 5.5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 3 0 3-2 5.5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
            </div>
            <span className="text-sm font-bold">{swimmingClass.time}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="text-sm font-bold">Prof: {swimmingClass.instructor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex flex-col">
            <span className={`text-[11px] font-black uppercase tracking-tighter ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
              {isFull ? 'Cupos Agotados' : `${swimmingClass.remainingSlots} lugares`}
            </span>
            <div className="w-20 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-50">
              <div 
                className={`h-full transition-all duration-700 ${isFull ? 'bg-red-400' : 'bg-emerald-500'}`}
                style={{ width: `${(swimmingClass.capacity - swimmingClass.remainingSlots) / swimmingClass.capacity * 100}%` }}
              ></div>
            </div>
          </div>
          
          <button 
            disabled={isFull}
            onClick={() => onBook(swimmingClass.id)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              isFull 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-slate-900 hover:shadow-xl active:scale-95 shadow-lg shadow-blue-500/20'
            }`}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
