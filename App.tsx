import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Waves, User, ChevronRight, Droplets, Trophy, FileText, Phone, Users, UserCheck, Activity, Info, Download, MapPin, Clock as ClockIcon, Facebook, Instagram, Share2, Lock, ArrowRight, ShieldCheck, FileSpreadsheet, X, Calendar, CreditCard, CreditCard as CardIcon, Loader2, Check, Heart } from 'lucide-react';
import { MOCK_SCHEDULE, TEACHERS } from './constants';
import { SwimClass, DayOfWeek, ExperienceLevel, AIRecommendation, UserProfile, ActivityType, ClassType, TargetAudience } from './types';
import { getSwimmingRecommendation } from './services/geminiService';
import { BookingModal } from './components/BookingModal';
import * as XLSX from 'xlsx';

// Extended interface to store full details for Excel
interface BookingRecord {
  // Metadata
  bookingTimestamp: string;
  paymentStatus: 'Pendiente de Pago' | 'Confirmado';
  
  // User Data
  dni: string;
  name: string;
  phone: string;
  age: number;
  
  // Class Data
  classId: string;
  activityType: string;
  classType: string;
  day: string;
  time: string;
  teacherName: string;
  level: string;
  price: number;
}

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4 text-white">
          <Waves size={24} />
          <span className="font-bold text-xl">Obras Paraguay</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Fomentando el deporte, la salud y el bienestar en nuestra comunidad. 
          Instalaciones de primer nivel para el desarrollo de nadadores de todas las edades.
        </p>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Contacto & Ubicación</h4>
        <div className="space-y-3 text-sm">
          <p className="flex items-start gap-3">
            <MapPin size={18} className="text-brand-400 shrink-0" />
            <span>Paraguay 2060, CABA</span>
          </p>
          <p className="flex items-center gap-3">
            <Phone size={18} className="text-brand-400 shrink-0" />
            <span>+54 11 1234 5678</span>
          </p>
          <p className="flex items-center gap-3">
            <ClockIcon size={18} className="text-brand-400 shrink-0" />
            <span>Lun - Vie: 07:00 - 21:40 | Sáb: 09:00 - 20:00</span>
          </p>
        </div>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Síguenos</h4>
        <div className="flex gap-4">
          <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-brand-600 transition-colors text-white">
            <Facebook size={20} />
          </a>
          <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-brand-600 transition-colors text-white">
            <Instagram size={20} />
          </a>
        </div>
        <div className="mt-6">
           <p className="text-xs text-slate-500">
             © {new Date().getFullYear()} Natación Obras Paraguay.<br/>Todos los derechos reservados.
           </p>
        </div>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  // App State
  const [step, setStep] = useState<'profile' | 'schedule' | 'success'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    age: 25, 
    level: ExperienceLevel.BEGINNER, 
    name: '', 
    documentNumber: '', 
    phoneNumber: '',
    activityType: ActivityType.SWIMMING,
    classType: ClassType.GROUP
  });
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Filtering State
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'ALL'>('ALL');
  
  // Booking State
  const [filteredClasses, setFilteredClasses] = useState<SwimClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<SwimClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // Store all bookings in memory
  const [allBookings, setAllBookings] = useState<BookingRecord[]>([]);

  // Admin / Excel Security State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');

  // Handlers
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAI(true);
    
    // Call Gemini API
    const recommendation = await getSwimmingRecommendation(
      userProfile.age, 
      userProfile.level,
      userProfile.activityType,
      userProfile.classType
    );
    
    setAiRecommendation(recommendation);
    setIsLoadingAI(false);
    setStep('schedule');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Natación Obras Paraguay',
      text: '¡Reserva tu clase de natación en Obras Paraguay! Temporada 2026.',
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles. ¡Compártelo con tus amigos!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Filter classes based on profile and constraints
  useEffect(() => {
    if (aiRecommendation || step === 'schedule') {
      const isKid = userProfile.age >= 4 && userProfile.age <= 12;

      const filtered = MOCK_SCHEDULE.filter(c => {
        const matchDay = selectedDay === 'ALL' || c.day === selectedDay;
        const hasSlots = c.totalSlots > c.bookedSlots;
        const matchType = c.classType === userProfile.classType;
        const matchActivity = c.activityType === userProfile.activityType;

        let matchAudience = true;
        if (c.classType === ClassType.GROUP) {
          if (isKid) {
            matchAudience = c.targetAudience === TargetAudience.KIDS;
            if (c.minAge && c.maxAge) {
               matchAudience = matchAudience && (userProfile.age >= c.minAge && userProfile.age <= c.maxAge);
            }
          } else {
            matchAudience = c.targetAudience === TargetAudience.ADULTS;
            if (c.minAge) {
               matchAudience = matchAudience && (userProfile.age >= c.minAge);
            }
          }
        }
        return matchDay && hasSlots && matchType && matchActivity && matchAudience;
      });
      setFilteredClasses(filtered);
    }
  }, [aiRecommendation, selectedDay, userProfile, step]);

  const handleBookClick = (cls: SwimClass) => {
    setSelectedClass(cls);
    setBookingError(null);
    setIsModalOpen(true);
  };

  const confirmBooking = () => {
    if (!selectedClass) return;

    // --- Validation Logic ---
    const userBookings = allBookings.filter(b => b.dni === userProfile.documentNumber);

    if (userBookings.some(b => b.classId === selectedClass.id)) {
      setBookingError("Ya tienes una reserva confirmada para este horario.");
      return;
    }

    if (userBookings.length >= 2) {
      setBookingError("Has alcanzado el límite máximo de 2 reservas permitidas por DNI.");
      return;
    }

    setIsBooking(true);
    setTimeout(() => {
      // Create final record
      const newRecord: BookingRecord = {
        bookingTimestamp: new Date().toLocaleString(),
        paymentStatus: 'Pendiente de Pago',
        dni: userProfile.documentNumber,
        name: userProfile.name,
        phone: userProfile.phoneNumber,
        age: userProfile.age,
        classId: selectedClass.id,
        activityType: selectedClass.activityType,
        classType: selectedClass.classType,
        day: selectedClass.day,
        time: selectedClass.time,
        teacherName: TEACHERS[selectedClass.teacherId].name,
        level: selectedClass.level,
        price: selectedClass.price
      };

      setAllBookings(prev => [...prev, newRecord]);
      setIsBooking(false);
      setIsModalOpen(false);
      setStep('success');
    }, 1500);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === '31913637') {
      setIsAdminModalOpen(false);
      setShowAdminDashboard(true);
      setAdminCode('');
      setAdminError('');
    } else {
      setAdminError('ID incorrecto. Acceso denegado.');
    }
  };

  const downloadExcel = () => {
    if (allBookings.length === 0) {
      alert('No hay registros para descargar.');
      return;
    }

    const dataToExport = allBookings.map(record => ({
      "Fecha y Hora Reserva": record.bookingTimestamp,
      "Estado Pago": record.paymentStatus,
      "Nombre Alumno": record.name,
      "DNI": record.dni,
      "Teléfono": record.phone,
      "Edad": record.age,
      "Actividad": record.activityType,
      "Modalidad": record.classType,
      "Día de Clase": record.day,
      "Hora de Clase": record.time + " hs",
      "Profesor Asignado": record.teacherName,
      "Nivel": record.level,
      "Monto": record.price
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    const dateStr = new Date().toISOString().slice(0,10);
    XLSX.writeFile(workbook, `Reservas_Obras_${dateStr}.xlsx`);
    alert('El archivo Excel se ha descargado correctamente.');
  };

  const getCapacityColor = (booked: number, total: number) => {
    const percentage = booked / total;
    if (percentage > 0.8) return 'text-red-500 bg-red-50 border-red-200';
    if (percentage > 0.5) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUserBookingCount = () => {
    return allBookings.filter(b => b.dni === userProfile.documentNumber).length;
  };

  // Render Functions
  const renderProfileStep = () => (
    <div className="w-full animate-in fade-in duration-500">
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-brand-900 shadow-2xl min-h-[450px]">
        {/* Background Gallery Section */}
        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
          <div className="relative h-full w-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=1000" 
              alt="Nadador de competición" 
              className="w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-1000"
            />
          </div>
          <div className="relative h-full w-full hidden md:block overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1585952136018-0975e0766282?auto=format&fit=crop&q=80&w=1000" 
              alt="Niños en la piscina" 
              className="w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-1000 border-x border-white/5"
            />
          </div>
          <div className="relative h-full w-full hidden md:block overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1545300662-75608d4b3df3?auto=format&fit=crop&q=80&w=1000" 
              alt="Adulto mayor nadando" 
              className="w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-1000"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-2xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6">
             <Sparkles size={12} className="text-yellow-400" />
             Temporada 2026
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
             Sumérgete en <br/> la excelencia
           </h1>
           <p className="text-brand-100 text-lg mb-8 leading-relaxed max-w-lg">
             Sistema oficial de reservas de Natación Obras Paraguay. 
             Un espacio inclusivo para formar nadadores de todas las edades con técnica y pasión en el agua.
           </p>
           <div className="flex flex-wrap gap-4">
             <div className="flex items-center gap-2 text-white/90 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm text-sm border border-white/10">
                <Trophy size={18} className="text-brand-400" /> Formación Técnica
             </div>
             <div className="flex items-center gap-2 text-white/90 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm text-sm border border-white/10">
                <Heart size={18} className="text-red-400" /> Salud & Diversión
             </div>
           </div>
        </div>
      </div>

      {/* Programs Preview Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
          <div className="h-44 overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1519214605650-76a613ee3245?auto=format&fit=crop&q=80&w=800" alt="Niños nadando" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <p className="absolute bottom-3 left-4 text-white font-bold flex items-center gap-2">
              <Droplets size={16} /> Niños (4-12 años)
            </p>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-500 leading-relaxed">Aprendizaje lúdico y seguro para los más pequeños en grupos divididos por nivel.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
          <div className="h-44 overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=800" alt="Adulto nadando" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <p className="absolute bottom-3 left-4 text-white font-bold flex items-center gap-2">
              <Activity size={16} /> Adultos & Entrenamiento
            </p>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-500 leading-relaxed">Perfeccionamiento de estilos y entrenamiento de resistencia para todos los niveles.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
          <div className="h-44 overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800" alt="Adultos mayores en aquagym" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <p className="absolute bottom-3 left-4 text-white font-bold flex items-center gap-2">
              <Waves size={16} /> Aquagym (Adultos Mayores)
            </p>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-500 leading-relaxed">Clases grupales de bajo impacto diseñadas para mejorar la salud y movilidad de los adultos mayores.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 z-20">
        <div className="mb-6 pb-6 border-b border-slate-100">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="text-brand-600" />
            Reserva tu Clase
          </h2>
          <p className="text-slate-500 text-sm mt-1">Ingresa tus datos para ver los horarios disponibles según tu perfil.</p>
        </div>
        
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
              <input 
                type="text" 
                required
                className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                placeholder="Ej: Juan Pérez"
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <FileText size={16} className="text-slate-400" /> Documento (DNI)
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="12.345.678"
                  value={userProfile.documentNumber}
                  onChange={(e) => setUserProfile({...userProfile, documentNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Phone size={16} className="text-slate-400" /> Teléfono
                </label>
                <input 
                  type="tel" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="+595 9..."
                  value={userProfile.phoneNumber}
                  onChange={(e) => setUserProfile({...userProfile, phoneNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-6"></div>

          <div>
            <h3 className="text-lg font-medium text-brand-900 mb-4 flex items-center gap-2">
              <Activity size={20} /> Preferencias
            </h3>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3">
              <Info className="text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los alumnos de clases grupales pueden reservar hasta <strong>dos sesiones</strong> semanales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actividad</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(ActivityType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserProfile({...userProfile, activityType: type})}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border ${
                        userProfile.activityType === type 
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Modalidad</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(ClassType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserProfile({...userProfile, classType: type})}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border ${
                        userProfile.classType === type 
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Edad del Alumno</label>
              <input 
                type="number" 
                min="4" max="100"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                value={userProfile.age}
                onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nivel Estimado</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-white"
                value={userProfile.level}
                onChange={(e) => setUserProfile({...userProfile, level: e.target.value as ExperienceLevel})}
              >
                {Object.values(ExperienceLevel).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoadingAI}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-200 flex justify-center items-center gap-2 mt-4"
          >
            {isLoadingAI ? (
              <><Loader2 className="animate-spin" /> Analizando Disponibilidad...</>
            ) : (
              <>Buscar Horarios <ChevronRight size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderScheduleStep = () => {
    const currentBookings = getUserBookingCount();
    return (
      <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
              <button onClick={() => setStep('profile')} className="text-sm text-slate-500 hover:text-brand-600 mb-1 flex items-center gap-1">
                  &larr; Cambiar filtros
              </button>
              <h1 className="text-3xl font-bold text-slate-900">
                {userProfile.activityType} - {userProfile.classType}
              </h1>
              <p className="text-slate-500 mt-1">
                Para {userProfile.age >= 4 && userProfile.age <= 12 ? 'Niños' : 'Adultos'} ({userProfile.age} años)
              </p>
              {currentBookings > 0 && (
                <p className="text-sm text-brand-600 font-medium mt-1">
                  Reservas realizadas: {currentBookings}/2
                </p>
              )}
          </div>
          
          {aiRecommendation && (
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white p-4 rounded-2xl shadow-lg flex items-center gap-4 max-w-lg animate-in slide-in-from-right duration-500">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                  <p className="text-xs font-medium opacity-90 uppercase tracking-wider">Recomendación</p>
                  <p className="font-bold text-lg">{aiRecommendation.recommendedLevel}</p>
                  <p className="text-sm opacity-90 italic">"{aiRecommendation.motivationTip}"</p>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Search size={18} /> Filtros Rápidos
                  </h3>
                  <div className="space-y-2">
                      <label className="text-sm text-slate-500">Día de la semana</label>
                      <div className="flex flex-col gap-2">
                          <button 
                              onClick={() => setSelectedDay('ALL')}
                              className={`px-4 py-2 rounded-lg text-left text-sm font-medium transition-colors ${selectedDay === 'ALL' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                              Todos los días
                          </button>
                          {Object.values(DayOfWeek).map(day => (
                              <button 
                                  key={day}
                                  onClick={() => setSelectedDay(day)}
                                  className={`px-4 py-2 rounded-lg text-left text-sm font-medium transition-colors ${selectedDay === day ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'hover:bg-slate-50 text-slate-600'}`}
                              >
                                  {day}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
                   <h3 className="font-semibold text-brand-900 mb-2 flex items-center gap-2">
                      <Trophy size={18} /> Objetivo Sugerido
                  </h3>
                  <p className="text-sm text-brand-700 leading-relaxed">
                      {aiRecommendation?.reasoning}
                  </p>
                  <div className="mt-4 pt-4 border-t border-brand-200">
                      <p className="text-xs text-brand-500 uppercase font-bold tracking-wider mb-1">Enfoque Técnico</p>
                      <p className="text-brand-800 font-medium">{aiRecommendation?.focusArea}</p>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-3">
              {filteredClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                      <Droplets size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium text-slate-900">No hay horarios disponibles.</p>
                      <button onClick={() => setSelectedDay('ALL')} className="text-brand-600 font-semibold mt-4 hover:underline">Ver toda la semana</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredClasses.map(cls => {
                          const teacher = TEACHERS[cls.teacherId];
                          const isBooked = allBookings.some(b => b.dni === userProfile.documentNumber && b.classId === cls.id);
                          return (
                              <div key={cls.id} className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-100 transition-all flex flex-col justify-between group ${isBooked ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                                  <div>
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                                              {cls.day}
                                          </div>
                                          {isBooked ? (
                                             <div className="px-3 py-1 rounded-full text-xs font-bold text-green-700 bg-green-100 border border-green-200 flex items-center gap-1">
                                               <Check size={12} /> Reservado
                                             </div>
                                          ) : (
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getCapacityColor(cls.bookedSlots, cls.totalSlots)}`}>
                                                {cls.totalSlots - cls.bookedSlots} lugares
                                            </div>
                                          )}
                                      </div>
                                      
                                      <div className="flex items-center gap-3 mb-4">
                                          <img src={teacher.photoUrl} alt={teacher.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-50" />
                                          <div>
                                              <p className="text-sm text-slate-500">Docente</p>
                                              <p className="font-semibold text-slate-900">{teacher.name}</p>
                                          </div>
                                      </div>

                                      <div className="mb-4">
                                          <h4 className="text-2xl font-bold text-slate-800">{cls.time} hs</h4>
                                          <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                                            {cls.activityType} • {cls.classType}
                                          </p>
                                      </div>
                                  </div>

                                  <button 
                                      onClick={() => handleBookClick(cls)}
                                      disabled={isBooked}
                                      className={`w-full py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                                        isBooked 
                                          ? 'bg-green-100 text-green-800 cursor-default' 
                                          : 'bg-slate-900 text-white group-hover:bg-brand-600'
                                      }`}
                                  >
                                      {isBooked ? 'Ya Reservado' : `Seleccionar`}
                                  </button>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => {
    const bookingCount = getUserBookingCount();
    const canBookMore = bookingCount < 2;

    return (
      <div className="max-w-md mx-auto w-full text-center animate-in zoom-in duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-green-50 border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
              <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Reserva Registrada!</h2>
          <p className="text-slate-600 mb-6 text-sm">
              Tu reserva para el día <strong>{selectedClass?.day} a las {selectedClass?.time} hs</strong> ha sido registrada con éxito.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 text-left flex items-start gap-3">
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
                <span>Estado de Reserva</span>
                <span className="text-brand-600">Confirmada</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
                <span>Código</span>
                <span className="text-slate-900 font-mono">#OBR-{Math.floor(Math.random()*90000)+10000}</span>
              </div>
            </div>
          </div>

          {canBookMore ? (
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 text-left flex items-start gap-3">
              <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm text-blue-800">
                Has completado <strong>{bookingCount} de 2</strong> reservas semanales permitidas.
              </div>
            </div>
          ) : (
             <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-100 text-left flex items-start gap-3">
              <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm text-green-800">
                ¡Límite alcanzado! Ya tienes tus <strong>2 reservas</strong> para esta semana.
              </div>
            </div>
          )}

          <div className="space-y-3">
              {canBookMore && (
                <button 
                    onClick={() => setStep('schedule')}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
                >
                    Reservar otra clase
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 text-brand-600 bg-brand-50 hover:bg-brand-100 font-bold py-3 rounded-xl transition-colors border border-brand-200"
              >
                <Share2 size={20} />
                Compartir con un amigo
              </button>

              <button 
                  onClick={() => {
                      setStep('profile');
                      setUserProfile({ 
                        age: 25, level: ExperienceLevel.BEGINNER, name: '', documentNumber: '', phoneNumber: '', activityType: ActivityType.SWIMMING, classType: ClassType.GROUP
                      });
                      setAiRecommendation(null);
                  }}
                  className={`w-full text-sm py-2 transition-colors mt-2 text-slate-400 hover:text-slate-600`}
              >
                  Volver al inicio
              </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-200 flex flex-col animate-in fade-in duration-700">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
                <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                    <Waves size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight text-brand-900 hidden md:block">Natación Obras Paraguay</span>
                <span className="font-bold text-xl tracking-tight text-brand-900 md:hidden">Obras Paraguay</span>
            </div>
            <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setIsAdminModalOpen(true)}
                   className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                 >
                   <ShieldCheck size={16} />
                   <span className="hidden md:inline">Admin</span>
                 </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center flex-grow w-full">
        {step === 'profile' && renderProfileStep()}
        {step === 'schedule' && renderScheduleStep()}
        {step === 'success' && renderSuccessStep()}
      </main>

      <Footer />

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedClass={selectedClass}
        teacher={selectedClass ? TEACHERS[selectedClass.teacherId] : undefined}
        onConfirm={confirmBooking}
        isProcessing={isBooking}
        error={bookingError}
      />

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock size={20} className="text-brand-600" /> Acceso Administrativo
                  </h3>
                  <button onClick={() => setIsAdminModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAdminAuth}>
                  <input 
                      type="password" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none text-center tracking-widest mb-4" 
                      value={adminCode}
                      onChange={e => setAdminCode(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                  />
                  {adminError && <p className="text-red-500 text-xs mb-3 text-center">{adminError}</p>}
                  <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg">Ingresar</button>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {showAdminDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                  <div className="bg-brand-500 p-2 rounded-lg"><FileText className="text-white" size={24} /></div>
                  <h2 className="text-xl font-bold text-white">Panel de Reservas</h2>
               </div>
               <div className="flex gap-3">
                  <button onClick={downloadExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                     <FileSpreadsheet size={18} /> Excel
                  </button>
                  <button onClick={() => setShowAdminDashboard(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Cerrar</button>
               </div>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-slate-50">
               {allBookings.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Info size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">No hay reservas registradas.</p>
                 </div>
               ) : (
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Alumno</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Clase</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Reserva</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {allBookings.map((record, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                               <div className="text-sm font-medium text-slate-900">{record.name}</div>
                               <div className="text-xs text-slate-500">DNI: {record.dni}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {record.day} - {record.time}hs ({record.teacherName})
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">Gs. {record.price.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                                  {record.paymentStatus}
                                </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;