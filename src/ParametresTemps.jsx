import { useState } from "react";
import { getSetting, saveSetting } from "./utils/storage";

// Lista oficial (nomes) das méthodes (Autres)
const METHOD_NAMES = [
  "Aspirobrosseur","Aspiration","Vider corbeilles","Nettoyage du mobilier",
  "Nettoyage des surfaces verticales",
  "Lavage manuel des sols (surfaces dégagées) + finitions",
  "Dépoussiérage / balayage humide surfaces dégagées",
  "Détachage","Spray moquette","Injection / extraction",
  "Plafonds","Vitres accès de plain-pied (2 faces)","Murs","Portes",
  "Luminaires","Shampoing moquette mousse humide","Raclage sol",
  "Lavage mécanisé à l’autolaveuse + finitions","Décapage au mouillé",
  "Pose d’émulsion 2 couches","Lustrage (balayage de finition compris)",
  "Intérieurs placards","Bouche porage",
  "Nettoyage / désinfection / détartrage douches-lavabos-WC",
  "Balayage / lavage / désinfection sols sanitaires",
  "Nettoyage / essuyage robinetteries, appareils sanitaires…",
  "Ponçage des parquets et remise en cire",
  "Récurage (monobrosse + aspiration)","Cristallisation mécanique",
  "Dépoussiérage / balayage humide surfaces encombrées",
  "Dépoussiérage du mobilier","Spray marbre",
  "Spray méthode des sols plastiques et lustrage",
  "Entretien des escaliers (sol, rampe)",
  "Entretien d’un ascenseur","Aspiro-brossage","Décapage à sec",
  "Spray surface légèrement encombrée","Nettoyeur haute pression",
  "Lavage manuel des sols (surfaces encombrées)","Application de mousse (canon à mousse)",
];

const number = (v) => (v === "" ? "" : Number(v));
const inputCls = "border rounded p-1 text-center w-24";

// ---------- Defaults ----------
const DEFAULT_FREQS = {
  Quotidien: 0.8,
  Hebdomadaire: 1.0,
  Bimensuel: 1.3,
  Mensuel: 1.6,
  Trimestriel: 2.0,
  Semestriel: 2.5,
  Annuel: 3.0,
};

const DEFAULTS = {
  bail: {
    cuisine: 0, salleDeBain: 0, chambres: 0, salon: 0, wc: 0,
    localTechnique: 0, buanderie: 0, vitres: 0, stores: 0,
  },
  chantier: {
    cuisine: 0, salleDeBain: 0, chambres: 0, salon: 0, wc: 0,
    localTechnique: 0, buanderie: 0, vitres: 0, stores: 0,
  },
  vitres: {
    petiteFenetre: { in: 0, ex: 0 },
    fenetreStandard: { in: 0, ex: 0 },
    grandeBaie: { in: 0, ex: 0 },
    porteVitree: { in: 0, ex: 0 },
    vitrine: { rendement: 0 },   // m²/h
    storePetit: 0, storeStandard: 0, storeGrand: 0, // h/unité (ext)
  },
  entretien: {
    admin: {
      bureau: 0, salleReunion: 0, toilettes: 0, kitchenettes: 0,
      communs: 0, vestiaires: 0, ascenseurs: 0, couloirs: 0,
      halls: 0, cagesEscaliers: 0, locauxService: 0,
    },
    hopital: {
      bureaux: 0, salleReunion: 0, toilettes: 0, kitchenettes: 0,
      communs: 0, vestiaires: 0, ascenseurs: 0, couloirs: 0,
      halls: 0, cagesEscaliers: 0, locauxService: 0,
      chambres: 0, blocOperatoire: 0, zonesPassage: 0, espacesFonctionnels: 0,
    },
    ecole: {
      bureaux: 0, salleReunion: 0, toilettes: 0, kitchenettes: 0,
      communs: 0, vestiaires: 0, ascenseurs: 0, couloirs: 0,
      halls: 0, cagesEscaliers: 0, locauxService: 0,
      sallesClasse: 0, installationsSportives: 0,
    },
    medico: {
      bureaux: 0, salleReunion: 0, toilettes: 0, kitchenettes: 0,
      communs: 0, vestiaires: 0, ascenseurs: 0, couloirs: 0,
      halls: 0, cagesEscaliers: 0, locauxService: 0, chambres: 0,
    },
    residentiel: {
      // Unitários (h/unité):
      four: 0, hotte: 0, microOndes: 0, frigo: 0, laveVaisselle: 0, laveLinge: 0,
      // m²/h:
      cuisine: 0, salleDeBain: 0, wc: 0, chambres: 0, salon: 0,
      entreeCouloir: 0, mursPlinthes: 0, cageEscalier: 0, ascenseur: 0,
      buanderie: 0, localTechnique: 0, garage: 0, cave: 0, grenier: 0,
      parking: 0, exterieurs: 0,
    },
  },
  autresList: METHOD_NAMES.map((nom, i) => ({ id: i + 1, nom, rendement: 0 })),
};

