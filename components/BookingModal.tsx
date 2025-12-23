import React from 'react';
import { SwimClass, Teacher } from '../types';
import { X, Calendar, Clock, User, CheckCircle, Info, AlertCircle, Loader2 } from 'lucide-react';

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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-brand-600 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Confirmar Reserva</h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
            <img 
              src={teacher.photoUrl} 
              alt={teacher.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <h4 className="font-bold text-slate-900">{teacher.name}</h4>
              <p className="text-xs text-brand-600 font-medium">
                {teacher.specialty}
              </p>
            </div>
          </div>

          <div className="space-y-3 px-1">
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar size={18} className="text-brand-500" />
              <span className="font-medium">{selectedClass.day}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Clock size={18} className="text-brand-500" />
              <span className="font-medium">{selectedClass.time} hs</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700 text-sm">
              <User size={18} className="text-brand-500" />
              <span>Nivel: <span className="font-bold">{selectedClass.level}</span></span>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex gap-3 items-start">
             <Info className="text-brand-600 shrink-0 mt-0.5" size={18} />
             <p className="text-xs text-brand-800 text-left leading-relaxed">
               Al confirmar, tu lugar quedará reservado para el ciclo actual. Valor de la clase: Gs. <strong>{selectedClass.price.toLocaleString()}</strong>.
             </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-600 shrink-0" size={18} />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>Confirmar Reserva</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};