
import React, { useState } from 'react';
import { SwimmingClass } from '../types';

interface ReservationFormProps {
  selectedClass: SwimmingClass;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ selectedClass, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    studentFullName: '',
    dni: '',
    phone: '',
    email: ''
  });

  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && !validateEmail(formData.email)) {
      setEmailError('Formato inválido.');
      return;
    }
    setEmailError('');
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        <div className="bg-blue-600 p-6 text-white shrink-0 relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/80 p-2 bg-white/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <h2 className="text-xl font-black tracking-tight">Pre-Reserva</h2>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">{selectedClass.category} • {selectedClass.level}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto no-scrollbar">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-xl">
            <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase tracking-tight">
              Abonar en recepción para confirmar vacante.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Nombre del Alumno/a</label>
              <input required type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" value={formData.studentFullName} onChange={e => setFormData({...formData, studentFullName: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">DNI del Alumno/a</label>
              <input required type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">WhatsApp / Teléfono</label>
              <input required type="tel" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Email (Opcional)</label>
              <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              {emailError && <p className="text-red-500 text-[9px] font-black mt-1">{emailError}</p>}
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">
              Confirmar Solicitud
            </button>
            <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-wider">
              Sistema de pre-inscripción Obras Paraguay
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
