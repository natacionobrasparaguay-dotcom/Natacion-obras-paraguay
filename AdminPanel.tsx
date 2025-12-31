
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

  const SECURITY_ID = '31913637';

  useEffect(() => {
    if (isAuthorized) {
      const saved = localStorage.getItem('obras_paraguay_reservations');
      if (saved) {
        setRecords(JSON.parse(saved));
      }
    }
  }, [isAuthorized]);

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

  const downloadCSV = () => {
    if (records.length === 0) return;

    const headers = ["Fecha", "Alumno/a", "DNI", "Adulto Responsable", "Teléfono", "Email", "Categoría", "Nivel", "Horario"];
    const rows = records.map(r => [
      new Date(r.timestamp).toLocaleString(),
      r.studentFullName,
      r.dni,
      r.responsibleAdult,
      r.phone,
      r.email,
      r.classCategory,
      r.classLevel,
      r.classTime
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reservas_obras_paraguay_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Acceso Privado</h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">Solo personal autorizado de Obras Paraguay puede acceder a estos registros.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                placeholder="ID de Seguridad"
                className={`w-full bg-slate-50 border-2 ${error ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} rounded-2xl px-6 py-4 text-center text-xl font-black tracking-[0.5em] outline-none transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-slate-300`}
                value={accessId}
                onChange={e => setAccessId(e.target.value)}
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-3 text-center font-bold animate-bounce">{error}</p>}
            </div>
            <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-slate-200 uppercase tracking-widest text-sm">
              Desbloquear Sistema
            </button>
            <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold py-2 text-sm hover:text-slate-600 transition-colors">
              Volver al Inicio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-300">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
          </div>
          <div>
            <h2 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">Registro de Alumnos</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Base de Datos - Obras Paraguay</p>
          </div>
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            />
            <svg className="absolute left-3 top-2.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <button 
            onClick={downloadCSV}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Exportar CSV
          </button>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2.5 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="bg-slate-100 p-8 rounded-[3rem] mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>
            </div>
            <p className="text-2xl font-black tracking-tight text-slate-400">Sin reservas registradas</p>
            <p className="text-slate-400 text-sm mt-2">Los datos aparecerán aquí a medida que los clientes reserven.</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p className="text-xl font-bold">No se encontraron resultados para "{searchTerm}"</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Información Alumno</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">DNI</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Responsable & Contacto</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Clase Asignada</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r, i) => (
                    <tr key={i} className="group hover:bg-blue-50/50 transition-all even:bg-slate-50/30">
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-slate-800 leading-none mb-1 group-hover:text-blue-700 transition-colors">{r.studentFullName}</span>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50 w-fit px-1.5 py-0.5 rounded leading-none">{r.classCategory}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm text-slate-600 font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-lg">{r.dni}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 leading-none mb-1">{r.responsibleAdult}</span>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span className="text-xs font-medium">{r.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                          <span className="text-xs font-black text-slate-800 leading-none mb-1">{r.classLevel}</span>
                          <span className="text-[10px] font-bold text-slate-400">{r.classTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{new Date(r.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] font-medium text-slate-400">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Total de registros: {filteredRecords.length}</span>
              <span>Obras Paraguay - Sistema de Gestión</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
