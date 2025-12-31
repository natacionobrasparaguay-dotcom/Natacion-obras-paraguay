
import React from 'react';

interface ReglamentoModalProps {
  onClose: () => void;
}

const ReglamentoModal: React.FC<ReglamentoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <div className="bg-blue-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors bg-white/10 p-2 rounded-xl hover:bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-3 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-tight">Reglamento Interno</h2>
          </div>
          <p className="text-blue-100 font-medium">Normas y pautas de convivencia para alumnos de Obras Paraguay</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl h-fit shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Recuperación de Clases</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Se permite la recuperación de solo <b>una (1) clase al mes</b>.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-cyan-50 text-cyan-600 p-3 rounded-2xl h-fit shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 3 0 3-2 5.5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Indumentaria Obligatoria</h4>
                <p className="text-slate-500 text-sm leading-relaxed italic">Uso obligatorio: <b>Malla de natación, gorro, antiparras y ojotas.</b></p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-red-50 text-red-600 p-3 rounded-2xl h-fit shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Control de Faltas</h4>
                <p className="text-slate-500 text-sm leading-relaxed">A las <b>tres (3) faltas consecutivas</b> sin aviso previo, se pierde automáticamente la vacante.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl h-fit shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Puntualidad</h4>
                <p className="text-slate-500 text-sm leading-relaxed">No se permite el ingreso a la clase una vez <b>iniciada la misma</b>. Por favor, llegue 10 min antes.</p>
              </div>
            </div>

            <div className="flex gap-4 md:col-span-2">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl h-fit shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Autoridad</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Es obligatorio respetar estrictamente las indicaciones del <b>docente y guardavidas</b> del predio.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Avisos por Ausencia Excepcional
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              En caso de no poder concurrir, debe avisar al siguiente correo electrónico indicando nombre, apellido, DNI y horario:
            </p>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-blue-600 font-bold text-center select-all">natacionobrasparaguay@gmail.com</span>
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px]">
                <span className="font-bold bg-slate-100 px-2 py-1 rounded text-slate-400 uppercase">Nombre Completo</span>
                <span className="font-bold bg-slate-100 px-2 py-1 rounded text-slate-400 uppercase">DNI</span>
                <span className="font-bold bg-slate-100 px-2 py-1 rounded text-slate-400 uppercase">Día y Horario</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl text-blue-800">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
             <p className="text-xs font-bold leading-relaxed">Nota: Los feriados inamovibles no se recuperan.</p>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 uppercase tracking-widest text-xs"
          >
            He leído y acepto el reglamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReglamentoModal;
