import React, { useState, useEffect } from 'react'; // Ajout de hooks si tu veux une mise à jour temps réel
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Wifi, User, Droplets, Microscope } from 'lucide-react';

// --- IMPORTATION DES PAGES ---
import Dashboard from './pages/Dashboard';
import Analyse from './pages/Analyse';
import Historique from './pages/Historique';

const App = () => {
  // --- 1. CRÉATION DE LA DATE DYNAMIQUE ---
  // new Date().toLocaleDateString('fr-FR') va donner le format "JJ/MM/AAAA"
  const [dateDuJour, setDateDuJour] = useState(new Date());

  // (Optionnel) Ce useEffect permet de mettre à jour la date/heure automatiquement 
  // si l'utilisateur laisse la page ouverte pendant le passage à minuit
  useEffect(() => {
    const timer = setInterval(() => setDateDuJour(new Date()), 60000); // Vérifie toutes les minutes
    return () => clearInterval(timer);
  }, []);

  // Formatage propre : 14/01/2026
  const dateFormatee = dateDuJour.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 text-slate-800">
        
        {/* SIDEBAR COMMUNE */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="p-6 flex items-center gap-3 border-b border-slate-700 font-bold text-xl">
            <Droplets className="text-blue-400" /> OuedGuard
          </div>
          <nav className="p-4 space-y-2 flex-1">
            <SidebarLink to="/" icon={<LayoutDashboard size={18}/>} label="Tableau de bord" />
            <SidebarLink to="/analyse" icon={<Microscope size={18}/>} label="Analyse d'Images" />
            <SidebarLink to="/historique" icon={<History size={18}/>} label="Historique" />
            <SidebarLink to="/config" icon={<Settings size={18}/>} label="IoT Config" />
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* HEADER */}
          <header className="h-16 bg-white border-b px-8 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <Wifi size={16} /> Système Connecté 
            </div>
            <div className="flex items-center gap-4">
              
              {/* --- 2. AFFICHAGE DE LA DATE DYNAMIQUE ICI --- */}
              <span className="text-sm font-mono text-slate-500 capitalize">
                {dateFormatee}
              </span>

              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User size={18} />
              </div>
            </div>
          </header>

          {/* ZONE DE CONTENU DYNAMIQUE */}
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyse" element={<Analyse />} />
              <Route path="/historique" element={<Historique />} />
              <Route path="/config" element={<div className="p-8">Paramètres IoT en cours de développement...</div>} />
            </Routes>
          </div>

        </main>
      </div>
    </Router>
  );
};

// Composant pour les liens de la sidebar
const SidebarLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon} {label}
    </Link>
  );
};

export default App;