
import React, { useState, useEffect, useMemo } from 'react';

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

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [accessId, setAccessId] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [records, setRecords] = useState<ReservationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Estados para la verificación de descarga
  const [showDownloadVerify, setShowDownloadVerify] = useState(false);
  const [downloadPin, setDownloadPin] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const SECURITY_ID = '31913637';
  const DOWNLOAD_PIN = '2060'; // Código para autorizar la descarga

  useEffect(() => {
    if (isAuthorized) {
      loadRecords();
    }
  }, [isAuthorized]);

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

  const executeDownload = () => {
    if (records.length === 0) return;

    const headers = ["Fecha Registro", "Alumno/a", "DNI", "Adulto Responsable", "WhatsApp / Teléfono", "Email", "Categoría", "Nivel de Clase", "Horario"];
    
    // Formatear filas para CSV
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

    // Generar contenido CSV con BOM para compatibilidad total con Excel (UTF-8)
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
    
    // Resetear estados del modal de PIN
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

  const handleDownloadAttempt = () => {
    if (records.length > 0) {
      setShowDownloadVerify(true);
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
          <div>
            <h2 className="font-black text-slate-900 text-2xl tracking-tighter leading-none mb-1">Registro de Reservas</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Sede Paraguay 2060 • Base de Datos Activa</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
          <div className="relative flex-1 sm:w-80">
            <input 
              type="text"
              placeholder="Buscar por nombre, DNI o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
            />
            <svg className="absolute left-4 top-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>

          <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>

          <button 
            onClick={handleDownloadAttempt}
            disabled={records.length === 0}
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 transition-all shadow-xl ${
              records.length === 0 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Descargar Excel
          </button>

          {records.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="p-3.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
              title="Limpiar base de datos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          )}

          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-800 p-3.5 rounded-2xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </header>

      {/* Área de Datos */}
      <div className="flex-1 overflow-auto p-10 relative">
        {/* Modal PIN de Descarga */}
        {showDownloadVerify && (
          <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white border-2 border-slate-100 shadow-4xl rounded-[3.5rem] p-12 w-full max-w-sm text-center transform scale-110">
              <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Autorizar Exportación</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.1em] mb-10">Ingrese el PIN de seguridad para continuar</p>
              
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <input 
                  type="password"
                  placeholder="PIN"
                  value={downloadPin}
                  onChange={e => setDownloadPin(e.target.value)}
                  className={`w-full bg-slate-50 border-2 ${downloadError ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'} rounded-2xl px-4 py-5 text-center text-4xl font-black tracking-[0.6em] outline-none transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-xs placeholder:text-slate-300`}
                  autoFocus
                />
                {downloadError && <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">{downloadError}</p>}
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowDownloadVerify(false); setDownloadPin(''); setDownloadError(''); }} 
                    className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all uppercase text-[10px] tracking-widest active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="bg-slate-100 p-12 rounded-[4rem] mb-10 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>
            </div>
            <p className="text-3xl font-black tracking-tighter text-slate-400">Base de datos vacía</p>
            <p className="text-slate-400 text-base mt-3 text-center max-w-sm font-medium leading-relaxed">No se han registrado pre-reservas en este dispositivo todavía.</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <p className="text-2xl font-black tracking-tight">Sin coincidencias para "{searchTerm}"</p>
            <button onClick={() => setSearchTerm('')} className="mt-6 text-blue-600 font-bold hover:underline">Ver todos los registros</button>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumno/a</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto Responsable</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Clase Asignada</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r, i) => (
                    <tr key={i} className="group hover:bg-blue-50/40 transition-all even:bg-slate-50/20">
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-700 transition-colors">{r.studentFullName}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest w-fit px-2 py-1 rounded-md leading-none ${
                            r.classCategory === 'Niños' ? 'bg-cyan-100 text-cyan-700' : 
                            r.classCategory === 'Adultos' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>{r.classCategory}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700 font-mono font-bold tracking-tighter">DNI {r.dni}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{r.email || 'Sin Email'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 leading-none mb-2">{r.responsibleAdult}</span>
                          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-xl border border-emerald-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span className="text-xs font-black tracking-tight">{r.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-center">
                        <div className="inline-flex flex-col items-center bg-white border border-slate-200 rounded-[1.25rem] px-5 py-2.5 shadow-sm group-hover:border-blue-200 group-hover:shadow-blue-100 transition-all">
                          <span className="text-xs font-black text-slate-900 leading-none mb-1.5">{r.classLevel}</span>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{r.classTime}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800">{new Date(r.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HS</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-10 py-6 border-t border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-4">
                <span>Total Registros: <span className="text-slate-900 font-black">{filteredRecords.length}</span></span>
                <span className="h-4 w-[1px] bg-slate-200"></span>
                <span>Alumnos Únicos: <span className="text-slate-900 font-black">{new Set(records.map(r => r.dni)).size}</span></span>
              </div>
              <span className="hidden sm:block">Gestión Sede Paraguay 2060 - Obras CABA</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
