import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Calendar, Droplets, Trash2, Clock, 
  X, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, Search 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Historique = () => {
  const [archives, setArchives] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche

  useEffect(() => {
    const saved = localStorage.getItem('oued_archives');
    if (saved) setArchives(JSON.parse(saved));
  }, []);

  const deleteArchive = (id) => {
    if (window.confirm("Supprimer définitivement cette archive ?")) {
      const updated = archives.filter(a => a.id !== id);
      setArchives(updated);
      localStorage.setItem('oued_archives', JSON.stringify(updated));
    }
  };

  // Logique de filtrage des archives
  const filteredArchives = archives.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER AVEC BARRE DE RECHERCHE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Archives des Sessions</h1>
          <p className="text-slate-500 text-sm">Consultez l'historique des analyses passées</p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* BARRE DE RECHERCHE */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un Oued..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          
          <div className="hidden sm:block bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-400">
            {filteredArchives.length} RÉSULTAT(S)
          </div>
        </div>
      </div>
      
      {/* GRILLE DES ARCHIVES FILTRÉES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArchives.map((session) => (
          <div key={session.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Archive</span>
                <button onClick={() => deleteArchive(session.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase truncate">{session.name}</h3>
            </div>
            
            <div className="p-6 space-y-4 flex-1 bg-slate-50/30">
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500"><Calendar size={14} /></div>
                <span>{session.start.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500"><Clock size={14} /></div>
                <span>{session.data.length > 0 ? `${session.data[0].time} → ${session.data[session.data.length-1].time}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500"><Droplets size={14} /></div>
                <span>{session.data.length} captures traitées</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedSession(session)}
              className="w-full py-4 bg-white hover:bg-blue-600 hover:text-white text-blue-600 font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:border-t-transparent"
            >
              <FolderOpen size={16} /> VOIR LE DÉTAIL <ChevronRight size={14} />
            </button>
          </div>
        ))}

        {/* AFFICHAGE SI AUCUN RÉSULTAT */}
        {filteredArchives.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[40px] text-slate-400">
            <Search size={48} className="mb-4 opacity-10" />
            <p className="font-medium uppercase tracking-widest text-xs">
              {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Aucune session archivée"}
            </p>
          </div>
        )}
      </div>

      {/* --- MODALE DE DÉTAIL (Identique à la version précédente) --- */}
      {selectedSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl max-h-full rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedSession.name}</h2>
                <p className="text-sm text-slate-500 font-medium">{selectedSession.start} — {selectedSession.end}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Graphique */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-inner">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 uppercase text-xs tracking-widest">
                  <TrendingUp size={18} className="text-blue-600" /> Analyse de la courbe
                </h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedSession.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                      <Area type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={4} fill="#dbeafe" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Galerie */}
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 uppercase text-xs tracking-widest">
                  Captures d'écran archivées
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {selectedSession.data.map((point, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                      <img src={point.img} alt="Archive" className="w-full aspect-square object-cover" />
                      <div className="p-2 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">{point.time}</span>
                        <span className={`text-[10px] font-black ${point.level > (selectedSession.finalThreshold || 20) ? 'text-red-500' : 'text-emerald-500'}`}>
                          {point.level}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end">
               <button 
                 onClick={() => window.print()} 
                 className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
               >
                 Imprimer le rapport
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historique;