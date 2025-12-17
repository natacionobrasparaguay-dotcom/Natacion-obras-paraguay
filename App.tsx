import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Waves, User, ChevronRight, Droplets, Trophy, FileText, Phone, Users, UserCheck, Activity, Info, Download, MapPin, Clock as ClockIcon, Facebook, Instagram, Share2, Lock, ArrowRight, ShieldCheck, FileSpreadsheet, X, Calendar } from 'lucide-react';
import { MOCK_SCHEDULE, TEACHERS } from './constants';
import { SwimClass, DayOfWeek, ExperienceLevel, AIRecommendation, UserProfile, ActivityType, ClassType, TargetAudience } from './types';
import { getSwimmingRecommendation } from './services/geminiService';
import { BookingModal } from './components/BookingModal';
import * as XLSX from 'xlsx';

// Extended interface to store full details for Excel
interface BookingRecord {
  // Metadata
  bookingTimestamp: string;
  
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
    if (aiRecommendation) {
      const isKid = userProfile.age >= 4 && userProfile.age <= 12;

      const filtered = MOCK_SCHEDULE.filter(c => {
        // 1. Basic Filter: Day and Available Slots
        const matchDay = selectedDay === 'ALL' || c.day === selectedDay;
        const hasSlots = c.totalSlots > c.bookedSlots;

        // 2. Class Type Filter (Private vs Group)
        const matchType = c.classType === userProfile.classType;

        // 3. Activity Filter (Swimming vs Aquagym)
        const matchActivity = c.activityType === userProfile.activityType;

        // 4. Age/Target Audience Filter
        let matchAudience = true;
        if (c.classType === ClassType.GROUP) {
          if (isKid) {
            // Strict age group matching for kids
            matchAudience = c.targetAudience === TargetAudience.KIDS;
            if (c.minAge && c.maxAge) {
               matchAudience = matchAudience && (userProfile.age >= c.minAge && userProfile.age <= c.maxAge);
            }
          } else {
            // User is older than 12
            matchAudience = c.targetAudience === TargetAudience.ADULTS;
            // Check minAge for adults (e.g. Aquagym 60+)
            if (c.minAge) {
               matchAudience = matchAudience && (userProfile.age >= c.minAge);
            }
          }
        }

        return matchDay && hasSlots && matchType && matchActivity && matchAudience;
      });
      setFilteredClasses(filtered);
    }
  }, [aiRecommendation, selectedDay, userProfile]);

  const handleBookClick = (cls: SwimClass) => {
    setSelectedClass(cls);
    setBookingError(null);
    setIsModalOpen(true);
  };

  const confirmBooking = () => {
    if (!selectedClass) return;

    // --- Validation Logic ---
    const userBookings = allBookings.filter(b => b.dni === userProfile.documentNumber);

    // 1. Check duplicate class (same ID)
    if (userBookings.some(b => b.classId === selectedClass.id)) {
      setBookingError("Ya tienes una reserva confirmada para este horario.");
      return;
    }

    // 2. Check max bookings limit (Max 2)
    if (userBookings.length >= 2) {
      setBookingError("Has alcanzado el límite máximo de 2 reservas permitidas por DNI.");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    // Create full record
    const newRecord: BookingRecord = {
      bookingTimestamp: new Date().toLocaleString(),
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
      level: selectedClass.level
    };

    // Simulate API call
    setTimeout(() => {
      // Add to bookings record
      setAllBookings(prev => [...prev, newRecord]);
      
      setIsBooking(false);
      setIsModalOpen(false);
      setStep('success');
    }, 1500);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === '31913637') {
      // Success auth
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

    // Format data for Excel headers
    const dataToExport = allBookings.map(record => ({
      "Fecha y Hora Reserva": record.bookingTimestamp,
      "Nombre Alumno": record.name,
      "DNI": record.dni,
      "Teléfono": record.phone,
      "Edad": record.age,
      "Actividad": record.activityType,
      "Modalidad": record.classType,
      "Día de Clase": record.day,
      "Hora de Clase": record.time + " hs",
      "Profesor Asignado": record.teacherName,
      "Nivel": record.level
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    
    // Generate filename with timestamp
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
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-brand-900 shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Swimming Pool" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 to-transparent"></div>
        </div>
        <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-2xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6">
             <Sparkles size={12} className="text-yellow-400" />
             Temporada 2026
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
             Descubre tu potencial <br/> en el agua
           </h1>
           <p className="text-brand-100 text-lg mb-8 leading-relaxed max-w-lg">
             Sistema oficial de reservas de Natación Obras Paraguay. 
             Clases grupales, particulares y aquagym adaptadas a tu nivel.
           </p>
           <div className="flex flex-wrap gap-4">
             <div className="flex items-center gap-2 text-white/80 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <CheckCircle size={16} className="text-green-400" /> Profesores Certificados
             </div>
             <div className="flex items-center gap-2 text-white/80 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <CheckCircle size={16} className="text-green-400" /> Piscina Climatizada
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 relative -mt-8 z-20">
        <div className="mb-6 pb-6 border-b border-slate-100">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="text-brand-600" />
            Comenzar Inscripción
          </h2>
          <p className="text-slate-500 text-sm mt-1">Completa los datos del alumno para encontrar el grupo ideal.</p>
        </div>
        
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Nombre y Documento */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ej: Juan Pérez"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                />
              </div>
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

          {/* Preferencias de Clase */}
          <div>
            <h3 className="text-lg font-medium text-brand-900 mb-4 flex items-center gap-2">
              <Activity size={20} /> Preferencias
            </h3>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3">
              <Info className="text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Política de Cursada:</strong> Los alumnos de clases grupales pueden reservar hasta <strong>dos días</strong> por semana (ej. Lunes y Miércoles).
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

          {/* Edad y Nivel */}
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
              <p className="text-xs text-slate-400 mt-1">Mínimo 4 años</p>
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
              <>
                <Sparkles className="animate-spin" />
                Buscando Disponibilidad...
              </>
            ) : (
              <>
                Ver Horarios Disponibles
                <ChevronRight size={20} />
              </>
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
              Mostrando horarios para {userProfile.age >= 4 && userProfile.age <= 12 ? 'Niños' : 'Adultos'} ({userProfile.age} años)
            </p>
            {currentBookings > 0 && (
              <p className="text-sm text-brand-600 font-medium mt-1">
                Reservas realizadas: {currentBookings}/2
              </p>
            )}
        </div>
        
        {/* AI Insight Card */}
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
        {/* Filters */}
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

        {/* Results Grid */}
        <div className="lg:col-span-3">
            {filteredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                    <Droplets size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium text-slate-900">No hay horarios disponibles.</p>
                    <p className="text-sm mt-1 max-w-xs text-center">
                      Para la edad y modalidad seleccionada, no encontramos cupos en este filtro.
                    </p>
                    <button onClick={() => setSelectedDay('ALL')} className="text-brand-600 font-semibold mt-4 hover:underline">Ver toda la semana</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredClasses.map(cls => {
                        const teacher = TEACHERS[cls.teacherId];
                        // Check if this specific class is already booked by user
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
                                             <CheckCircle size={12} /> Reservado
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
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                                            {cls.activityType}
                                          </span>
                                          {cls.minAge && (
                                            <span className="text-xs font-medium bg-brand-50 px-2 py-1 rounded text-brand-600">
                                              {cls.minAge}{cls.maxAge ? `-${cls.maxAge}` : '+'} años
                                            </span>
                                          )}
                                          {!cls.minAge && (
                                            <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                                              {cls.targetAudience}
                                            </span>
                                          )}
                                        </div>
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
                                    {isBooked ? 'Ya Reservado' : `Reservar ${cls.classType === ClassType.PRIVATE ? 'Particular' : 'Cupo'}`}
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
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={40} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Solicitud Registrada!</h2>
        <p className="text-slate-600 mb-6">
            Hemos registrado tu solicitud para el <strong>{selectedClass?.day} {selectedClass?.time}hs</strong>.
        </p>

        <div className="bg-amber-50 p-4 rounded-xl mb-4 border border-amber-100 text-left flex items-start gap-3">
          <Info className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-sm text-amber-900">
             <strong>Pendiente de Confirmación:</strong> La asignación definitiva del cupo se realizará una vez corroborado el pago. Nos comunicaremos contigo al teléfono registrado.
          </div>
        </div>

        {canBookMore ? (
          <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 text-left flex items-start gap-3">
            <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
            <div className="text-sm text-blue-800">
              Llevas <strong>{bookingCount} de 2</strong> reservas permitidas. Recuerda completar tu esquema semanal.
            </div>
          </div>
        ) : (
           <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-100 text-left flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
            <div className="text-sm text-green-800">
              ¡Genial! Ya has completado tus <strong>2 reservas</strong> semanales permitidas.
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100 text-left flex items-start gap-3">
          <Phone className="text-slate-500 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-sm text-slate-600">
             Enviaremos los detalles y pasos a seguir al número <strong>{userProfile.phoneNumber}</strong>.
          </div>
        </div>
        
        <div className="space-y-3">
            {canBookMore && (
              <button 
                  onClick={() => setStep('schedule')}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                  Reservar segunda clase
              </button>
            )}
            
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 text-brand-600 bg-brand-50 hover:bg-brand-100 font-bold py-3 rounded-xl transition-colors border border-brand-200"
            >
              <Share2 size={20} />
              Invitar a un amigo
            </button>

            <button 
                onClick={() => {
                    setStep('profile');
                    setUserProfile({ 
                      age: 25, 
                      level: ExperienceLevel.BEGINNER, 
                      name: '', 
                      documentNumber: '', 
                      phoneNumber: '',
                      activityType: ActivityType.SWIMMING,
                      classType: ClassType.GROUP
                    });
                    setAiRecommendation(null);
                }}
                className={`w-full text-sm py-2 transition-colors mt-2 ${canBookMore ? 'text-slate-400 hover:text-slate-600' : 'bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl'}`}
            >
                Volver al inicio
            </button>
        </div>
      </div>
    </div>
    );
  };
  
  // Icon helper for Success Component and Hero
  const CheckCircle = ({ size, strokeWidth, className }: { size: number, strokeWidth?: number, className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth || 2} 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-200 flex flex-col animate-in fade-in duration-700">
      {/* Navbar */}
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
                  onClick={handleShare}
                  className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                  title="Compartir App"
                >
                  <Share2 size={20} />
                  <span className="hidden md:inline text-sm font-medium">Compartir</span>
                </button>

                {userProfile.name && step !== 'profile' && (
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        <User size={14} />
                        {userProfile.name}
                    </div>
                )}

                 <button 
                   onClick={() => setIsAdminModalOpen(true)}
                   className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                   title="Administración"
                 >
                   <ShieldCheck size={16} />
                   {allBookings.length > 0 && (
                      <span className="bg-white/20 px-1.5 rounded text-xs">{allBookings.length}</span>
                   )}
                   <span className="hidden md:inline">Admin</span>
                 </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center flex-grow w-full">
        {step === 'profile' && renderProfileStep()}
        {step === 'schedule' && renderScheduleStep()}
        {step === 'success' && renderSuccessStep()}
      </main>

      <Footer />

      {/* Booking Modal */}
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
                    <Lock size={20} className="text-brand-600" />
                    Acceso Administrativo
                  </h3>
                  <button onClick={() => setIsAdminModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <ArrowRight className="rotate-45" size={20} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Ingrese el ID de seguridad para visualizar y gestionar la base de datos de inscripciones.
                </p>
                <form onSubmit={handleAdminAuth}>
                  <div className="mb-4">
                    <input 
                        type="password" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none text-center tracking-widest" 
                        value={adminCode}
                        onChange={e => setAdminCode(e.target.value)}
                        placeholder="••••••••"
                        autoFocus
                    />
                  </div>
                  {adminError && <p className="text-red-500 text-sm mb-3 text-center bg-red-50 p-2 rounded-lg">{adminError}</p>}
                  
                  <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsAdminModalOpen(false)} 
                        className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-100"
                      >
                        Ingresar
                      </button>
                  </div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard / Data Visualization */}
      {showAdminDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                  <div className="bg-brand-500 p-2 rounded-lg">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Panel de Reservas</h2>
                    <p className="text-slate-400 text-xs">Visualización de inscripciones activas</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button 
                     onClick={downloadExcel}
                     className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-green-900/20"
                  >
                     <FileSpreadsheet size={18} />
                     Descargar Excel
                  </button>
                  <button 
                    onClick={() => setShowAdminDashboard(false)} 
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <X size={18} />
                    Cerrar
                  </button>
               </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50">
               {allBookings.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Info size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium text-slate-600">No hay reservas registradas en esta sesión.</p>
                 </div>
               ) : (
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Alumno</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Detalles Clase</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Docente</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {allBookings.map((record, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <div className="flex flex-col">
                                <span>{record.bookingTimestamp.split(',')[0]}</span>
                                <span className="text-xs text-slate-400">{record.bookingTimestamp.split(',')[1]}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="text-sm font-medium text-slate-900">{record.name}</div>
                               <div className="text-xs text-slate-500">DNI: {record.dni}</div>
                               <div className="text-xs text-slate-500">Edad: {record.age}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                               <div className="flex items-center gap-1">
                                 <Phone size={14} className="text-slate-400" />
                                 {record.phone}
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-50 text-brand-700 mb-1">
                                  {record.activityType}
                                </span>
                                <div className="text-sm text-slate-700 font-medium">
                                  {record.day} - {record.time}hs
                                </div>
                                <div className="text-xs text-slate-500">{record.level}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                               {record.teacherName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               )}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-500 flex justify-between">
               <span>Total Registros: {allBookings.length}</span>
               <span>ID Seguridad: Verificado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;