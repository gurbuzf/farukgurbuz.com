export type Publication = {
  idLabel: string;
  filled: boolean;
  title: string;
  authors: string[];
  highlightAuthor: string;
  year: string;
  venue: string;
  doi?: string;
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
        idLabel: "S.1",
        filled: false,
        title:
          "Interpolation vs. Extrapolation in Flood Forecasting: Exploring the Predictive Capability of Conceptual and Machine Learning Tools in Non-Stationary Scenarios",
        authors: ["Mantilla", "Barco", "Mehboob", "Lewkebandara", "Perez", "Gurbuz", "Xiao"],
        highlightAuthor: "Gurbuz",
        year: "2025",
        venue: "HESS (submitted)",
        doi: "10.2139/ssrn.5555228",
      },
    ],
  },
  {
    heading: { en: "JOURNAL", tr: "DERGİ" },
    entries: [
      {
        idLabel: "J.6",
        filled: true,
        title:
          "Advancing Machine Learning-Based Streamflow Prediction Through Event Greedy Selection, Asymmetric Loss Function, and Rainfall Forecasting Uncertainty",
        authors: ["Tofighi", "Gurbuz", "Mantilla", "Xiao"],
        highlightAuthor: "Gurbuz",
        year: "2025",
        venue: "Applied Sciences",
        doi: "10.3390/app152111656",
      },
      {
        idLabel: "J.5",
        filled: true,
        title:
          "A Data-Driven Framework for Flood Mitigation: Transformer-Based Damage Prediction and Reinforcement Learning for Reservoir Operations",
        authors: ["Tofighi", "Gurbuz", "Mantilla", "Xiao"],
        highlightAuthor: "Gurbuz",
        year: "2025",
        venue: "Water",
        doi: "10.3390/w17203024",
      },
      {
        idLabel: "J.4",
        filled: true,
        title:
          "Using a physics-based hydrological model and storm transposition to investigate machine-learning algorithms for streamflow prediction",
        authors: ["Gurbuz", "Mudireddy", "Mantilla", "Xiao"],
        highlightAuthor: "Gurbuz",
        year: "2024",
        venue: "Journal of Hydrology",
        doi: "10.1016/j.jhydrol.2023.130504",
      },
      {
        idLabel: "J.3",
        filled: true,
        title: "Multivariate modeling of flood characteristics using Vine copulas",
        authors: ["Tosunoglu", "Gurbuz", "İspirli"],
        highlightAuthor: "Gurbuz",
        year: "2020",
        venue: "Environmental Earth Sciences 79(19)",
        doi: "10.1007/s12665-020-09199-6",
      },
      {
        idLabel: "J.2",
        filled: true,
        title:
          "Mapping spatial variability of annual rainfall under different return periods in Turkey: The application of various distribution functions and model selection techniques",
        authors: ["Tosunoglu", "Gurbuz"],
        highlightAuthor: "Gurbuz",
        year: "2019",
        venue: "Meteorological Applications",
        doi: "10.1002/met.1793",
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
        doi: "10.21597/jist.2017.201",
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
          "Interpolation vs. Extrapolation in Flood Forecasting: Exploring the Predictive Capability of Conceptual and Machine Learning Tools in Non-Stationary Scenarios",
        authors: ["Mantilla", "Barco", "Gurbuz", "Xiao", "Muñoz", "Lewkebandara", "Sharma"],
        highlightAuthor: "Gurbuz",
        year: "2024",
        venue: "EGU24",
        doi: "10.5194/egusphere-egu24-13400",
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
        doi: "10.17077/etd.005670",
      },
    ],
  },
];
