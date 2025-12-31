
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
    responsibleAdult: '',
    phone: '',
    email: ''
  });

  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return true; // Email is optional
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.email && !validateEmail(formData.email)) {
      setEmailError('Por favor, ingresa un formato de correo electrónico válido.');
      return;
    }

    setEmailError('');
    onSubmit(formData);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (emailError) {
      if (validateEmail(value)) {
        setEmailError('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <h2 className="text-xl font-bold">Reserva de Vacante</h2>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-blue-100 text-sm font-medium">{selectedClass.category} - {selectedClass.level}</p>
            {selectedClass.ageRange && (
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Rango: {selectedClass.ageRange}</p>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
            <p className="text-xs text-amber-800 font-medium italic">
              * La reserva de cupo de clases se efectúa una vez abonado el pago en la recepción de la sede.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Nombre y Apellido del Alumno/a</label>
            <input
              required
              type="text"
              placeholder="Ej. Juan Carlos Pérez"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={formData.studentFullName}
              onChange={e => setFormData({...formData, studentFullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 tracking-tight">DNI del Alumno/a</label>
            <input
              required
              type="text"
              placeholder="Ej. 12.345.678"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={formData.dni}
              onChange={e => setFormData({...formData, dni: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Nombre y Apellido del Adulto Responsable</label>
            <input
              required
              type="text"
              placeholder="Ej. María García"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={formData.responsibleAdult}
              onChange={e => setFormData({...formData, responsibleAdult: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Teléfono de contacto (WhatsApp)</label>
              <input
                required
                type="tel"
                placeholder="+595 9XX XXX XXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 tracking-tight">Email (Opcional)</label>
            <input
              type="email"
              placeholder="tu@email.com"
              className={`w-full bg-slate-50 border ${emailError ? 'border-red-400 ring-2 ring-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'} rounded-xl px-4 py-2.5 outline-none transition-all text-sm`}
              value={formData.email}
              onChange={handleEmailChange}
            />
            {emailError && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{emailError}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Realizar Pre-Reserva
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
              Al completar este formulario, usted inicia la solicitud de vacante. <br/>
              <b>Recuerde:</b> El cupo se confirma únicamente al abonar el pago en la recepción.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
