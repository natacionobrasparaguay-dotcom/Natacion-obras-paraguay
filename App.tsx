
import React, { useState, useMemo, useEffect } from 'react';
import { Category, SwimmingClass } from './types';
import { CLASSES_DATA, ICONS } from './constants';
import ClassCard from './components/ClassCard';
import ReservationForm from './components/ReservationForm';
import ChatBot from './components/ChatBot';
import AdminPanel from './components/AdminPanel';
import ReglamentoModal from './components/ReglamentoModal';

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
        console.error("Error parsing saved classes, using defaults", e);
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
      classCategory: selectedClass.category
    };

    const existingRecords = JSON.parse(localStorage.getItem('obras_paraguay_reservations') || '[]');
    const updatedRecords = [newRecord, ...existingRecords];
    localStorage.setItem('obras_paraguay_reservations', JSON.stringify(updatedRecords));
    
    setSelectedClassId(null);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 6000);
  };

  return (
    <div className="min-h-screen relative font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background Image Container */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1590426466826-6997486e969d?q=80&w=1920" 
          alt="Background" 
          className="w-full h-full object-cover opacity-15 grayscale"
        />
        <div className="absolute inset-0 bg-slate-50/90"></div>
      </div>

      {/* Top Navbar with Admin Access */}
      <nav className="absolute top-0 left-0 w-full z-30 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="bg-blue-600/20 backdrop-blur-md p-2 rounded-xl text-blue-900 border border-blue-900/10 group-hover:scale-110 transition-transform">
            <ICONS.Waves />
          </div>
          <span className="text-slate-900 font-black text-xl tracking-tighter hidden sm:block">Obras Paraguay</span>
        </div>
        <button 
          onClick={() => setShowAdmin(true)}
          className="bg-slate-900/10 hover:bg-slate-900/20 backdrop-blur-md text-slate-900 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all border border-slate-900/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          Panel Admin
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[720px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-900/40 to-slate-900/80 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=1920" 
          alt="Nadador Profesional en Obras Paraguay" 
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ animation: 'slow-zoom 30s infinite alternate linear' }}
        />
        <style>
          {`
            @keyframes slow-zoom {
              from { transform: scale(1); }
              to { transform: scale(1.15); }
            }
          `}
        </style>
        <div className="container mx-auto px-6 relative z-20 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6 mt-16 sm:mt-0 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                <ICONS.Waves />
              </div>
              <span className="font-bold tracking-[0.25em] text-xs uppercase drop-shadow-md opacity-90">Sede Paraguay 2060, CABA</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl animate-in fade-in slide-in-from-left-6 duration-1000">
              Nadadores de <br/>
              <span className="text-blue-300">Alto Nivel</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 font-medium leading-relaxed max-w-xl mb-10 opacity-95 drop-shadow-md animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
              Entrená en nuestra pileta semi-olímpica climatizada. Técnica profesional para todas las edades en el corazón de Buenos Aires.
            </p>
            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <button 
                  onClick={() => document.getElementById('grid-horarios')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
                >
                    Ver Horarios
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 -mt-24 relative z-30">
        {/* Tabs - Categories */}
        <div className="bg-white/80 backdrop-blur-2xl p-2.5 rounded-[2.5rem] shadow-3xl flex flex-wrap gap-2.5 max-w-fit mx-auto mb-10 border border-white/50 justify-center">
          <button 
            onClick={() => setActiveTab(Category.KIDS)}
            className={`px-10 py-6 rounded-[1.8rem] font-black transition-all flex items-center gap-4 ${
              activeTab === Category.KIDS 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-105' 
                : 'text-slate-500 hover:bg-white/60'
            }`}
          >
            <ICONS.Users />
            Niños
          </button>
          <button 
            onClick={() => setActiveTab(Category.ADULTS)}
            className={`px-10 py-6 rounded-[1.8rem] font-black transition-all flex items-center gap-4 ${
              activeTab === Category.ADULTS 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-105' 
                : 'text-slate-500 hover:bg-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>
            Adultos
          </button>
          <button 
            onClick={() => setActiveTab(Category.ACUAGYM)}
            className={`px-10 py-6 rounded-[1.8rem] font-black transition-all flex items-center gap-4 ${
              activeTab === Category.ACUAGYM 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-105' 
                : 'text-slate-500 hover:bg-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-4 0-8 .5-8 4v10c0 3.5 4 4 8 4s8-.5 8-4V6c0-3.5-4-4-8-4z"/><path d="M12 18s-6-1.5-6-4"/><path d="M12 14s-6-1.5-6-4"/><path d="M12 10s-6-1.5-6-4"/></svg>
            Acuagym
          </button>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          {availableLevels.map(level => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all border-2 ${
                activeLevel === level
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xl'
                  : 'bg-white/60 backdrop-blur-md text-slate-500 border-white/80 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Info Grid */}
        <section id="grid-horarios" className="mb-40 text-center">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Reserva tu Vacante</h2>
            <p className="text-slate-600 mb-16 max-w-2xl mx-auto font-medium text-lg">Elegí tu nivel y horario preferido. Las vacantes se actualizan en tiempo real.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[400px]">
              {filteredClasses.length > 0 ? (
                filteredClasses.map(c => (
                  <ClassCard key={c.id} swimmingClass={c} onBook={setSelectedClassId} />
                ))
              ) : (
                <div className="col-span-full py-32 bg-white/40 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-white/60 text-slate-400 font-bold flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-8 opacity-20"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  No hay clases que coincidan con los filtros seleccionados.
                </div>
              )}
            </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-slate-900/95 backdrop-blur-2xl rounded-[4rem] p-12 lg:p-24 text-white shadow-4xl overflow-hidden relative border border-white/10 mb-32">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
             <img src="https://images.unsplash.com/photo-1519861531473-9200362f46b3?auto=format&fit=crop&q=80&w=1200" alt="Overlay" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative z-10">
              <h2 className="text-6xl font-black mb-12 leading-[1.05] tracking-tighter">Entrenamiento Sin Límites</h2>
              <div className="space-y-12">
                {[
                  { title: "Técnica Profesional", desc: "Perfeccioná tus estilos con seguimiento personalizado de expertos federados." },
                  { title: "Sede Paraguay 2060", desc: "Instalaciones de primer nivel en Recoleta/CABA, con vestuarios climatizados." },
                  { title: "Comunidad Obras", desc: "Formá parte de un club histórico dedicado a la excelencia deportiva." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="bg-blue-600/30 p-5 rounded-3xl h-fit group-hover:bg-blue-600 transition-all duration-300 border border-blue-400/20 group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl mb-3 tracking-tight">{item.title}</h4>
                      <p className="text-blue-100/70 font-medium leading-relaxed text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-5xl border-8 border-white/5 aspect-square lg:aspect-auto lg:h-[600px]">
              <img src="https://images.unsplash.com/photo-1530549387074-d56a992d5256?auto=format&fit=crop&q=80&w=1000" alt="Nadador en Acción" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/95 backdrop-blur-xl py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="flex items-center gap-6">
               <div className="bg-blue-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-blue-500/40">
                  <ICONS.Waves />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-4xl text-slate-900 tracking-tighter leading-none">Obras Paraguay</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Sede CABA</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-x-16 gap-y-8 justify-center text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">
              <button onClick={() => setShowReglamento(true)} className="hover:text-blue-600 transition-all hover:scale-105">Reglamento</button>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Paraguay+2060,+CABA" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-blue-600 transition-all hover:scale-105"
              >
                Ubicación
              </a>
              <a href="#" className="hover:text-blue-600 transition-all hover:scale-105">Soporte</a>
            </div>
            <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-loose">
                  © 2024 Escuela de Natación Obras Paraguay. <br/>
                  Paraguay 2060, CABA.
                </p>
            </div>
          </div>
        </div>
      </footer>

      {selectedClass && (
        <ReservationForm 
          selectedClass={selectedClass} 
          onClose={() => setSelectedClassId(null)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {showConfirmation && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-12 py-8 rounded-[3rem] shadow-5xl flex items-center gap-8 animate-in fade-in slide-in-from-top-12 duration-700 max-w-xl border-2 border-white/20">
          <div className="bg-white/20 p-4 rounded-2xl shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="font-bold text-left">
            <p className="text-2xl font-black tracking-tight">Pre-Reserva Exitosa</p>
            <p className="text-base font-medium opacity-90 leading-tight mt-1 text-emerald-50">Por favor, acércate a recepción en Paraguay 2060 para confirmar tu lugar con el pago.</p>
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      {showReglamento && (
        <ReglamentoModal onClose={() => setShowReglamento(false)} />
      )}

      <ChatBot />
    </div>
  );
};

export default App;
