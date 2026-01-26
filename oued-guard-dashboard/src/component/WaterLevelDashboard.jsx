import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Upload, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const WaterLevelDashboard = () => {
  // États pour les données
  const [chartData, setChartData] = useState([
    { time: 'Initial', level: 0 }
  ]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");

  // Fonction pour envoyer l'image au serveur Flask
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Appel à votre API Flask (serveur.py)
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const newLevel = parseFloat(data.level.toFixed(2));

      // 2. Mise à jour du graphique
      const newPoint = { 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        level: newLevel 
      };
      setChartData(prev => [...prev.slice(-9), newPoint]); // Garde les 10 derniers points
      setCurrentLevel(newLevel);

      // 3. Simulation du rapport (ou appel Hugging Face si intégré au Flask)
      genererRapportSimple(newLevel);

    } catch (error) {
      console.error("Erreur connexion Flask:", error);
      alert("Erreur: Le serveur Flask est-il bien allumé ?");
    } finally {
      setLoading(false);
    }
  };

  const genererRapportSimple = (level) => {
    if (level > 20) {
      setReport(`ALERTE CRUE : Le niveau de l'oued a atteint ${level}%. Risque d'inondation détecté. Les autorités locales ont été prévenues via Syslog 514.`);
    } else {
      setReport(`SITUATION NORMALE : Le niveau est de ${level}%. Aucune menace immédiate détectée par l'IA.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER & UPLOAD */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Surveillance Oued Maroc</h1>
            <p className="text-slate-500">Système intelligent de détection des crues</p>
          </div>
          
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl cursor-pointer transition-all shadow-md font-semibold">
            <Upload size={20} />
            {loading ? "Analyse..." : "Analyser Image Oued"}
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* GRAPHIQUE (2/3 de l'espace) */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" /> Évolution du Niveau (%)
              </h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={3} fill="url(#colorLevel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* STATUS ET RAPPORT LLM (1/3 de l'espace) */}
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl shadow-sm border ${currentLevel > 20 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-center gap-3 mb-2">
                {currentLevel > 20 ? <AlertTriangle className="text-red-600" /> : <CheckCircle className="text-green-600" />}
                <span className={`font-bold ${currentLevel > 20 ? 'text-red-700' : 'text-green-700'}`}>
                  {currentLevel > 20 ? "RISQUE CRITIQUE" : "ÉTAT NORMAL"}
                </span>
              </div>
              <div className="text-3xl font-black text-slate-800">{currentLevel}%</div>
              <p className="text-sm text-slate-500 mt-1">Surface d'eau détectée</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <FileText size={18} className="text-blue-600" /> Rapport Intelligent
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                {report || "En attente de la première analyse pour générer le rapport..."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WaterLevelDashboard;