// ---------- Helpers ----------
const load = (key, fallback) => getSetting(key, fallback);

// ---------- Componente ----------
export default function ParametresTemps({ onBack }) {
  const [section, setSection] = useState(null);

  const [data, setData] = useState({
    // 🧽 FIN DE BAIL
    bail: {
      cuisine: +load("bail.cuisine", DEFAULTS.bail.cuisine),
      salleDeBain: +load("bail.salleDeBain", DEFAULTS.bail.salleDeBain),
      chambres: +load("bail.chambres", DEFAULTS.bail.chambres),
      salon: +load("bail.salon", DEFAULTS.bail.salon),
      wc: +load("bail.wc", DEFAULTS.bail.wc),
      localTechnique: +load("bail.localTechnique", DEFAULTS.bail.localTechnique),
      buanderie: +load("bail.buanderie", DEFAULTS.bail.buanderie),
      vitres: +load("bail.vitres", DEFAULTS.bail.vitres),
      stores: +load("bail.stores", DEFAULTS.bail.stores),
    },

    // 🚧 FIN DE CHANTIER
    chantier: {
      cuisine: +load("chantier.cuisine", DEFAULTS.chantier.cuisine),
      salleDeBain: +load("chantier.salleDeBain", DEFAULTS.chantier.salleDeBain),
      chambres: +load("chantier.chambres", DEFAULTS.chantier.chambres),
      salon: +load("chantier.salon", DEFAULTS.chantier.salon),
      wc: +load("chantier.wc", DEFAULTS.chantier.wc),
      localTechnique: +load("chantier.localTechnique", DEFAULTS.chantier.localTechnique),
      buanderie: +load("chantier.buanderie", DEFAULTS.chantier.buanderie),
      vitres: +load("chantier.vitres", DEFAULTS.chantier.vitres),
      stores: +load("chantier.stores", DEFAULTS.chantier.stores),
    },

    // 🪟 VITRES & STORES
    vitres: {
      petiteFenetre: {
        in: +load("vitres.petiteFenetre.in", DEFAULTS.vitres.petiteFenetre.in),
        ex: +load("vitres.petiteFenetre.ex", DEFAULTS.vitres.petiteFenetre.ex),
      },
      fenetreStandard: {
        in: +load("vitres.fenetreStandard.in", DEFAULTS.vitres.fenetreStandard.in),
        ex: +load("vitres.fenetreStandard.ex", DEFAULTS.vitres.fenetreStandard.ex),
      },
      grandeBaie: {
        in: +load("vitres.grandeBaie.in", DEFAULTS.vitres.grandeBaie.in),
        ex: +load("vitres.grandeBaie.ex", DEFAULTS.vitres.grandeBaie.ex),
      },
      porteVitree: {
        in: +load("vitres.porteVitree.in", DEFAULTS.vitres.porteVitree.in),
        ex: +load("vitres.porteVitree.ex", DEFAULTS.vitres.porteVitree.ex),
      },
      vitrine: { rendement: +load("vitres.vitrine.rendement", DEFAULTS.vitres.vitrine.rendement) },
      storePetit: +load("vitres.storePetit", DEFAULTS.vitres.storePetit),
      storeStandard: +load("vitres.storeStandard", DEFAULTS.vitres.storeStandard),
      storeGrand: +load("vitres.storeGrand", DEFAULTS.vitres.storeGrand),
    },

    // 🧹 ENTRETIEN
    entretien: {
      admin: Object.fromEntries(Object.entries(DEFAULTS.entretien.admin).map(
        ([k, v]) => [k, +load(`entretien.admin.${k}`, v)]
      )),
      hopital: Object.fromEntries(Object.entries(DEFAULTS.entretien.hopital).map(
        ([k, v]) => [k, +load(`entretien.hopital.${k}`, v)]
      )),
      ecole: Object.fromEntries(Object.entries(DEFAULTS.entretien.ecole).map(
        ([k, v]) => [k, +load(`entretien.ecole.${k}`, v)]
      )),
      medico: Object.fromEntries(Object.entries(DEFAULTS.entretien.medico).map(
        ([k, v]) => [k, +load(`entretien.medico.${k}`, v)]
      )),
      residentiel: Object.fromEntries(Object.entries(DEFAULTS.entretien.residentiel).map(
        ([k, v]) => [k, +load(`entretien.residentiel.${k}`, v)]
      )),
    },

    // ⚙️ AUTRES – lista
    autresList: load("autresList", DEFAULTS.autresList),

    // 🕒 FRÉQUENCES – editáveis
    freqs: {
      Quotidien: +load("freqs.Quotidien", DEFAULT_FREQS.Quotidien),
      Hebdomadaire: +load("freqs.Hebdomadaire", DEFAULT_FREQS.Hebdomadaire),
      Bimensuel: +load("freqs.Bimensuel", DEFAULT_FREQS.Bimensuel),
      Mensuel: +load("freqs.Mensuel", DEFAULT_FREQS.Mensuel),
      Trimestriel: +load("freqs.Trimestriel", DEFAULT_FREQS.Trimestriel),
      Semestriel: +load("freqs.Semestriel", DEFAULT_FREQS.Semestriel),
      Annuel: +load("freqs.Annuel", DEFAULT_FREQS.Annuel),
    },
  });

  // ---------- handlers ----------
  const patch = (path, val) => {
    const keys = path.split(".");
    const numVal = number(val);
    setData((prev) => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys.at(-1)] = numVal;
      return copy;
    });
    saveSetting(path, numVal);
  };

  const patchAutre = (i, field, val) => {
    setData((prev) => {
      const list = prev.autresList.map((m, idx) =>
        idx === i ? { ...m, [field]: field === "rendement" ? number(val) : val } : m
      );
      saveSetting("autresList", list);
      return { ...prev, autresList: list };
    });
  };

  const saveAll = () => {
    Object.entries(data.bail).forEach(([k, v]) => saveSetting(`bail.${k}`, v));
    Object.entries(data.chantier).forEach(([k, v]) => saveSetting(`chantier.${k}`, v));

    const V = data.vitres;
    saveSetting("vitres.petiteFenetre.in", V.petiteFenetre.in);
    saveSetting("vitres.petiteFenetre.ex", V.petiteFenetre.ex);
    saveSetting("vitres.fenetreStandard.in", V.fenetreStandard.in);
    saveSetting("vitres.fenetreStandard.ex", V.fenetreStandard.ex);
    saveSetting("vitres.grandeBaie.in", V.grandeBaie.in);
    saveSetting("vitres.grandeBaie.ex", V.grandeBaie.ex);
    saveSetting("vitres.porteVitree.in", V.porteVitree.in);
    saveSetting("vitres.porteVitree.ex", V.porteVitree.ex);
    saveSetting("vitres.vitrine.rendement", V.vitrine.rendement);
    saveSetting("vitres.storePetit", V.storePetit);
    saveSetting("vitres.storeStandard", V.storeStandard);
    saveSetting("vitres.storeGrand", V.storeGrand);

    Object.entries(data.entretien).forEach(([cat, obj]) => {
      Object.entries(obj).forEach(([k, v]) => saveSetting(`entretien.${cat}.${k}`, v));
    });

    // frequências
    Object.entries(data.freqs).forEach(([name, mult]) => saveSetting(`freqs.${name}`, mult));

    saveSetting("autresList", data.autresList);
    alert("✅ Tous les paramètres ont été sauvegardés !");
  };

  const restoreDefaults = () => {
    if (!confirm("Restaurer les valeurs par défaut ?")) return;
    setData(structuredClone({
      bail: DEFAULTS.bail,
      chantier: DEFAULTS.chantier,
      vitres: DEFAULTS.vitres,
      entretien: structuredClone(DEFAULTS.entretien),
      autresList: DEFAULTS.autresList,
      freqs: DEFAULT_FREQS,
    }));

    Object.entries(DEFAULTS.bail).forEach(([k, v]) => saveSetting(`bail.${k}`, v));
    Object.entries(DEFAULTS.chantier).forEach(([k, v]) => saveSetting(`chantier.${k}`, v));

    const V = DEFAULTS.vitres;
    saveSetting("vitres.petiteFenetre.in", V.petiteFenetre.in);
    saveSetting("vitres.petiteFenetre.ex", V.petiteFenetre.ex);
    saveSetting("vitres.fenetreStandard.in", V.fenetreStandard.in);
    saveSetting("vitres.fenetreStandard.ex", V.fenetreStandard.ex);
    saveSetting("vitres.grandeBaie.in", V.grandeBaie.in);
    saveSetting("vitres.grandeBaie.ex", V.grandeBaie.ex);
    saveSetting("vitres.porteVitree.in", V.porteVitree.in);
    saveSetting("vitres.porteVitree.ex", V.porteVitree.ex);
    saveSetting("vitres.vitrine.rendement", V.vitrine.rendement);
    saveSetting("vitres.storePetit", V.storePetit);
    saveSetting("vitres.storeStandard", V.storeStandard);
    saveSetting("vitres.storeGrand", V.storeGrand);

    Object.entries(DEFAULTS.entretien).forEach(([cat, obj]) => {
      Object.entries(obj).forEach(([k, v]) => saveSetting(`entretien.${cat}.${k}`, v));
    });

    Object.entries(DEFAULT_FREQS).forEach(([name, mult]) => saveSetting(`freqs.${name}`, mult));

    saveSetting("autresList", DEFAULTS.autresList);
    alert("🔄 Valeurs par défaut restaurées.");
  };

  // ---- Entretien helpers (guardar / reset categoria isolada) ----
  const saveEntretienSection = (catKey, mapKeys) => {
    const obj = data.entretien[catKey];
    Object.values(mapKeys).forEach((k) => {
      const v = obj[k] ?? 0;
      saveSetting(`entretien.${catKey}.${k}`, v);
    });
    alert(`💾 Section "${catKey}" sauvegardée !`);
  };

  const resetEntretienSection = (catKey, mapKeys) => {
    if (!confirm("Réinitialiser cette section aux valeurs par défaut ?")) return;
    const defaults = DEFAULTS.entretien[catKey];
    const fresh = structuredClone(data);
    Object.values(mapKeys).forEach((k) => {
      const v = defaults[k] ?? 0;
      fresh.entretien[catKey][k] = v;
      saveSetting(`entretien.${catKey}.${k}`, v);
    });
    setData(fresh);
  };

  // ---------- UI helpers ----------
  const Field = ({ label, path, suffix }) => {
    const value = String(path.split(".").reduce((a, k) => a?.[k], data) ?? 0);
    return (
      <label className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.1"
            className={inputCls}
            value={value}
            onChange={(e) => patch(path, e.target.value)}
          />
          <span className="text-xs text-slate-500">{suffix}</span>
        </div>
      </label>
    );
  };

  const DuoVitres = ({ label, base }) => (
    <div className="bg-slate-50 p-3 rounded">
      <div className="font-medium mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-600">Intérieur</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.1"
              className={inputCls}
              value={data.vitres[base].in}
              onChange={(e) => patch(`vitres.${base}.in`, e.target.value)}
            />
            <span className="text-xs text-slate-500">h</span>
          </div>
        </label>
        <label className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-600">Extérieur</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.1"
              className={inputCls}
              value={data.vitres[base].ex}
              onChange={(e) => patch(`vitres.${base}.ex`, e.target.value)}
            />
            <span className="text-xs text-slate-500">h</span>
          </div>
        </label>
      </div>
    </div>
  );

  const backBtn = (
    <button onClick={() => setSection(null)} className="bg-gray-400 text-white px-6 py-2 rounded-xl hover:shadow-lg">
      ↩ Retour
    </button>
  );

  // ---------- MENU PRINCIPAL ----------
  if (!section) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center space-y-6">
        <h2 className="text-3xl font-semibold text-sky-700 mb-6">⚙️ Paramètres des temps</h2>
        <div className="grid gap-3">
          {[
            ["🧽 Fin de bail", "bail"],
            ["🚧 Fin de chantier", "chantier"],
            ["🪟 Vitres & Stores", "vitres"],
            ["🧹 Entretien régulier", "entretien"],
            ["🕒 Fréquences (multiplicateurs)", "freqs"],
            ["⚙️ Autres – Méthodes", "autres"],
          ].map(([label, val]) => (
            <button
              key={val}
              onClick={() => setSection(val)}
              className="flex items-center justify-center gap-3 bg-white rounded-xl shadow hover:shadow-lg hover:bg-sky-50 p-4 text-sky-700 font-medium transition"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button onClick={saveAll} className="bg-sky-600 text-white px-6 py-2 rounded-xl hover:shadow-lg">
            💾 Sauvegarder tout
          </button>
          <button onClick={restoreDefaults} className="bg-amber-600 text-white px-6 py-2 rounded-xl hover:shadow-lg">
            ♻ Restaurer par défaut
          </button>
          <button onClick={onBack} className="bg-gray-400 text-white px-6 py-2 rounded-xl hover:shadow-lg">
            ↩ Retour
          </button>
        </div>
      </div>
    );
  }

  // ---------- SUBPAGES ----------
  if (["bail","chantier"].includes(section)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h3 className="text-2xl font-semibold text-sky-700 text-center">
          {section === "bail" ? "🧽 Fin de bail" : "🚧 Fin de chantier"}
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Cuisine" path={`${section}.cuisine`} suffix="h" />
          <Field label="Salle de bain" path={`${section}.salleDeBain`} suffix="h" />
          <Field label="Chambres" path={`${section}.chambres`} suffix="h" />
          <Field label="Salon" path={`${section}.salon`} suffix="h" />
          <Field label="WC" path={`${section}.wc`} suffix="h" />
          <Field label="Local technique" path={`${section}.localTechnique`} suffix="h" />
          <Field label="Buanderie" path={`${section}.buanderie`} suffix="h" />
          <Field label="Vitres (unité)" path={`${section}.vitres`} suffix="h" />
          <Field label="Stores / Volets (unité)" path={`${section}.stores`} suffix="h" />
        </div>
        <div className="flex justify-center">{backBtn}</div>
      </div>
    );
  }

  if (section === "vitres") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h3 className="text-2xl font-semibold text-sky-700 text-center">🪟 Vitres & Stores</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <DuoVitres label="Petite fenêtre" base="petiteFenetre" />
          <DuoVitres label="Fenêtre standard" base="fenetreStandard" />
          <DuoVitres label="Grande baie vitrée" base="grandeBaie" />
          <DuoVitres label="Porte vitrée" base="porteVitree" />
        </div>

        <div className="flex items-center gap-3">
          <span className="w-56">Vitrine (rendement)</span>
          <input
            type="number"
            min="0"
            step="1"
            className={inputCls}
            value={data.vitres.vitrine.rendement}
            onChange={(e) => patch("vitres.vitrine.rendement", e.target.value)}
          />
          <span className="text-xs text-slate-500">m²/h</span>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Petit store (unité)" path="vitres.storePetit" suffix="h" />
          <Field label="Store standard (unité)" path="vitres.storeStandard" suffix="h" />
          <Field label="Grand store / motorisé (unité)" path="vitres.storeGrand" suffix="h" />
        </div>

        <div className="flex justify-center">{backBtn}</div>
      </div>
    );
  }

  if (section === "freqs") {
    const names = Object.keys(data.freqs);
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
        <h3 className="text-2xl font-semibold text-sky-700 text-center">🕒 Fréquences (multiplicateurs)</h3>
        <p className="text-sm text-slate-600 text-center">Defina o multiplicador usado no cálculo das horas (ex.: 1.6 = +60%).</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {names.map((n) => (
            <label key={n} className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded">
              <span className="text-sm">{n}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" step="0.1"
                  className={inputCls}
                  value={data.freqs[n]}
                  onChange={(e) => patch(`freqs.${n}`, e.target.value)}
                />
                <span className="text-xs text-slate-500">×</span>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-center">{backBtn}</div>
      </div>
    );
  }

  if (section === "entretien") {
    const BlockHeader = ({ title, onSave, onReset }) => (
      <div className="flex items-center justify-between mt-2">
        <h4 className="font-semibold text-sky-600 text-lg border-b pb-1">{title}</h4>
        <div className="flex gap-2">
          <button onClick={onSave} className="bg-sky-600 text-white px-3 py-1 rounded-lg">💾 Sauvegarder</button>
          <button onClick={onReset} className="bg-amber-600 text-white px-3 py-1 rounded-lg">♻ Réinitialiser</button>
        </div>
      </div>
    );

    // Labels → keys (coerentes com EntretienRegulier)
    const ADMIN = {
      "Bureau": "bureau", "Salle de réunion": "salleReunion", "Toilettes": "toilettes",
      "Kitchenettes": "kitchenettes", "Espaces communs": "communs", "Vestiaires": "vestiaires",
      "Ascenseurs": "ascenseurs", "Couloirs": "couloirs", "Halls d’entrée": "halls",
      "Cages d’escaliers": "cagesEscaliers", "Locaux de service": "locauxService",
    };
    const HOPITAL = {
      "Bureaux admin": "bureaux",
      "Salle de réunion": "salleReunion",
      "WC / Salles de bain": "toilettes", // encurtado p/ mobile
      "Kitchenettes": "kitchenettes",
      "Espaces communs": "communs",
      "Vestiaires": "vestiaires",
      "Ascenseurs": "ascenseurs",
      "Couloirs": "couloirs",
      "Halls": "halls",
      "Escaliers": "cagesEscaliers",
      "Locaux de service": "locauxService",
      "Chambres patients": "chambres",
      "Bloc opératoire (final)": "blocOperatoire",
      "Passage intense": "zonesPassage",
      "Espaces fonctionnels / Auscultation": "espacesFonctionnels",
    };
    const ECOLE = {
      "Bureaux admin": "bureaux",
      "Salle de réunion": "salleReunion",
      "WC / Douches": "toilettes",
      "Kitchenettes": "kitchenettes",
      "Espaces communs": "communs",
      "Vestiaires": "vestiaires",
      "Ascenseurs": "ascenseurs",
      "Couloirs": "couloirs",
      "Halls (aula)": "halls",
      "Escaliers": "cagesEscaliers",
      "Locaux de service": "locauxService",
      "Salles de classe": "sallesClasse",
      "Installations sportives": "installationsSportives",
    };
    const MEDICO = {
      "Bureaux admin": "bureaux",
      "Salle de réunion": "salleReunion",
      "WC / Douches": "toilettes",
      "Kitchenettes": "kitchenettes",
      "Espaces communs": "communs",
      "Vestiaires": "vestiaires",
      "Ascenseurs": "ascenseurs",
      "Couloirs": "couloirs",
      "Halls": "halls",
      "Escaliers": "cagesEscaliers",
      "Locaux de service": "locauxService",
      "Chambres résidents": "chambres",
    };
    const RES_UNIT = {
      "Four": "four","Hotte": "hotte","Micro-ondes": "microOndes",
      "Frigo": "frigo","Lave-vaisselle": "laveVaisselle","Lave-linge": "laveLinge",
    };
    const RES_M2 = {
      "Cuisine": "cuisine","Salle de bain": "salleDeBain","WC": "wc","Chambres": "chambres",
      "Salon": "salon","Entrée / Couloir": "entreeCouloir","Murs / Plinthes": "mursPlinthes",
      "Cage d’escalier": "cageEscalier","Ascenseur": "ascenseur","Buanderie": "buanderie",
      "Local technique": "localTechnique","Garage": "garage","Cave": "cave","Grenier": "grenier",
      "Parking": "parking","Extérieurs / trottoirs": "exterieurs",
    };

    const Block = ({ title, catKey, map }) => (
      <div className="space-y-2">
        <BlockHeader
          title={title}
          onSave={() => saveEntretienSection(catKey, map)}
          onReset={() => resetEntretienSection(catKey, map)}
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.keys(map).map((k) => (
            <Field key={k} label={k} path={`entretien.${catKey}.${map[k]}`} suffix={catKey === "residentiel" && ["four","hotte","microOndes","frigo","laveVaisselle","laveLinge"].includes(map[k]) ? "h/unité" : "m²/h"} />
          ))}
        </div>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h3 className="text-2xl font-semibold text-sky-700 text-center">🧹 Entretien régulier – Rendements de base</h3>

        <Block title="🏢 Administration / Bureaux (m²/h)" catKey="admin" map={ADMIN} />
        <Block title="🏥 Hôpitaux (m²/h)" catKey="hopital" map={HOPITAL} />
        <Block title="🧒 Écoles / Crèches (m²/h)" catKey="ecole" map={ECOLE} />
        <Block title="🧓 Établissements médico-sociaux (m²/h)" catKey="medico" map={MEDICO} />

        <div className="space-y-2">
          <BlockHeader
            title="🏠 Résidentiel / Immeubles"
            onSave={() => saveEntretienSection("residentiel", { ...RES_UNIT, ...RES_M2 })}
            onReset={() => resetEntretienSection("residentiel", { ...RES_UNIT, ...RES_M2 })}
          />
          <div className="font-medium text-slate-700">— Par unité (h/unité)</div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.keys(RES_UNIT).map((label) => (
              <Field key={label} label={label} path={`entretien.residentiel.${RES_UNIT[label]}`} suffix="h/unité" />
            ))}
          </div>
          <div className="font-medium text-slate-700 mt-3">— Par surface (m²/h)</div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.keys(RES_M2).map((label) => (
              <Field key={label} label={label} path={`entretien.residentiel.${RES_M2[label]}`} suffix="m²/h" />
            ))}
          </div>
        </div>

        <div className="flex justify-center">{backBtn}</div>
      </div>
    );
  }

  if (section === "autres") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <h3 className="text-2xl font-semibold text-sky-700 text-center">⚙️ Autres – Méthodes (m²/h)</h3>
        {data.autresList.map((m, i) => (
          <div key={m.id} className="grid md:grid-cols-3 gap-2 items-center bg-slate-50 p-2 rounded">
            <input
              className="border rounded p-2"
              value={m.nom}
              onChange={(e) => patchAutre(i, "nom", e.target.value)}
            />
            <input
              type="number"
              min="0"
              step="1"
              className="w-32 border rounded p-2 text-center"
              value={m.rendement}
              onChange={(e) => patchAutre(i, "rendement", e.target.value)}
            />
            <span className="text-xs text-slate-500">m²/h</span>
          </div>
        ))}

        <div className="flex justify-center">{backBtn}</div>
      </div>
    );
  }

  return null;
}
