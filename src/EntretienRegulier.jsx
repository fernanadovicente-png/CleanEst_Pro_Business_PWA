import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { getSetting } from "./utils/storage";

// ⏱ multiplicadores por frequência (lidos dos Paramètres se existirem)
const FREQS = {
  "Quotidien":  Number(getSetting("freqs.Quotidien", 0.8)),
  "Hebdomadaire": Number(getSetting("freqs.Hebdomadaire", 1.0)),
  "Bimensuel": Number(getSetting("freqs.Bimensuel", 1.3)),
  "Mensuel": Number(getSetting("freqs.Mensuel", 1.6)),
  "Trimestriel": Number(getSetting("freqs.Trimestriel", 2.0)),
  "Semestriel": Number(getSetting("freqs.Semestriel", 2.5)),
  "Annuel": Number(getSetting("freqs.Annuel", 3.0)),
};

// 🔗 Mapas 100% alinhados com ParametresTemps.jsx
const MAPS = {
  admin: [
    { label: "Bureau", key: "bureau", type: "m2" },
    { label: "Salle de réunion", key: "salleReunion", type: "m2" },
    { label: "Toilettes, buanderies et douches", key: "toilettes", type: "m2" },
    { label: "Kitchenettes", key: "kitchenettes", type: "m2" },
    { label: "Espaces communs", key: "communs", type: "m2" },
    { label: "Vestiaires", key: "vestiaires", type: "m2" },
    { label: "Ascenseurs", key: "ascenseurs", type: "m2" },
    { label: "Couloirs", key: "couloirs", type: "m2" },
    { label: "Halls d’entrée", key: "halls", type: "m2" },
    { label: "Cages d’escaliers", key: "cagesEscaliers", type: "m2" },
    { label: "Locaux de service", key: "locauxService", type: "m2" },
  ],
  hopital: [
    { label: "Bureaux de l’administration", key: "bureaux", type: "m2" },
    { label: "Salle de réunion", key: "salleReunion", type: "m2" },
    { label: "Toilettes, buanderies, douches, salles de bain", key: "toilettes", type: "m2" },
    { label: "Kitchenettes", key: "kitchenettes", type: "m2" },
    { label: "Espaces communs", key: "communs", type: "m2" },
    { label: "Vestiaires", key: "vestiaires", type: "m2" },
    { label: "Ascenseurs", key: "ascenseurs", type: "m2" },
    { label: "Couloirs", key: "couloirs", type: "m2" },
    { label: "Halls d’entrée", key: "halls", type: "m2" },
    { label: "Cages d’escaliers", key: "cagesEscaliers", type: "m2" },
    { label: "Locaux de service", key: "locauxService", type: "m2" },
    { label: "Chambres de patients", key: "chambres", type: "m2" },
    { label: "Bloc opératoire (nettoyage final)", key: "blocOperatoire", type: "m2" },
    { label: "Zones de passage intense", key: "zonesPassage", type: "m2" },
    { label: "Espaces fonctionnels, pièces d’auscultation", key: "espacesFonctionnels", type: "m2" },
  ],
  ecole: [
    { label: "Bureaux de l’administration", key: "bureaux", type: "m2" },
    { label: "Salle de réunion", key: "salleReunion", type: "m2" },
    { label: "Toilettes, buanderies et douches", key: "toilettes", type: "m2" },
    { label: "Kitchenettes", key: "kitchenettes", type: "m2" },
    { label: "Espaces communs", key: "communs", type: "m2" },
    { label: "Vestiaires", key: "vestiaires", type: "m2" },
    { label: "Ascenseurs", key: "ascenseurs", type: "m2" },
    { label: "Couloirs", key: "couloirs", type: "m2" },
    { label: "Halls d’entrée (aula)", key: "halls", type: "m2" },
    { label: "Cages d’escaliers", key: "cagesEscaliers", type: "m2" },
    { label: "Locaux de service", key: "locauxService", type: "m2" },
    { label: "Salles de classe", key: "sallesClasse", type: "m2" },
    { label: "Installations sportives et salles polyvalentes", key: "installationsSportives", type: "m2" },
  ],
  medico: [
    { label: "Bureaux de l’administration", key: "bureaux", type: "m2" },
    { label: "Salle de réunion", key: "salleReunion", type: "m2" },
    { label: "Toilettes, buanderies et douches", key: "toilettes", type: "m2" },
    { label: "Kitchenettes", key: "kitchenettes", type: "m2" },
    { label: "Espaces communs", key: "communs", type: "m2" },
    { label: "Vestiaires", key: "vestiaires", type: "m2" },
    { label: "Ascenseurs", key: "ascenseurs", type: "m2" },
    { label: "Couloirs", key: "couloirs", type: "m2" },
    { label: "Halls d’entrée", key: "halls", type: "m2" },
    { label: "Cages d’escaliers", key: "cagesEscaliers", type: "m2" },
    { label: "Locaux de service", key: "locauxService", type: "m2" },
    { label: "Chambre des résidents", key: "chambres", type: "m2" },
  ],
  residentiel: [
    // unitários (h/unité) — S/X
    { label: "Four", key: "four", type: "unit" },
    { label: "Hotte", key: "hotte", type: "unit" },
    { label: "Micro-ondes", key: "microOndes", type: "unit" },
    { label: "Frigo", key: "frigo", type: "unit" },
    { label: "Lave-vaisselle", key: "laveVaisselle", type: "unit" },
    { label: "Lave-linge", key: "laveLinge", type: "unit" },
    // m²/h
    { label: "Cuisine", key: "cuisine", type: "m2" },
    { label: "Salle de bain", key: "salleDeBain", type: "m2" },
    { label: "WC", key: "wc", type: "m2" },
    { label: "Chambres", key: "chambres", type: "m2" },
    { label: "Salon", key: "salon", type: "m2" },
    { label: "Entrée / Couloir", key: "entreeCouloir", type: "m2" },
    { label: "Murs / Plinthes", key: "mursPlinthes", type: "m2" },
    { label: "Cage d’escalier", key: "cageEscalier", type: "m2" },
    { label: "Ascenseur", key: "ascenseur", type: "m2" },
    { label: "Buanderie", key: "buanderie", type: "m2" },
    { label: "Local technique", key: "localTechnique", type: "m2" },
    { label: "Garage", key: "garage", type: "m2" },
    { label: "Cave", key: "cave", type: "m2" },
    { label: "Grenier", key: "grenier", type: "m2" },
    { label: "Parking", key: "parking", type: "m2" },
    { label: "Extérieurs / trottoirs", key: "exterieurs", type: "m2" },
  ],
};

