export type Publication = {
  idLabel: string;
  filled: boolean;
  title: string;
  authors: string[];
  highlightAuthor: string;
  year: string;
  venue: string;
};

export type PublicationGroup = {
  heading: { en: string; tr: string };
  entries: Publication[];
};

export const publicationGroups: PublicationGroup[] = [
  {
    heading: { en: "IN SUBMISSION", tr: "DEĞERLENDİRMEDE" },
    entries: [
      {
        idLabel: "S.2",
        filled: false,
        title:
          "What Can We Learn from High-Resolution Hydrologic Simulations: Interpolation vs. Extrapolation in Flood Forecasting in Non-Stationary Scenarios",
        authors: ["Mantilla", "Barco", "Lewkebandara", "Mehboob", "Perez", "Gurbuz", "Xiao"],
        highlightAuthor: "Gurbuz",
        year: "2025",
        venue: "HESS (submitted)",
      },
      {
        idLabel: "S.1",
        filled: false,
        title:
          "Advancing Machine Learning-Based Streamflow Prediction Through Event Greedy Sampling, Asymmetric Loss Function, and Rainfall Forecasting Uncertainty",
        authors: ["Tofighi", "Gurbuz", "Mantilla", "Xiao"],
        highlightAuthor: "Gurbuz",
        year: "2025",
        venue: "Environmental Modelling & Software (submitted)",
      },
    ],
  },
  {
    heading: { en: "JOURNAL", tr: "DERGİ" },
    entries: [
      {
        idLabel: "J.4",
        filled: true,
        title:
          "Using a physics-based hydrological model and storm transposition to investigate machine-learning algorithms for streamflow prediction",
        authors: ["Gurbuz", "Mudireddy", "Mantilla", "Xiao"],
        highlightAuthor: "Gurbuz",
        year: "2024",
        venue: "Journal of Hydrology",
      },
      {
        idLabel: "J.3",
        filled: true,
        title: "Multivariate modeling of flood characteristics using Vine copulas",
        authors: ["Tosunoglu", "Gurbuz", "İspirli"],
        highlightAuthor: "Gurbuz",
        year: "2020",
        venue: "Environmental Earth Sciences 79(19)",
      },
      {
        idLabel: "J.2",
        filled: true,
        title: "Mapping spatial variability of annual rainfall under different return periods in Turkey",
        authors: ["Tosunoglu", "Gurbuz"],
        highlightAuthor: "Gurbuz",
        year: "2019",
        venue: "Meteorological Applications",
      },
      {
        idLabel: "J.1",
        filled: true,
        title:
          "Estimation of Missing Streamflow Records in the Euphrates Basin using Flow Duration Curves and Regression Models",
        authors: ["Tosunoglu", "İspirli", "Gurbuz", "Şengül"],
        highlightAuthor: "Gurbuz",
        year: "2017",
        venue: "Iğdır Univ. J. Inst. Sci. & Tech.",
      },
    ],
  },
  {
    heading: { en: "CONFERENCE & THESIS", tr: "KONFERANS & TEZ" },
    entries: [
      {
        idLabel: "C.2",
        filled: false,
        title:
          "Interpolation vs. Extrapolation in Flood Forecasting: Conceptual and Machine Learning Tools in Non-Stationary Scenarios",
        authors: ["Mantilla", "Barco", "Gurbuz", "Xiao", "Muñoz", "Lewkebandara", "Sharma"],
        highlightAuthor: "Gurbuz",
        year: "2024",
        venue: "EGU24",
      },
      {
        idLabel: "C.1",
        filled: false,
        title: "The role of AI algorithms in flood prediction and mitigation",
        authors: ["Xiao", "Mantilla", "Gurbuz", "Mudireddy"],
        highlightAuthor: "Gurbuz",
        year: "2021",
        venue: "AGU Fall Meeting",
      },
      {
        idLabel: "T",
        filled: false,
        title: "Exploration of Flood Forecasting and Flood Mitigation",
        authors: ["Gurbuz"],
        highlightAuthor: "Gurbuz",
        year: "2020",
        venue: "M.Sc. Thesis, The University of Iowa",
      },
    ],
  },
];
