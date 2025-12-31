
import React, { useState, useEffect, useMemo } from 'react';
import { SwimmingClass, Category } from '../types';

interface ReservationRecord {
  timestamp: string;
  studentFullName: string;
  dni: string;
  phone: string;
  email: string;
  classLevel: string;
  classTime: string;
  classDays?: string;
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
  
  const [tempClasses, setTempClasses] = useState<SwimmingClass[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const SECURITY_ID = '31913637';

  useEffect(() => {
    if (isAuthorized) {
      loadRecords();
      setTempClasses([...currentClasses]);
    }
  }, [isAuthorized, currentClasses]);

  const loadRecords = () => {
    const saved = localStorage.getItem('obras_paraguay_reservations');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        setRecords([]);
      }
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
      r.phone.includes(searchTerm)
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
    
    const headers = ["Fecha Registro", "Alumno/a", "DNI", "WhatsApp / Teléfono", "Email", "Categoría", "Nivel de Clase", "Horario", "Días"];
    
    const rows = records.map(r => [
      new Date(r.timestamp).toLocaleString('es-AR'),
      r.studentFullName,
      r.dni,
      r.phone,
      r.email || 'No provisto',
      r.classCategory,
      r.classLevel,
      r.classTime,
      r.classDays || 'No especificado'
    ]);

    const CSV_BOM = "\uFEFF";
    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob([CSV_BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_reservas_obras_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Deseas eliminar permanentemente todos los registros?')) {
      localStorage.removeItem('obras_paraguay_reservations');
      setRecords([]);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-sm p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 transform -rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Panel de Gestión</h2>
            <p className="text-slate-400 text-xs mt-2 font-medium">Acceso restringido Sede Paraguay</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <input
              type="password"
              placeholder="ID DE SEGURIDAD"
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl px-6 py-4 text-center text-xl font-black tracking-[0.4em] outline-none transition-all"
              value={accessId}
              onChange={e => setAccessId(e.target.value)}
              autoFocus
            />
            {error && <p className="text-red-500 text-[10px] text-center font-black uppercase tracking-widest">{error}</p>}
            <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[10px]">
              Ingresar
            </button>
            <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              Cancelar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-10 py-4 sm:py-6 flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6 shadow-sm z-10">
        <div className="flex items-center gap-3 sm:gap-5 w-full lg:w-auto">
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
          </div>
          <div className="flex flex-col flex-1">
            <h2 className="font-black text-slate-900 text-lg sm:text-2xl tracking-tighter leading-none mb-2">
              Gestión Obras
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => setView('records')}
                    className={`px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${view === 'records' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                    Registros
                </button>
                <button 
                    onClick={() => setView('inventory')}
                    className={`px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${view === 'inventory' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                    Cupos
                </button>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 p-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="flex flex-wrap w-full lg:w-auto gap-2 sm:gap-3 items-center">
          {view === 'records' ? (
            <>
              <div className="relative flex-1 sm:w-80">
                <input 
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 sm:py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                />
                <svg className="absolute left-3 top-2.5 sm:top-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <button onClick={executeDownload} disabled={records.length === 0} className="p-3 sm:px-6 sm:py-3.5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
              <button onClick={handleClearHistory} className="p-3 sm:p-3.5 bg-red-50 text-red-500 rounded-xl sm:rounded-2xl active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </>
          ) : (
            <button onClick={handleSaveInventory} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95">
                {saveSuccess ? 'Guardado' : 'Guardar Cupos'}
            </button>
          )}
          <button onClick={onClose} className="hidden lg:block text-slate-400 hover:bg-slate-100 p-3 rounded-2xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-10">
        {view === 'records' ? (
          filteredRecords.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
               <p className="text-xl font-black">Sin registros</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Alumno/a</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-center">Clase</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">WhatsApp</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50/40">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 leading-tight">{r.studentFullName}</span>
                          <span className="text-[9px] font-bold text-slate-400">DNI: {r.dni}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">{r.classLevel}</span>
                          <span className="text-[8px] font-medium text-slate-400 mt-1">{r.classTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-emerald-600">{r.phone}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <span className="text-[10px] font-bold text-slate-400">{new Date(r.timestamp).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="space-y-10 pb-20">
            {[Category.KIDS, Category.ADULTS, Category.ACUAGYM].map(category => (
                <div key={category}>
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-4">
                      {category}
                      <div className="h-[1px] bg-slate-200 flex-1"></div>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {tempClasses.filter(c => c.category === category).map(c => (
                            <div key={c.id} className="bg-white border-2 border-slate-100 rounded-2xl p-6">
                                <h4 className="font-black text-slate-800 text-sm mb-1">{c.level}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-4">{c.time}</p>
                                <input 
                                    type="number"
                                    value={c.remainingSlots}
                                    onChange={(e) => handleSlotChange(c.id, parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xl font-black text-center"
                                />
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