// UI classes
const input = "border rounded p-2";
const small = "w-24 border rounded p-1 text-center";
const btn = "bg-sky-600 text-white px-4 py-2 rounded-xl hover:shadow-lg";

export default function EntretienRegulier({ onBack }) {
  const [cat, setCat] = useState(null);

  // Cabeçalho
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [adresse, setAdresse] = useState("");
  const [tel, setTel] = useState("");
  const [tarif, setTarif] = useState(Number(getSetting("tarifHoraire", 0)) || 0);
  const [notes, setNotes] = useState("");

  // Construir linhas a partir dos mapas + rendements guardados em Paramètres
  const makeRows = (key) =>
    MAPS[key].map(({ label, key: k, type }) => {
      const rend = Number(getSetting(`entretien.${key}.${k}`, 0)) || 0;
      if (type === "unit") {
        return { nom: label, key: k, type, selected: false, rendement: rend, freq: "Hebdomadaire", surface: 0 };
      }
      return { nom: label, key: k, type, surface: 0, rendement: rend, freq: "Hebdomadaire" };
    });

  const [rows, setRows] = useState({
    admin: makeRows("admin"),
    hopital: makeRows("hopital"),
    ecole: makeRows("ecole"),
    medico: makeRows("medico"),
    residentiel: makeRows("residentiel"),
  });

  const setField = (i, key, val) =>
    setRows((p) => ({
      ...p,
      [cat]: p[cat].map((r, idx) => (idx === i ? { ...r, [key]: val } : r)),
    }));

  // cálculo por linha (freq vertical/independente)
  const hoursLine = (r) => {
    const mult = FREQS[r.freq] || 1;
    if (r.type === "unit") {
      return r.selected ? (Number(r.rendement) || 0) * mult : 0;
    }
    const s = Number(r.surface) || 0;
    const rd = Number(r.rendement) || 0;
    if (s <= 0 || rd <= 0) return 0;
    return (s / rd) * mult;
  };

  const totalH = useMemo(() => {
    if (!cat) return 0;
    return rows[cat].reduce((sum, r) => sum + hoursLine(r), 0);
  }, [rows, cat]);

  const totalCHF = totalH * (Number(tarif) || 0);

  // PDF
  const generatePDF = () => {
    if (!cat) return;
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16).text("💙 CleanEst Pro Business", 10, y); y += 8;
    doc.setFontSize(12).text(`Entretien – ${titleOf(cat)}`, 10, y); y += 10;

    doc.setFontSize(11);
    doc.text(`Client : ${client || "-"}`, 10, y); y += 6;
    doc.text(`Date : ${date || new Date().toLocaleDateString()}`, 10, y); y += 6;
    if (adresse) { doc.text(`Adresse : ${adresse}`, 10, y); y += 6; }
    if (tel)     { doc.text(`Téléphone : ${tel}`, 10, y); y += 6; }
    doc.text(`Tarif horaire : ${(Number(tarif) || 0).toFixed(2)} CHF/h`, 10, y); y += 8;

    rows[cat].forEach((r) => {
      const h = hoursLine(r);
      if (h <= 0) return;
      if (r.type === "unit") {
        doc.text(`• ${r.nom} — ${r.freq} — ${r.selected ? "S" : "X"} → ${h.toFixed(2)} h`, 10, y);
      } else {
        doc.text(`• ${r.nom} — ${r.freq} — ${Number(r.surface) || 0} m² → ${h.toFixed(2)} h`, 10, y);
      }
      y += 5;
    });

    y += 6;
    doc.text(`🕒 Total : ${totalH.toFixed(2)} h`, 10, y); y += 6;
    doc.text(`💰 Montant : ${totalCHF.toFixed(2)} CHF`, 10, y); y += 8;

    const n = (notes || "").trim();
    if (n) {
      doc.text("Observations :", 10, y); y += 5;
      doc.text(doc.splitTextToSize(n, 180), 10, y);
    }

    doc.save(slugify(`Entretien_${titleOf(cat)}`) + ".pdf");
  };

  // helpers
  const titleOf = (k) =>
    k === "admin" ? "🏢 Administration / Bureaux" :
    k === "hopital" ? "🏥 Hôpitaux" :
    k === "ecole" ? "🧒 Écoles / Crèches" :
    k === "medico" ? "🧓 Établissements médico-sociaux" :
    "🏠 Résidentiel / Immeubles";

  const slugify = (s) => (s || "").toLowerCase().replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "");

  // UI
  if (!cat) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-xl font-semibold text-sky-700">🧹 Entretien régulier</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {["admin","hopital","ecole","medico","residentiel"].map((key) => (
            <button key={key} onClick={() => setCat(key)} className={btn}>
              {titleOf(key)}
            </button>
          ))}
        </div>
        <div className="text-center">
          <button onClick={onBack} className="bg-gray-400 text-white px-6 py-2 rounded-xl hover:shadow-lg">
            ↩ Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-xl font-semibold text-sky-700">Entretien – {titleOf(cat)}</h2>

      {/* Infos client */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-semibold text-sky-700">Informations du devis</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input className={input} placeholder="👤 Nom du client" value={client} onChange={(e) => setClient(e.target.value)} />
          <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className={input} placeholder="🏠 Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          <input className={input} placeholder="📞 Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} />
          <div className="flex items-center gap-2">
            <span>💰 Tarif</span>
            <input className={small} type="number" min="0" value={tarif} onChange={(e) => setTarif(Number(e.target.value) || 0)} />
            <span>CHF/h</span>
          </div>
        </div>
      </section>

      {/* Tabela com frequência vertical por linha */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="grid grid-cols-12 gap-2 font-semibold text-center bg-slate-100 rounded-xl py-2">
          <div className="col-span-4">Tâche</div>
          <div className="col-span-3">{cat === "residentiel" ? "S/X ou Surface (m²)" : "Surface (m²)"}</div>
          <div className="col-span-3">Fréquence</div>
          <div className="col-span-2">Heures</div>
        </div>

        {rows[cat].map((r, i) => {
          const h = hoursLine(r);
          return (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white rounded-xl shadow p-2">
              <input className="col-span-4 border rounded p-2 bg-slate-50" value={r.nom} readOnly />
              {r.type === "unit" ? (
                <div className="col-span-3 flex items-center justify-center gap-2">
                  <button
                    className={`px-3 py-1 rounded ${r.selected ? "bg-emerald-500 text-white" : "bg-slate-100"}`}
                    onClick={() => setField(i, "selected", !r.selected)}
                    title="Marcar (S) / Desmarcar (X)"
                  >
                    {r.selected ? "S" : "X"}
                  </button>
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  className="col-span-3 border rounded p-2 text-center"
                  value={r.surface}
                  onChange={(e) => setField(i, "surface", Number(e.target.value))}
                />
              )}
              <select
                className="col-span-3 border rounded p-2 text-center"
                value={r.freq}
                onChange={(e) => setField(i, "freq", e.target.value)}
              >
                {Object.keys(FREQS).map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <div className="col-span-2 text-center font-semibold">{h.toFixed(2)}</div>
            </div>
          );
        })}
      </section>

      <textarea
        className="w-full border rounded-xl p-3"
        placeholder="Observations / remarques..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="text-right font-semibold text-lg text-sky-700">
        ⏱️ {totalH.toFixed(2)} h — 💰 {totalCHF.toFixed(2)} CHF
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={generatePDF} className="bg-sky-600 text-white px-6 py-2 rounded-xl hover:shadow-lg">📄 Générer PDF</button>
        <button onClick={() => setCat(null)} className="bg-gray-400 text-white px-6 py-2 rounded-xl hover:shadow-lg">↩ Retour</button>
      </div>
    </div>
  );
}
