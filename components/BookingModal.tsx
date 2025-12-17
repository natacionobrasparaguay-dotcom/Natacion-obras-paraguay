import React from 'react';
import { SwimClass, Teacher } from '../types';
import { X, Calendar, Clock, User, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: SwimClass | null;
  teacher: Teacher | undefined;
  onConfirm: () => void;
  isProcessing: boolean;
  error?: string | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, onClose, selectedClass, teacher, onConfirm, isProcessing, error 
}) => {
  if (!isOpen || !selectedClass || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg">Solicitud de Reserva</h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <img 
              src={teacher.photoUrl} 
              alt={teacher.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-200"
            />
            <div>
              <p className="text-sm text-slate-500">Docente asignado</p>
              <h4 className="font-bold text-slate-900 text-lg">{teacher.name}</h4>
              <p className="text-xs text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-full inline-block mt-1">
                {teacher.specialty}
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar size={18} className="text-brand-500" />
              <span className="font-medium">{selectedClass.day}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Clock size={18} className="text-brand-500" />
              <span className="font-medium">{selectedClass.time} hs</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <User size={18} className="text-brand-500" />
              <span className="font-medium">{selectedClass.level}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 items-start">
             <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
             <p className="text-xs text-amber-800 text-left">
               <strong>Importante:</strong> La reserva no tiene costo establecido en esta etapa. La asignación del cupo se confirmará luego de corroborar el pago.
             </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-600 shrink-0" size={18} />
              <p className="text-sm text-red-700 font-medium">
                {error}
              </p>
            </div>
          )}

          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-brand-200 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <span className="animate-pulse">Procesando...</span>
            ) : (
              <>
                <CheckCircle size={20} />
                Solicitar Reserva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};