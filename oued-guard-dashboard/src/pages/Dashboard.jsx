import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, Droplets, Activity, FileText, 
  MapPin, Play, Pause, RefreshCw 
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = "http://192.168.11.197:5001"; 

const Dashboard = () => {
  // --- ÉTATS (DATA) ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Données affichées
  const [currentImage, setCurrentImage] = useState(null); // L'image affichée
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("En attente");
  const [llmReport, setLlmReport] = useState("");
  const [chartData, setChartData] = useState([]); // Historique pour le graph

  // 1. Au chargement : Récupérer la liste des fichiers du dossier
  useEffect(() => {
    fetch(`${API_URL}/api/files`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setFiles(data);
      })
      .catch(err => console.error("Erreur connexion backend:", err));
  }, []);

  // 2. La Boucle de Simulation
  useEffect(() => {
    let interval;
    if (isPlaying && files.length > 0) {
      interval = setInterval(() => {
        analyzeNextImage();
      }, 3000); // Vitesse : 3 secondes par image
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, files]);

  // Fonction qui appelle le Backend pour l'image actuelle
  const analyzeNextImage = async () => {
    if (currentIndex >= files.length) {
      setIsPlaying(false); // Fin de la liste
      return;
    }

    const filename = files[currentIndex];
    try {
      const res = await fetch(`${API_URL}/api/simulate/${filename}`);
      const data = await res.json();

      // Mise à jour de l'interface
      setCurrentImage(data.image_data);
      setCurrentLevel(data.level);
      setCurrentStatus(data.status);
      if (data.rapport) setLlmReport(data.rapport);

      // Mise à jour du Graphique
      setChartData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), level: data.level }];
        return newData.slice(-10); // Garder les 10 derniers points
      });

      // Passer à l'image suivante
      setCurrentIndex(prev => (prev + 1) % files.length); // Boucle infinie

    } catch (error) {
      console.error("Erreur simulation:", error);
    }
  };

  const toggleSimulation = () => setIsPlaying(!isPlaying);

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Simulation Crue (Dataset)</h1>
          <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm">
            <MapPin size={16} />
            <span>Dossier Source : {files.length} images détectées</span>
          </div>
        </div>

        <button 
          onClick={toggleSimulation}
          // ON FORCE LA COULEUR ICI VIA LE STYLE DIRECT (Infaillible)
          style={{ 
            backgroundColor: isPlaying ? '#dc2626' : '#2563eb', // Rouge ou Bleu
            color: '#ffffff' // Texte Blanc
          }}
          className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:opacity-90 transition-all transform hover:scale-105"
        >
          {/* Les icônes sont aussi forcées en blanc */}
          {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
          
          <span>{isPlaying ? "PAUSE SIMULATION" : "LANCER SIMULATION"}</span>
        </button>
      </div>

      {/* GRID PRINCIPALE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE : VISUEL & STATS */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* IMAGE DE LA SIMULATION */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt="Simulation" 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <Activity size={48} className="mb-2 opacity-50" />
                  <p>En attente de démarrage...</p>
                </div>
              )}
              
              {/* Overlay Statut */}
              <div className="absolute top-4 right-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                   currentStatus === 'Inondation' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                 }`}>
                   {currentStatus.toUpperCase()}
                 </span>
              </div>
            </div>
          </div>

          {/* GRAPHIQUE TEMPS RÉEL */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-64">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Évolution du niveau d'eau</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="level" 
                  stroke={currentLevel > 50 ? "#dc2626" : "#2563eb"} 
                  strokeWidth={3} 
                  fillOpacity={0.2}
                  fill={currentLevel > 50 ? "#fee2e2" : "#dbeafe"} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLONNE DROITE : INDICATEURS & IA */}
        <div className="space-y-6">
          
          {/* GROS CHIFFRE */}
          <div className={`p-8 rounded-3xl shadow-lg transition-colors duration-500 ${
            currentLevel > 50 ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-slate-800 border border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-2 opacity-80">
              <Droplets size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Taux d'eau détecté</span>
            </div>
            <p className="text-6xl font-black">{currentLevel.toFixed(1)}%</p>
            {currentLevel > 50 && (
               <div className="mt-4 pt-4 border-t border-white/20 text-sm font-bold flex items-center gap-2">
                 <AlertTriangle size={18} /> SEUIL D'ALERTE DÉPASSÉ
               </div>
            )}
          </div>

          {/* RAPPORT LLM */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 min-h-[200px] flex flex-col">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-xs uppercase tracking-widest text-purple-600">
                <FileText size={16} /> Rapport Expert IA
             </h3>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1 overflow-y-auto custom-scrollbar">
               <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                 {llmReport || "Le rapport s'affichera ici en cas de détection d'inondation..."}
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;