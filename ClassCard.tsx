
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
    <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full group border-b-8 border-b-blue-600/10">
      <div className={`h-3 w-full transition-colors duration-500 ${swimmingClass.category === Category.KIDS ? 'bg-cyan-400 group-hover:bg-cyan-500' : 'bg-blue-600 group-hover:bg-blue-700'}`}></div>
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 text-left">
            <div className="flex flex-wrap gap-2.5 mb-4">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl ${
                swimmingClass.category === Category.KIDS ? 'bg-cyan-50 text-cyan-700' : 'bg-blue-50 text-blue-700'
              }`}>
                {swimmingClass.category}
              </span>
              {swimmingClass.ageRange && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl bg-slate-100 text-slate-500">
                  {swimmingClass.ageRange}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-[1.1] tracking-tighter">{swimmingClass.level}</h3>
          </div>
        </div>

        <div className="space-y-5 mb-10 flex-1">
          <div className="flex items-start gap-4 text-slate-600 group/item">
            <div className="mt-1 text-blue-500 transition-transform group-hover/item:scale-110"><ICONS.Calendar /></div>
            <span className="text-sm font-bold tracking-tight">{swimmingClass.days.join(', ')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 group/item">
            <div className="text-blue-500 transition-transform group-hover/item:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c.6.5 1.2 1 2.5 1 3 0 3-2 5.5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 3 0 3-2 5.5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
            </div>
            <span className="text-sm font-bold tracking-tight">{swimmingClass.time}</span>
          </div>
          
          {/* Solo mostramos la información del profesor si NO es la categoría Niños */}
          {swimmingClass.category !== Category.KIDS && (
            <div className="flex items-center gap-4 text-slate-600 group/item">
              <div className="text-xl transition-transform group-hover/item:scale-110 select-none">
                👨‍🏫👩‍🏫
              </div>
              <span className="text-sm font-bold tracking-tight">Prof: {swimmingClass.instructor}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-slate-100">
          <div className="flex flex-col text-left">
            <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
              {isFull ? 'Cupos Agotados' : `${swimmingClass.remainingSlots} disponibles`}
            </span>
            <div className="w-24 h-2.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden border border-slate-50">
              <div 
                className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-400' : 'bg-emerald-500'}`}
                style={{ width: `${(swimmingClass.capacity - swimmingClass.remainingSlots) / swimmingClass.capacity * 100}%` }}
              ></div>
            </div>
          </div>
          
          <button 
            disabled={isFull}
            onClick={() => onBook(swimmingClass.id)}
            className={`px-8 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              isFull 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-slate-900 hover:shadow-2xl active:scale-95 shadow-xl shadow-blue-500/20'
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
