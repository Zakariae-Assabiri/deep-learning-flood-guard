import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Archive, 
  Image as ImageIcon
} from 'lucide-react';

const Analyse = () => {
  const FLASK_API_URL ="http://192.168.11.197:5001/predict";

  const [chartData, setChartData] = useState(() => {
    const saved = localStorage.getItem('oued_chart_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessionStartTime, setSessionStartTime] = useState(() => {
    return localStorage.getItem('oued_session_start') || new Date().toLocaleString('fr-FR');
  });

  const [llmReport, setLlmReport] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('oued_chart_v2', JSON.stringify(chartData));
    localStorage.setItem('oued_session_start', sessionStartTime);
  }, [chartData, sessionStartTime]);

  const processImage = async (imageBlob, base64Preview) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageBlob, 'capture.jpg');

    try {
      const response = await fetch(FLASK_API_URL, { 
        method: 'POST', 
        body: formData 
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert("Erreur Serveur: " + data.error);
        return;
      }

      const newLevel = parseFloat(data.level.toFixed(2));
      const newPoint = { 
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), 
        level: newLevel,
        status: data.status, // On récupère le statut (Inondation/Normal) du serveur
        img: base64Preview,
        report: data.rapport
      };
      
      setChartData(prev => [...prev, newPoint]); 
      setLlmReport(data.rapport);

    } catch (error) {
      console.error(error);
      alert("Connexion impossible au serveur Flask. Vérifiez qu'il est lancé.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (chartData.length === 0) setSessionStartTime(new Date().toLocaleString('fr-FR'));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      processImage(file, reader.result);
    };
  };

  const handleArchiveAndReset = () => {
    if (chartData.length === 0) return alert("Aucune donnée.");
    const ouedName = prompt("Nom de l'Oued :");
    if (ouedName) {
      const archive = { id: Date.now(), name: ouedName, start: sessionStartTime, end: new Date().toLocaleString('fr-FR'), data: chartData };
      const existing = JSON.parse(localStorage.getItem('oued_archives') || '[]');
      localStorage.setItem('oued_archives', JSON.stringify([archive, ...existing]));
      setChartData([]);
      setLlmReport("");
      setSessionStartTime(new Date().toLocaleString('fr-FR'));
      alert("Session archivée !");
    }
  };

  const lastAnalysis = chartData[chartData.length - 1];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      
      {/* HEADER : Titre et Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Surveillance IA Oued</h1>
          <p className="text-slate-500 text-xs mt-1">Analyse automatique par Segmentation U-Net</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <label className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-100 transition-all font-bold">
            <Upload size={20} />
            <span>{loading ? "ANALYSE..." : "ANALYSER IMAGE"}</span>
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={loading} />
          </label>

          <button onClick={handleArchiveAndReset} className="bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold">
            <Archive size={20} />
            <span>ARCHIVE</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPHIQUE */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 uppercase text-xs tracking-widest">
            <TrendingUp size={18} className="text-blue-600" /> Historique des niveaux détectés
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{fill: '#94a3b8', fontSize: 11}} />
                <YAxis domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip />
                <Area type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={4} fill="url(#colorL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VERDICT & RAPPORT */}
        <div className="space-y-6">
          {lastAnalysis ? (
            <div className={`p-8 rounded-3xl shadow-xl transition-all duration-500 ${lastAnalysis.status === 'Inondation' ? 'bg-red-600 text-white shadow-red-200' : 'bg-emerald-500 text-white shadow-emerald-200'}`}>
              <div className="flex justify-between items-start mb-6 font-black uppercase tracking-widest text-[10px]">
                {lastAnalysis.status === 'Inondation' ? <AlertTriangle size={28} /> : <CheckCircle size={28} />}
                <span>Verdict IA</span>
              </div>
              <p className="text-xs uppercase font-bold opacity-80">Saturation mesurée</p>
              <p className="text-7xl font-black leading-none">{lastAnalysis.level}%</p>
              <p className="mt-6 text-sm font-semibold border-t border-white/20 pt-4 uppercase">
                {lastAnalysis.status === 'Inondation' ? "DANGER : CRUE DÉTECTÉE" : "SÉCURITÉ : NIVEAU STABLE"}
              </p>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 text-center">
              <ImageIcon size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase">En attente d'une analyse</p>
            </div>
          )}

          
        </div>

      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-xs uppercase tracking-widest text-purple-600">
              <FileText size={16} /> Rapport Expert Mistral-AI
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[100px]">
              <p className="text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap font-medium">
                {llmReport || "Le rapport automatique s'affichera après l'analyse de l'image."}
              </p>
            </div>
          </div>

      {/* GALERIE HISTORIQUE */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-3 uppercase text-xs tracking-widest mb-8">
          <ImageIcon size={20} className="text-blue-600" /> Galerie des dernières analyses
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {chartData.map((point, index) => (
            <div key={index} className="rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all group bg-slate-50">
              <img src={point.img} alt="Capture" className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
              <div className="p-3 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400">{point.time}</span>
                <span className={`text-[10px] font-black ${point.status === 'Inondation' ? 'text-red-600' : 'text-emerald-500'}`}>
                  {point.level}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analyse;