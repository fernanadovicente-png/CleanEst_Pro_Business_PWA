import React, { useState } from "react";
import { getSetting, saveSetting } from "./utils/storage";
import FinDeBail from "./FinDeBail.jsx";
import FinDeChantier from "./FinDeChantier.jsx";
import Vitres from "./Vitres.jsx";
import Autres from "./Autres.jsx";
import ParametresTemps from "./ParametresTemps.jsx";
import EntretienRegulier from "./EntretienRegulier.jsx";

export default function App() {
  const [started, setStarted] = useState(false);
  const [service, setService] = useState(null);
  const [hourFormat, setHourFormat] = useState(getSetting("hourFormat", null));

  const selectFormat = (val) => {
    saveSetting("hourFormat", val);
    setHourFormat(val);
  };

  const resetFormat = () => {
    saveSetting("hourFormat", null);
    setHourFormat(null);
  };

  if (!hourFormat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 to-white text-center space-y-8">
        <h1 className="text-3xl font-bold text-sky-700">💙 CleanEst Pro Business</h1>
        <p className="text-slate-600">Choisissez votre format d’heures préféré :</p>
        <div className="flex gap-6">
          <button onClick={() => selectFormat("decimal")} className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl text-lg shadow">
            Décimal<br /><span className="text-sm">(1.5h)</span>
          </button>
          <button onClick={() => selectFormat("hhmm")} className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl text-lg shadow">
            HH:MM<br /><span className="text-sm">(1h30)</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-6">Ce choix peut être modifié plus tard dans les paramètres ⚙️</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-sky-700">💙 CleanEst Pro Business</h1>
          <p className="text-slate-600">Application professionnelle d’estimation de nettoyage</p>
          <button onClick={() => setStarted(true)} className="bg-sky-600 text-white px-8 py-3 rounded-xl text-lg hover:shadow-lg">🚀 Démarrer</button>
          <button onClick={resetFormat} className="text-xs text-slate-500 underline mt-3">🔁 Modifier le format d’heures</button>
        </div>
        <footer className="text-center text-xs text-slate-500 py-6">Installable • Offline • Multi-langue (bientôt)</footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center">
      {!service ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <h1 className="text-2xl font-bold text-sky-700">💙 CleanEst Pro Business</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onClick={() => setService("bail")} className="bg-sky-600 text-white px-4 py-2 rounded-xl hover:shadow-lg">Fin de bail</button>
            <button onClick={() => setService("chantier")} className="bg-sky-600 text-white px-4 py-2 rounded-xl hover:shadow-lg">Fin de chantier</button>
            <button onClick={() => setService("vitres")} className="bg-sky-600 text-white px-4 py-2 rounded-xl hover:shadow-lg">Vitres & Stores</button>
            <button onClick={() => setService("autres")} className="bg-sky-600 text-white px-4 py-2 rounded-xl hover:shadow-lg">Autres prestations</button>
            <button onClick={() => setService("entretien")} className="bg-sky-600 text-white px-4 py-2 rounded-xl hover:shadow-lg">Entretien régulier</button>
            <button onClick={() => setService("params")} className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:shadow-lg">Paramètres des temps</button>
          </div>
        </div>
      ) : (
        <>
          {service === "bail" && <FinDeBail onBack={() => setService(null)} />}
          {service === "chantier" && <FinDeChantier onBack={() => setService(null)} />}
          {service === "vitres" && <Vitres onBack={() => setService(null)} />}
          {service === "autres" && <Autres onBack={() => setService(null)} />}
          {service === "params" && <ParametresTemps onBack={() => setService(null)} />}
          {service === "entretien" && <EntretienRegulier onBack={() => setService(null)} />}
        </>
      )}
      <footer className="text-center text-xs text-slate-500 py-6">Installable • Offline • Multi-langue (bientôt)</footer>
    </div>
  );
}
