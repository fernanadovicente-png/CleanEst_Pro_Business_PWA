import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import { getSetting } from "./utils/storage";

export default function FinDeBail({ onBack }) {
  const base = {
    cuisine: +getSetting("bail.cuisine", 0),
    salleDeBain: +getSetting("bail.salleDeBain", 0),
    chambres: +getSetting("bail.chambres", 0),
    salon: +getSetting("bail.salon", 0),
    wc: +getSetting("bail.wc", 0),
    localTechnique: +getSetting("bail.localTechnique", 0),
    buanderie: +getSetting("bail.buanderie", 0),
    vitres: +getSetting("bail.vitres", 0),
    stores: +getSetting("bail.stores", 0),
  };

  const [client, setClient] = useState("");
  const [tel, setTel] = useState("");
  const [date, setDate] = useState("");
  const [adresse, setAdresse] = useState("");
  const [tarif, setTarif] = useState(Number(getSetting("tarifHoraire", 0)) || 0);
  const [notes, setNotes] = useState("");

  const [rows, setRows] = useState([
    { nom: "Cuisine", qte: 0, h: base.cuisine },
    { nom: "Salle de bain", qte: 0, h: base.salleDeBain },
    { nom: "Chambres", qte: 0, h: base.chambres },
    { nom: "Salon", qte: 0, h: base.salon },
    { nom: "WC", qte: 0, h: base.wc },
    { nom: "Local technique", qte: 0, h: base.localTechnique },
    { nom: "Buanderie", qte: 0, h: base.buanderie },
    { nom: "Vitres", qte: 0, h: base.vitres },
    { nom: "Stores / Volets", qte: 0, h: base.stores },
  ]);

  const setField = (i, k, v) =>
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  const addRow = () => setRows((p) => [...p, { nom: "", qte: 1, h: 0 }]);
  const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));

  const totalHeures = useMemo(
    () => rows.reduce((s, r) => s + (r.qte || 0) * (r.h || 0), 0),
    [rows]
  );
  const totalPrix = totalHeures * tarif;

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16).text("💙 CleanEst Pro Business", 10, y);
    y += 8;
    doc.setFontSize(12).text("Fin de bail – Estimation", 10, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Client : ${client || "-"}`, 10, y);
    y += 6;
    if (tel) doc.text(`Téléphone : ${tel}`, 10, y), (y += 6);
    if (adresse) doc.text(`Adresse : ${adresse}`, 10, y), (y += 6);
    doc.text(`Date : ${date || new Date().toLocaleDateString()}`, 10, y);
    y += 6;
    doc.text(`Tarif horaire : ${tarif.toFixed(2)} CHF/h`, 10, y);
    y += 8;

    doc.setFontSize(10);
    rows.forEach((r) => {
      const total = (r.qte || 0) * (r.h || 0);
      if (total > 0)
        doc.text(`• ${r.nom || "-"} — ${r.qte} × ${r.h.toFixed(2)}h = ${total.toFixed(2)}h`, 10, y),
          (y += 5);
    });

    y += 6;
    doc.setFontSize(12).text(`Total : ${totalHeures.toFixed(2)} h`, 10, y);
    y += 6;
    doc.text(`Montant : ${totalPrix.toFixed(2)} CHF`, 10, y);

    if (notes.trim()) {
      y += 8;
      doc.setFontSize(11).text("Observations :", 10, y);
      y += 5;
      doc.text(doc.splitTextToSize(notes.trim(), 180), 10, y);
    }

    doc.save("Fin_de_Bail.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-xl font-semibold text-sky-700">Fin de bail – Estimation</h2>
      <section className="bg-white rounded-xl shadow p-4 space-y-2">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="👤 Nom du client" value={client} onChange={(e) => setClient(e.target.value)} />
          <input type="date" className="border rounded p-2" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="border rounded p-2" placeholder="🏠 Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          <input className="border rounded p-2" placeholder="📞 Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} />
          <div className="flex items-center gap-2">
            💰
            <input
              type="number"
              min="0"
              className="w-24 border rounded p-1 text-center"
              value={tarif}
              onChange={(e) => setTarif(Number(e.target.value) || 0)}
            />
            <span>CHF/h</span>
          </div>
        </div>
      </section>

      {/* Tableau */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="grid grid-cols-12 gap-2 font-semibold text-center bg-slate-100 rounded-xl py-2">
          <div className="col-span-5">Prestation</div>
          <div className="col-span-2">Qté</div>
          <div className="col-span-2">Heures</div>
          <div className="col-span-2">Total (h)</div>
          <div className="col-span-1"></div>
        </div>

        {rows.map((r, i) => {
          const total = (r.qte || 0) * (r.h || 0);
          return (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white rounded-xl shadow p-2">
              <input
                className="col-span-5 border rounded p-2"
                value={r.nom}
                onChange={(e) => setField(i, "nom", e.target.value)}
              />
              <input
                type="number"
                min="0"
                className="col-span-2 border rounded p-2 text-center"
                value={r.qte}
                onChange={(e) => setField(i, "qte", Number(e.target.value))}
              />
              <input
                type="number"
                min="0"
                step="0.1"
                className="col-span-2 border rounded p-2 text-center"
                value={r.h}
                onChange={(e) => setField(i, "h", Number(e.target.value))}
              />
              <div className="col-span-2 text-center font-semibold">{total.toFixed(2)}</div>
              <button onClick={() => removeRow(i)} className="text-red-500 font-bold hover:text-red-700 col-span-1">
                ✕
              </button>
            </div>
          );
        })}

        <button onClick={addRow} className="mt-2 text-sky-600 font-medium hover:underline">
          ➕ Ajouter une prestation
        </button>
      </section>

      <textarea
        className="w-full border rounded-xl p-3"
        placeholder="Observations / remarques..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="text-right font-semibold text-lg text-sky-700">
        ⏱️ {totalHeures.toFixed(2)} h — 💰 {totalPrix.toFixed(2)} CHF
      </div>

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