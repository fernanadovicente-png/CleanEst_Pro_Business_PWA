import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { getSetting } from "./utils/storage";

export default function Autres({ onBack }) {
  // 🧾 Infos client
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [adresse, setAdresse] = useState("");
  const [tel, setTel] = useState("");
  const [tarif, setTarif] = useState(Number(getSetting("tarifHoraire", 0)) || 0);
  const [notes, setNotes] = useState("");

  // 🔀 Modo: prestations personnalisées | méthodes
  const [mode, setMode] = useState("custom");

  // -------------------------------
  // 1️⃣ Prestations personnalisées
  // -------------------------------
  const [titrePerso, setTitrePerso] = useState("Prestations personnalisées");
  const [customRows, setCustomRows] = useState([{ nom: "", heures: 0, qte: 1 }]);

  const addCustom = () => setCustomRows((p) => [...p, { nom: "", heures: 0, qte: 1 }]);
  const setCustomField = (i, k, v) =>
    setCustomRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const removeCustom = (i) => setCustomRows((p) => p.filter((_, idx) => idx !== i));

  const totalHeuresCustom = useMemo(
    () => customRows.reduce((s, r) => s + (Number(r.heures) || 0) * (Number(r.qte) || 0), 0),
    [customRows]
  );

  // -------------------------------
  // 2️⃣ Méthodes m²/h — Lê os rendements guardados nos parâmetros
  // -------------------------------
  const saved = getSetting("autresList") || []; // Corrigido para bater com ParametresTemps
  const baseMethods = saved.map((m) => ({ ...m, surface: 0 }));

  const [methods, setMethods] = useState(baseMethods.length ? baseMethods : []);
  const addMethod = () => setMethods((m) => [...m, { id: Date.now(), nom: "", rendement: 0, surface: 0 }]);
  const setMethodField = (id, key, val) => setMethods((rows) => rows.map((r) => (r.id === id ? { ...r, [key]: val } : r)));

  const heuresFor = (r) => {
    const s = Number(r.surface) || 0;
    const rdm = Number(r.rendement) || 0;
    if (s <= 0 || rdm <= 0) return 0;
    return s / rdm;
  };

  const totalHeuresMethods = useMemo(() => methods.reduce((s, r) => s + heuresFor(r), 0), [methods]);

  // Totais globais
  const totalHeures = mode === "custom" ? totalHeuresCustom : totalHeuresMethods;
  const totalPrix = useMemo(() => totalHeures * (Number(tarif) || 0), [totalHeures, tarif]);

  // PDF simplificado
  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16).text("💙 CleanEst Pro Business", 10, y); y += 8;
    doc.setFontSize(12).text(mode === "custom" ? titrePerso : "Méthodes de nettoyage (m²/h)", 10, y); y += 10;
    doc.setFontSize(11);
    doc.text(`Client : ${client || "-"}`, 10, y); y += 6;
    doc.text(`Date : ${date || new Date().toLocaleDateString()}`, 10, y); y += 6;
    doc.text(`Tarif : ${tarif} CHF/h`, 10, y); y += 8;

    if (mode === "custom") {
      customRows.forEach((r) => {
        const h = (r.heures || 0) * (r.qte || 0);
        if (h > 0) doc.text(`• ${r.nom || "Sans nom"} – ${h.toFixed(2)} h`, 10, y), y += 5;
      });
    } else {
      methods.forEach((r) => {
        const h = heuresFor(r);
        if (h > 0) doc.text(`• ${r.nom}: ${r.surface}m² ÷ ${r.rendement} = ${h.toFixed(2)}h`, 10, y), y += 5;
      });
    }
    doc.text(`Total: ${totalHeures.toFixed(2)} h — ${totalPrix.toFixed(2)} CHF`, 10, y + 10);
    doc.save("Autres.pdf");
  };

  // Interface
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-xl font-semibold text-sky-700">Autres – Module avancé</h2>

      {/* Infos client */}
      <section className="bg-white rounded-xl shadow p-4 space-y-2">
        <h3 className="font-semibold text-sky-700">Informations du devis</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="👤 Nom du client" value={client} onChange={(e) => setClient(e.target.value)} />
          <input className="border rounded p-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="border rounded p-2" placeholder="🏠 Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          <input className="border rounded p-2" placeholder="📞 Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} />
          <div className="flex items-center gap-2">
            💰<input className="w-24 border rounded p-1 text-center" type="number" min="0" value={tarif} onChange={(e) => setTarif(Number(e.target.value) || 0)} />
            <span>CHF/h</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex justify-center gap-3">
        <button onClick={() => setMode("custom")} className={`px-4 py-2 rounded-xl ${mode === "custom" ? "bg-sky-600 text-white" : "bg-white shadow"}`}>
          Prestations personnalisées
        </button>
        <button onClick={() => setMode("methods")} className={`px-4 py-2 rounded-xl ${mode === "methods" ? "bg-sky-600 text-white" : "bg-white shadow"}`}>
          Méthodes (m²/h)
        </button>
      </div>

      {/* Content */}
      {mode === "custom" ? (
        <section className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sky-700">{titrePerso}</h3>
            <input
              className="border rounded p-2 text-sm w-64"
              placeholder="Renommer cette section..."
              value={titrePerso}
              onChange={(e) => setTitrePerso(e.target.value)}
            />
          </div>

          {customRows.map((r, i) => {
            const h = (Number(r.heures) || 0) * (Number(r.qte) || 0);
            return (
              <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white rounded-xl shadow p-2">
                <input className="col-span-6 border rounded p-2" placeholder="Nom de la prestation" value={r.nom} onChange={(e) => setCustomField(i, "nom", e.target.value)} />
                <input type="number" min="0" step="0.1" className="col-span-2 border rounded p-2 text-center" value={r.heures} onChange={(e) => setCustomField(i, "heures", Number(e.target.value))} />
                <input type="number" min="0" className="col-span-2 border rounded p-2 text-center" value={r.qte} onChange={(e) => setCustomField(i, "qte", Number(e.target.value))} />
                <div className="col-span-2 text-center font-semibold">{h.toFixed(2)}</div>
                <button onClick={() => removeCustom(i)} className="text-red-500 font-bold px-2 hover:text-red-700">✕</button>
              </div>
            );
          })}

          <button onClick={addCustom} className="mt-2 text-sky-600 font-medium hover:underline">
            ➕ Ajouter une prestation
          </button>
        </section>
      ) : (
        <section className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="font-semibold text-sky-700">Méthodes de nettoyage (m²/h)</h3>
          {methods.map((r) => {
            const h = heuresFor(r);
            return (
              <div key={r.id} className="grid grid-cols-12 gap-2 items-center bg-white rounded-xl shadow p-2">
                <input className="col-span-6 border rounded p-2" value={r.nom} onChange={(e) => setMethodField(r.id, "nom", e.target.value)} />
                <input type="number" min="0" className="col-span-2 border rounded p-2 text-center" value={r.surface} onChange={(e) => setMethodField(r.id, "surface", Number(e.target.value))} />
                <input type="number" min="0" className="col-span-2 border rounded p-2 text-center" value={r.rendement} onChange={(e) => setMethodField(r.id, "rendement", Number(e.target.value))} />
                <div className="col-span-2 text-center font-semibold">{h.toFixed(2)}</div>
              </div>
            );
          })}
          <button onClick={addMethod} className="mt-2 text-sky-600 font-medium hover:underline">
            ➕ Ajouter une méthode
          </button>
        </section>
      )}

      {/* Résumé */}
      <div className="text-right font-semibold text-lg text-sky-700">
        ⏱️ {totalHeures.toFixed(2)} h — 💰 {totalPrix.toFixed(2)} CHF
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <button onClick={generatePDF} className="bg-sky-600 text-white px-6 py-2 rounded-xl hover:shadow-lg">
          📄 Générer PDF
        </button>
        <button onClick={onBack} className="bg-gray-400 text-white px-6 py-2 rounded-xl hover:shadow-lg">
          ↩ Retour
        </button>
      </div>
    </div>
  );
}