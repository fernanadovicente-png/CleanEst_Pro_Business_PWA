import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { getSetting } from "./utils/storage";

export default function Vitres({ onBack }) {
  const [mode, setMode] = useState("both");
  const [notes, setNotes] = useState("");

  // 🧾 Infos client
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [adresse, setAdresse] = useState("");
  const [tel, setTel] = useState("");
  const [tarif, setTarif] = useState(Number(getSetting("tarifHoraire", 0)) || 0);

  // 🧩 Base (vitres int/ex + rendement + stores ex)
  const base = {
    petiteFenetre: { label: "Petite fenêtre", in: +getSetting("vitres.petiteFenetre.in", 0), ex: +getSetting("vitres.petiteFenetre.ex", 0) },
    fenetreStandard: { label: "Fenêtre standard", in: +getSetting("vitres.fenetreStandard.in", 0), ex: +getSetting("vitres.fenetreStandard.ex", 0) },
    grandeBaie: { label: "Grande baie vitrée", in: +getSetting("vitres.grandeBaie.in", 0), ex: +getSetting("vitres.grandeBaie.ex", 0) },
    porteVitree: { label: "Porte vitrée", in: +getSetting("vitres.porteVitree.in", 0), ex: +getSetting("vitres.porteVitree.ex", 0) },
    vitrine: { label: "Vitrine (m²)", rendement: +getSetting("vitres.vitrine.rendement", 25) },
    storePetit: { label: "Petit store", ex: +getSetting("vitres.storePetit", 0) },
    storeStandard: { label: "Store standard", ex: +getSetting("vitres.storeStandard", 0) },
    storeGrand: { label: "Grand store / motorisé", ex: +getSetting("vitres.storeGrand", 0) },
  };

  const [rows, setRows] = useState({
    petiteFenetre: { total: 0, haut: 0, sale: 0 },
    fenetreStandard: { total: 0, haut: 0, sale: 0 },
    grandeBaie: { total: 0, haut: 0, sale: 0 },
    porteVitree: { total: 0, haut: 0, sale: 0 },
    vitrine: { m2: 0, sale: 0 },
    storePetit: { total: 0, haut: 0, sale: 0 },
    storeStandard: { total: 0, haut: 0, sale: 0 },
    storeGrand: { total: 0, haut: 0, sale: 0 },
  });

  const clamp = (v) => Math.max(0, Math.floor(Number(v) || 0));
  const setField = (k, field, val) => setRows((p) => ({ ...p, [k]: { ...p[k], [field]: clamp(val) } }));

  // h/unité
  const perUnit = (k) => {
    const t = base[k];
    if (!t) return 0;
    if (["storePetit", "storeStandard", "storeGrand"].includes(k)) return t.ex;
    if (mode === "both") return (t.in || 0) + (t.ex || 0);
    if (mode === "in") return t.in || 0;
    return t.ex || 0;
  };

  // calcul horaire
  const calcLine = (k) => {
    if (k === "vitrine") {
      const m2 = +rows.vitrine.m2 || 0;
      if (!m2) return 0;
      let h = m2 / base.vitrine.rendement;
      if (mode === "ex") h /= 2;
      if (rows.vitrine.sale) h *= 1.2;
      return h;
    }

    const r = rows[k];
    const h = perUnit(k);
    let total = r.total * h;

    if (r.haut > 0) total += r.haut * h * 0.3; // +30%
    if (r.sale > 0) total += r.sale * h * 0.2; // +20%
    return total;
  };

  const order = ["petiteFenetre", "fenetreStandard", "grandeBaie", "porteVitree", "vitrine", "storePetit", "storeStandard", "storeGrand"];
  const totalHours = useMemo(() => order.reduce((s, k) => s + calcLine(k), 0), [rows, mode]);
  const totalPrix = (totalHours * tarif).toFixed(2);

  // 📄 PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16).text("💙 CleanEst Pro Business", 10, y);
    y += 8;
    doc.setFontSize(12).text("Vitres & Stores – Estimation professionnelle", 10, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Client : ${client || "-"}`, 10, y); y += 6;
    doc.text(`Date : ${date || new Date().toLocaleDateString()}`, 10, y); y += 6;
    if (adresse) { doc.text(`Adresse : ${adresse}`, 10, y); y += 6; }
    if (tel) { doc.text(`Téléphone : ${tel}`, 10, y); y += 6; }
    doc.text(`Tarif horaire : ${tarif.toFixed(2)} CHF/h`, 10, y); y += 8;

    order.forEach((k) => {
      const h = calcLine(k);
      if (h <= 0) return;
      const label = base[k]?.label || k;
      doc.text(`${label}: ${h.toFixed(2)} h`, 10, y);
      y += 6;
    });

    y += 6;
    doc.setFontSize(12).text(`Total: ${totalHours.toFixed(2)} h`, 10, y); y += 6;
    doc.text(`Montant: ${totalPrix} CHF`, 10, y); y += 8;

    if (notes.trim()) {
      doc.setFontSize(11).text("Observations:", 10, y);
      y += 5;
      doc.setFontSize(10).text(doc.splitTextToSize(notes.trim(), 180), 10, y);
    }

    doc.save("Vitres_Stores_Estimation.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-xl font-semibold text-sky-700">Vitres & Stores – Estimation</h2>

      {/* Infos client */}
      <section className="bg-white rounded-xl shadow p-4 space-y-2">
        <h3 className="font-semibold text-sky-700">Informations du devis</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="👤 Nom du client" value={client} onChange={(e) => setClient(e.target.value)} />
          <input className="border rounded p-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="border rounded p-2" placeholder="🏠 Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          <input className="border rounded p-2" placeholder="📞 Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} />
          <div className="flex items-center gap-2">
            💰
            <input className="w-24 border rounded p-1 text-center" type="number" min="0" value={tarif} onChange={(e) => setTarif(Number(e.target.value) || 0)} />
            <span>CHF/h</span>
          </div>
        </div>
      </section>

      {/* Mode */}
      <div className="bg-white rounded-xl shadow p-3 flex flex-wrap gap-6 text-sm">
        {[
          ["both", "✅", "Nettoyage complet"],
          ["in", "🧴", "Intérieur seulement"],
          ["ex", "💧", "Extérieur seulement"],
        ].map(([val, icon, text]) => (
          <label key={val} className="flex items-center gap-2">
            <input type="radio" checked={mode === val} onChange={() => setMode(val)} />
            <span className="flex items-center gap-1 text-sky-700">{icon} {text}</span>
          </label>
        ))}
      </div>

      {/* Tableau */}
      <div className="grid grid-cols-7 gap-2 bg-slate-100 font-semibold text-center py-2 rounded-xl">
        <div>Type</div>
        <div>Qté</div>
        <div>Haut</div>
        <div>Très sale</div>
        <div>—</div>
        <div>h/unité</div>
        <div>Total(h)</div>
      </div>

      {order.map((k) => {
        const r = rows[k];
        const h = calcLine(k);
        const isVitrine = k === "vitrine";
        return (
          <div key={k} className="grid grid-cols-7 gap-2 bg-white rounded-xl shadow p-2 text-center items-center">
            <div className="font-medium text-slate-700">{base[k]?.label}</div>
            {!isVitrine ? (
              <>
                <input type="number" min="0" className="w-14 border rounded p-1 text-center" value={r.total} onChange={(e) => setField(k, "total", e.target.value)} />
                <input type="number" min="0" className="w-14 border rounded p-1 text-center" value={r.haut} onChange={(e) => setField(k, "haut", e.target.value)} />
                <input type="number" min="0" className="w-14 border rounded p-1 text-center" value={r.sale} onChange={(e) => setField(k, "sale", e.target.value)} />
                <div>—</div>
                <div>{perUnit(k).toFixed(2)}h</div>
                <div className="font-semibold text-green-700">{h.toFixed(2)}h</div>
              </>
            ) : (
              <>
                <input type="number" min="0" className="w-20 border rounded p-1 text-center col-span-2" value={r.m2} onChange={(e) => setField(k, "m2", e.target.value)} />
                <div className="col-span-2">
                  <label className="flex items-center justify-center gap-2">
                    <input type="checkbox" checked={r.sale} onChange={(e) => setField(k, "sale", e.target.checked ? 1 : 0)} />
                    <span className="text-sm text-slate-600">Très sale (+20%)</span>
                  </label>
                </div>
                <div>{base.vitrine.rendement}m²/h</div>
                <div className="font-semibold text-green-700">{h.toFixed(2)}h</div>
              </>
            )}
          </div>
        );
      })}

      {/* Totaux */}
      <div className="text-right font-semibold text-lg text-sky-700">
        ⏱️ {totalHours.toFixed(2)} h — 💰 {totalPrix} CHF
      </div>

      {/* Notes */}
      <textarea className="w-full border rounded-xl p-3" placeholder="Observations / remarques..." value={notes} onChange={(e) => setNotes(e.target.value)} />

      {/* Boutons */}
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
