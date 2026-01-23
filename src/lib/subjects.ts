export const schoolYears = [
  { value: "4_fundamental", label: "4º Ano - Fundamental I" },
  { value: "5_fundamental", label: "5º Ano - Fundamental I" },
  { value: "6_fundamental", label: "6º Ano - Fundamental II" },
  { value: "7_fundamental", label: "7º Ano - Fundamental II" },
  { value: "8_fundamental", label: "8º Ano - Fundamental II" },
  { value: "9_fundamental", label: "9º Ano - Fundamental II" },
  { value: "1_medio", label: "1º Ano - Ensino Médio" },
  { value: "2_medio", label: "2º Ano - Ensino Médio" },
  { value: "3_medio", label: "3º Ano - Ensino Médio" },
];

export const allSubjects = [
  { id: "matematica", label: "Matemática", icon: "📐", category: "exatas" },
  { id: "portugues", label: "Português", icon: "📚", category: "linguagens" },
  { id: "geografia", label: "Geografia", icon: "🌍", category: "humanas" },
  { id: "historia", label: "História", icon: "📜", category: "humanas" },
  { id: "artes", label: "Artes", icon: "🎨", category: "linguagens" },
  { id: "ingles", label: "Inglês", icon: "🇬🇧", category: "linguagens" },
  { id: "ed_fisica", label: "Ed. Física", icon: "⚽", category: "linguagens" },
  { id: "ciencias", label: "Ciências", icon: "🔬", category: "naturais" },
  { id: "enriquecimento", label: "Enriquecimento Curricular", icon: "✨", category: "outros" },
  { id: "quimica", label: "Química", icon: "⚗️", category: "naturais" },
  { id: "biologia", label: "Biologia", icon: "🧬", category: "naturais" },
  { id: "filosofia", label: "Filosofia", icon: "🤔", category: "humanas" },
  { id: "sociologia", label: "Sociologia", icon: "👥", category: "humanas" },
  { id: "fisica", label: "Física", icon: "⚛️", category: "naturais" },
];

export const getSubjectsByYear = (year: string) => {
  const fundamentalI = ["matematica", "portugues", "historia", "geografia", "ciencias", "artes", "ed_fisica", "ingles"];
  const fundamentalII = [...fundamentalI, "enriquecimento"];
  const ensinoMedio = ["matematica", "portugues", "historia", "geografia", "quimica", "biologia", "fisica", "filosofia", "sociologia", "artes", "ed_fisica", "ingles"];

  if (year.includes("4_") || year.includes("5_")) {
    return allSubjects.filter(s => fundamentalI.includes(s.id));
  } else if (year.includes("fundamental")) {
    return allSubjects.filter(s => fundamentalII.includes(s.id));
  } else {
    return allSubjects.filter(s => ensinoMedio.includes(s.id));
  }
};

export const getSubjectLabel = (id: string) => {
  return allSubjects.find(s => s.id === id)?.label || id;
};

export const getSubjectIcon = (id: string) => {
  return allSubjects.find(s => s.id === id)?.icon || "📖";
};

export const getAgeFromYear = (year: string): number => {
  const ageMap: Record<string, number> = {
    "4_fundamental": 9,
    "5_fundamental": 10,
    "6_fundamental": 11,
    "7_fundamental": 12,
    "8_fundamental": 13,
    "9_fundamental": 14,
    "1_medio": 15,
    "2_medio": 16,
    "3_medio": 17,
  };
  return ageMap[year] || 15;
};
