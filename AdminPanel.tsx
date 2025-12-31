
import React, { useState, useEffect, useMemo } from 'react';
import { SwimmingClass, Category } from '../types';

interface ReservationRecord {
  timestamp: string;
  studentFullName: string;
  dni: string;
  responsibleAdult: string;
  phone: string;
  email: string;
  classLevel: string;
  classTime: string;
  classCategory: string;
}

interface AdminPanelProps {
  onClose: () => void;
  currentClasses: SwimmingClass[];
  onUpdateClasses: (newClasses: SwimmingClass[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, currentClasses, onUpdateClasses }) => {
  const [accessId, setAccessId] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [view, setView] = useState<'records' | 'inventory'>('records');
  const [records, setRecords] = useState<ReservationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Estados para inventario
  const [tempClasses, setTempClasses] = useState<SwimmingClass[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados para la verificación de descarga
  const [showDownloadVerify, setShowDownloadVerify] = useState(false);
  const [downloadPin, setDownloadPin] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const SECURITY_ID = '31913637';
  const DOWNLOAD_PIN = '2060'; 

  useEffect(() => {
    if (isAuthorized) {
      loadRecords();
      setTempClasses([...currentClasses]);
    }
  }, [isAuthorized, currentClasses]);

  const loadRecords = () => {
    const saved = localStorage.getItem('obras_paraguay_reservations');
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      setRecords([]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessId === SECURITY_ID) {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('ID de acceso incorrecto');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.studentFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.dni.includes(searchTerm) ||
      r.responsibleAdult.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  const handleSlotChange = (classId: string, newValue: number) => {
    setTempClasses(prev => prev.map(c => 
      c.id === classId ? { ...c, remainingSlots: Math.max(0, newValue) } : c
    ));
  };

  const handleSaveInventory = () => {
    onUpdateClasses(tempClasses);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const executeDownload = () => {
    if (records.length === 0) return;

    const headers = ["Fecha Registro", "Alumno/a", "DNI", "Adulto Responsable", "WhatsApp / Teléfono", "Email", "Categoría", "Nivel de Clase", "Horario"];
    
    const rows = records.map(r => [
      new Date(r.timestamp).toLocaleString('es-AR'),
      r.studentFullName,
      r.dni,
      r.responsibleAdult,
      r.phone,
      r.email || 'No provisto',
      r.classCategory,
      r.classLevel,
      r.classTime
    ]);

    const CSV_BOM = "\uFEFF";
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([CSV_BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reservas_natacion_obras_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowDownloadVerify(false);
    setDownloadPin('');
    setDownloadError('');
  };

  const handleClearHistory = () => {
    if (window.confirm('¿ESTÁ SEGURO? Esta acción eliminará permanentemente todos los registros actuales de la base de datos local.')) {
      localStorage.removeItem('obras_paraguay_reservations');
      setRecords([]);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (downloadPin === DOWNLOAD_PIN) {
      executeDownload();
    } else {
      setDownloadError('PIN de descarga incorrecto');
      setDownloadPin('');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] w-full max-w-sm p-12 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
          <div className="text-center mb-10">
            <div className="bg-blue-600 text-white w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30 transform -rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Panel de Gestión</h2>
            <p className="text-slate-400 text-sm mt-3 font-medium">Sede Paraguay 2060, CABA</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                placeholder="ID DE SEGURIDAD"
                className={`w-full bg-slate-50 border-2 ${error ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} rounded-2xl px-6 py-5 text-center text-2xl font-black tracking-[0.4em] outline-none transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-slate-300 placeholder:text-xs`}
                value={accessId}
                onChange={e => setAccessId(e.target.value)}
                autoFocus
              />
              {error && <p className="text-red-500 text-[10px] mt-4 text-center font-black uppercase tracking-widest animate-bounce">{error}</p>}
            </div>
            <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 shadow-2xl shadow-blue-500/20 uppercase tracking-[0.2em] text-xs">
              Acceder al Sistema
            </button>
            <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold py-2 text-xs hover:text-slate-600 transition-colors uppercase tracking-widest">
              Volver a la web
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Header Administrativo */}
      <header className="bg-white border-b border-slate-200 px-10 py-6 flex flex-col lg:flex-row justify-between items-center gap-6 shadow-sm z-10">
        <div className="flex items-center gap-5">
          <div className="bg-blue-600 text-white p-4 rounded-3xl shadow-xl shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-slate-900 text-2xl tracking-tighter leading-none mb-2">
              {view === 'records' ? 'Registro de Reservas' : 'Gestión de Cupos'}
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => setView('records')}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${view === 'records' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    Registros
                </button>
                <button 
                    onClick={() => setView('inventory')}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${view === 'inventory' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    Cupos Disponibles
                </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
          {view === 'records' ? (
            <>
              <div className="relative flex-1 sm:w-80">
                <input 
                  type="text"
                  placeholder="Buscar alumno o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold placeholder:text-slate-400"
                />
                <svg className="absolute left-4 top-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>

              <button 
                onClick={() => setShowDownloadVerify(true)}
                disabled={records.length === 0}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 transition-all ${
                  records.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-500/20'
                }`}
              >
                Excel
              </button>

              <button onClick={handleClearHistory} className="p-3.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </>
          ) : (
            <button 
                onClick={handleSaveInventory}
                className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95'}`}
            >
                {saveSuccess ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Guardado con éxito
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Guardar Disponibilidad
                    </>
                )}
            </button>
          )}

          <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>

          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-800 p-3.5 rounded-2xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-auto p-10 relative">
        {/* Modal PIN de Descarga */}
        {showDownloadVerify && (
          <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white border-2 border-slate-100 shadow-4xl rounded-[3.5rem] p-12 w-full max-w-sm text-center">
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">PIN Requerido</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10">Confirme para descargar el reporte</p>
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <input 
                  type="password"
                  value={downloadPin}
                  onChange={e => setDownloadPin(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-5 text-center text-4xl font-black tracking-[0.6em] outline-none"
                  autoFocus
                />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowDownloadVerify(false)} className="flex-1 font-bold text-slate-400 py-4">Cerrar</button>
                  <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl">Confirmar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'records' ? (
          /* VISTA DE REGISTROS (TABLA) */
          filteredRecords.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
               <p className="text-2xl font-black tracking-tighter">Sin registros de reservas</p>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumno/a</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Clase</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r, i) => (
                    <tr key={i} className="group hover:bg-blue-50/40 transition-all">
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-800 leading-tight">{r.studentFullName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">DNI {r.dni}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-center">
                        <div className="inline-flex flex-col bg-white border border-slate-200 rounded-2xl px-4 py-2">
                           <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-0.5">{r.classCategory}</span>
                           <span className="text-xs font-bold text-slate-800">{r.classLevel} ({r.classTime})</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{r.responsibleAdult}</span>
                          <span className="text-xs font-bold text-emerald-600">{r.phone}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                         <span className="text-xs font-black text-slate-800">{new Date(r.timestamp).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* VISTA DE INVENTARIO (GESTIÓN DE CUPOS) */
          <div className="space-y-12">
            {[Category.KIDS, Category.ADULTS, Category.ACUAGYM].map(category => (
                <div key={category}>
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{category}</h3>
                        <div className="h-[2px] bg-slate-200 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tempClasses.filter(c => c.category === category).map(c => (
                            <div key={c.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
                                <div className="mb-6">
                                    <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">{c.level}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.time}</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cupos Disponibles</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="number"
                                            value={c.remainingSlots}
                                            onChange={(e) => handleSlotChange(c.id, parseInt(e.target.value) || 0)}
                                            className={`w-full bg-slate-50 border-2 rounded-2xl px-4 py-4 text-2xl font-black text-center transition-all ${c.remainingSlots === 0 ? 'border-red-100 text-red-600 focus:border-red-400 focus:ring-red-50' : 'border-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
                                        />
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-slate-300 uppercase leading-none">de</span>
                                            <span className="text-sm font-black text-slate-400">{c.capacity}</span>
                                        </div>
                                    </div>
                                    {c.remainingSlots === 0 && (
                                        <div className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl text-center border border-red-100 animate-pulse">
                                            Clase Llena
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
