
import React, { useState, useMemo, useEffect } from 'react';
import { Category, SwimmingClass } from './types';
import { CLASSES_DATA, ICONS } from './constants';
import ClassCard from './components/ClassCard';
import ReservationForm from './components/ReservationForm';
import AdminPanel from './components/AdminPanel';
import ReglamentoModal from './components/ReglamentoModal';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>(Category.KIDS);
  const [activeLevel, setActiveLevel] = useState<string>('Todos');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showReglamento, setShowReglamento] = useState(false);
  
  const [classes, setClasses] = useState<SwimmingClass[]>([]);

  useEffect(() => {
    const savedClasses = localStorage.getItem('obras_paraguay_classes');
    if (savedClasses) {
      try {
        setClasses(JSON.parse(savedClasses));
      } catch (e) {
        setClasses(CLASSES_DATA);
      }
    } else {
      setClasses(CLASSES_DATA);
    }
  }, []);

  useEffect(() => {
    setActiveLevel('Todos');
  }, [activeTab]);

  const availableLevels = useMemo(() => {
    const levels = Array.from(new Set(classes.filter(c => c.category === activeTab).map(c => c.level)));
    return ['Todos', ...levels];
  }, [activeTab, classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const categoryMatch = c.category === activeTab;
      const levelMatch = activeLevel === 'Todos' || c.level === activeLevel;
      return categoryMatch && levelMatch;
    });
  }, [activeTab, activeLevel, classes]);

  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId);
  }, [selectedClassId, classes]);

  const handleBookingSubmit = (userData: any) => {
    if (!selectedClass) return;

    const updatedClasses = classes.map(c => {
      if (c.id === selectedClass.id) {
        return {
          ...c,
          remainingSlots: Math.max(0, c.remainingSlots - 1)
        };
      }
      return c;
    });

    setClasses(updatedClasses);
    localStorage.setItem('obras_paraguay_classes', JSON.stringify(updatedClasses));

    const newRecord = {
      timestamp: new Date().toISOString(),
      ...userData,
      classId: selectedClass.id,
      classLevel: selectedClass.level,
      classTime: selectedClass.time,
      classDays: selectedClass.days.join(', '), // Guardamos los días para el reporte
      classCategory: selectedClass.category
    };

    const existingRecords = JSON.parse(localStorage.getItem('obras_paraguay_reservations') || '[]');
    const updatedRecords = [newRecord, ...existingRecords];
    localStorage.setItem('obras_paraguay_reservations', JSON.stringify(updatedRecords));
    
    setSelectedClassId(null);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 8000);
  };

  const handleUpdateClassesFromAdmin = (newClasses: SwimmingClass[]) => {
    setClasses(newClasses);
    localStorage.setItem('obras_paraguay_classes', JSON.stringify(newClasses));
  };

  const MAP_URL = "https://www.google.com/maps/search/?api=1&query=Paraguay+2060,+CABA";

  return (
    <div className="min-h-screen relative font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Background Image Container */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1519315530759-390442373323?q=80&w=1920" 
          alt="Pileta con andariveles" 
          className="w-full h-full object-cover opacity-20 grayscale-[0.3]"
        />
        <div className="absolute inset-0 bg-slate-50/85"></div>
      </div>

      {/* Top Navbar - Mobile Optimized */}
      <nav className="fixed top-0 left-0 w-full z-[40] px-4 sm:px-6 py-4 flex justify-between items-center max-w-7xl mx-auto right-0 bg-white/70 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-b border-slate-200 sm:border-none">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="bg-blue-600 text-white sm:bg-blue-600/20 sm:backdrop-blur-md p-2 rounded-xl sm:text-blue-900 sm:border sm:border-blue-900/10 group-hover:scale-110 transition-transform">
            <ICONS.Waves />
          </div>
          <span className="text-slate-900 font-black text-lg sm:text-xl tracking-tighter">Obras Paraguay</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            <a 
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
                Sede CABA
            </a>
            <button 
              onClick={() => setShowAdmin(true)}
              className="bg-slate-900 text-white sm:bg-slate-900/10 sm:backdrop-blur-md sm:text-slate-900 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3 transition-all border border-slate-900/10 active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              <span className="hidden xs:inline">Admin</span>
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[500px] sm:h-[640px] flex items-center overflow-hidden bg-blue-900 pt-20 sm:pt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-800 to-slate-900 z-10 opacity-90"></div>
        <div className="container mx-auto px-6 relative z-20 text-white py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                <ICONS.Waves />
              </div>
              <span className="font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase drop-shadow-md opacity-90">Sede Paraguay 2060, CABA</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 sm:mb-8 leading-[0.95] tracking-tighter drop-shadow-2xl animate-in fade-in slide-in-from-left-6 duration-1000">
              Potenciamos tu <br/>
              <span className="text-blue-300">bienestar</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-50 font-medium leading-relaxed max-w-xl mb-8 sm:mb-10 opacity-95 drop-shadow-md animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
              Entrená en nuestra pileta semi-olímpica climatizada. Técnica profesional para todas las edades.
            </p>
            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <button 
                  onClick={() => document.getElementById('grid-horarios')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
                >
                    Ver Horarios
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 -mt-12 sm:-mt-24 relative z-30">
        {/* Tabs - Mobile Responsive Container */}
        <div className="bg-white/90 backdrop-blur-2xl p-2 sm:p-2.5 rounded-[2rem] sm:rounded-[2.5rem] shadow-3xl flex flex-col sm:flex-row gap-2 max-w-full sm:max-w-fit mx-auto mb-10 border border-white/50 overflow-hidden">
          {[
            { id: Category.KIDS, label: 'Niños', icon: <ICONS.Users /> },
            { id: Category.ADULTS, label: 'Adultos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg> },
            { id: Category.ACUAGYM, label: 'Acuagym', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-4 0-8 .5-8 4v10c0 3.5 4 4 8 4s8-.5 8-4V6c0-3.5-4-4-8-4z"/><path d="M12 18s-6-1.5-6-4"/><path d="M12 14s-6-1.5-6-4"/><path d="M12 10s-6-1.5-6-4"/></svg> }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Category)}
              className={`px-6 py-4 sm:px-10 sm:py-6 rounded-[1.4rem] sm:rounded-[1.8rem] font-black transition-all flex items-center justify-center gap-3 sm:gap-4 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-[1.02] sm:scale-105' 
                  : 'text-slate-500 hover:bg-white/60'
              }`}
            >
              {tab.icon}
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Level Filters - Scrollable on mobile */}
        <div className="flex overflow-x-auto sm:flex-wrap justify-start sm:justify-center gap-3 mb-12 sm:mb-20 pb-4 sm:pb-0 no-scrollbar">
          {availableLevels.map(level => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`whitespace-nowrap px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 flex-shrink-0 ${
                activeLevel === level
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                  : 'bg-white/70 backdrop-blur-md text-slate-500 border-white/80 hover:border-blue-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Info Grid */}
        <section id="grid-horarios" className="mb-24 sm:mb-40 text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tighter">Reserva tu Vacante</h2>
            <p className="text-slate-600 mb-12 sm:mb-16 max-w-2xl mx-auto font-medium text-base sm:text-lg px-4">Elegí tu nivel y horario preferido. Las vacantes se actualizan en tiempo real.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 min-h-[300px]">
              {filteredClasses.length > 0 ? (
                filteredClasses.map(c => (
                  <ClassCard key={c.id} swimmingClass={c} onBook={setSelectedClassId} />
                ))
              ) : (
                <div className="col-span-full py-20 sm:py-32 bg-white/40 backdrop-blur-md rounded-[2.5rem] sm:rounded-[4rem] border-4 border-dashed border-white/60 text-slate-400 font-bold flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-20"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  No hay clases que coincidan con los filtros.
                </div>
              )}
            </div>
        </section>

        {/* Benefits Section - Stacked on Mobile */}
        <section className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-12 lg:p-24 text-white shadow-4xl overflow-hidden relative border border-white/10 mb-24 sm:mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-24 items-center">
            <div className="relative z-10 text-left">
              <h2 className="text-4xl sm:text-6xl font-black mb-8 sm:mb-12 leading-tight tracking-tighter">Entrenamiento Sin Límites</h2>
              <div className="space-y-8 sm:space-y-12">
                {[
                  { title: "Técnica Profesional", desc: "Perfeccioná tus estilos con seguimiento personalizado de expertos." },
                  { title: "Sede Paraguay 2060", desc: "Instalaciones de primer nivel en Recoleta/CABA." },
                  { title: "Comunidad Obras", desc: "Formá parte de un club histórico dedicado a la excelencia." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-8 group">
                    <div className="bg-blue-600/30 p-4 rounded-2xl h-fit shrink-0 group-hover:bg-blue-600 transition-all border border-blue-400/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <h4 className="font-black text-xl sm:text-2xl mb-2 tracking-tight">{item.title}</h4>
                      <p className="text-blue-100/70 font-medium leading-relaxed text-sm sm:text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden shadow-5xl aspect-video lg:aspect-auto lg:h-[600px] hidden sm:block">
              <img src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=1000" alt="Pileta" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Optimized */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/95 backdrop-blur-xl py-12 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 sm:gap-16 text-center sm:text-left">
            <div className="flex items-center gap-4 sm:gap-6">
               <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl">
                  <ICONS.Waves />
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="font-black text-2xl sm:text-4xl text-slate-900 tracking-tighter">Obras Paraguay</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sede CABA</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <button onClick={() => setShowReglamento(true)} className="hover:text-blue-600 transition-all">Reglamento</button>
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-all">Ubicación</a>
              <button onClick={() => setShowAdmin(true)} className="hover:text-blue-600 transition-all">Gestión</button>
            </div>
            <div className="text-center sm:text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-loose">
                  © 2024 Escuela de Natación Obras Paraguay. <br/>
                  Buenos Aires, Argentina.
                </p>
            </div>
          </div>
        </div>
      </footer>

      <ChatBot />

      {selectedClass && (
        <ReservationForm 
          selectedClass={selectedClass} 
          onClose={() => setSelectedClassId(null)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {showConfirmation && (
        <div className="fixed top-20 sm:top-12 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-6 sm:px-12 sm:py-8 rounded-[2rem] sm:rounded-[3rem] shadow-5xl flex items-center gap-4 sm:gap-8 animate-in fade-in slide-in-from-top-12 duration-700 sm:max-w-xl border border-white/20">
          <div className="bg-white/20 p-3 rounded-xl shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="font-bold text-left">
            <p className="text-lg sm:text-2xl font-black tracking-tight">¡Pre-Reserva Exitosa!</p>
            <p className="text-xs sm:text-sm font-medium opacity-90 leading-tight mt-1">
              El cupo queda confirmado al abonar en recepción.
            </p>
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel 
          onClose={() => setShowAdmin(false)} 
          currentClasses={classes} 
          onUpdateClasses={handleUpdateClassesFromAdmin}
        />
      )}

      {showReglamento && (
        <ReglamentoModal onClose={() => setShowReglamento(false)} />
      )}
    </div>
  );
};

export default App;
