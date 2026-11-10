/**
 * Single source of truth for the CV (both languages). `build.mjs` renders it to an
 * ATS-friendly PDF (served by the site) and to an editable DOCX.
 * Facts only: every role, date and achievement comes from Jhonier's own CV.
 */

const contact = {
  name: "Jhonier Yesid Santana Pedroza",
  phone: "+57 321 547 7347",
  email: "jhonier_2504@hotmail.com",
  linkedin: "linkedin.com/in/jhonier-yesid-santana-pedroza-457492265",
  github: "github.com/JhonierSantana",
};

/** Public portfolio (Vercel). Each CV links to the portfolio in its own language. */
const PORTFOLIO_HOST = "my-portafolio-jhoniersantanas-projects.vercel.app";
const portfolioUrl = (lang) => `${PORTFOLIO_HOST}/${lang}`;

export const cv = {
  es: {
    lang: "es",
    contact: { ...contact, location: "Socorro, Santander, Colombia", portfolio: { label: "Portafolio", url: portfolioUrl("es") } },
    headline: "Desarrollador de Software Fullstack | React | React Native | Node.js | TypeScript | IA (Claude Code)",
    sections: {
      summary: "Perfil profesional",
      experience: "Experiencia laboral",
      skills: "Habilidades técnicas",
      education: "Formación académica",
      languages: "Idiomas",
    },
    summary:
      "Desarrollador de Software Fullstack con más de 2 años de experiencia diseñando, desarrollando y manteniendo aplicaciones web, móviles y de escritorio. Especializado en el ecosistema JavaScript y TypeScript (React, React Native, Node.js) y en backend con Node.js y Python (Flask, Django) sobre MySQL. Experiencia en arquitectura frontend escalable, integración de APIs REST, UX/UI, migración tecnológica, CI/CD y pruebas funcionales, trabajando con Git y metodologías ágiles (Scrum). Integro el desarrollo asistido por IA con Claude Code en mi flujo de trabajo.",
    experience: [
      {
        role: "Desarrollador de Software",
        company: "Seguridad Penta / Bartik",
        location: "Bogotá, Colombia",
        period: "May 2025 – Actualidad",
        points: [
          "Lideré mejoras de UX/UI en una suite de 5 aplicaciones web, móviles y de escritorio, optimizando flujos de trabajo clave y aumentando la usabilidad y la satisfacción del usuario.",
          "Diseñé e implementé la arquitectura frontend de 4 aplicaciones SaaS, integrando APIs REST y creando interfaces intuitivas alineadas con las necesidades del negocio.",
          "Dirigí la migración y actualización de dependencias críticas y ejecuté pruebas funcionales multiplataforma, reduciendo la deuda técnica y aumentando la estabilidad del producto.",
        ],
      },
      {
        role: "Desarrollador Frontend",
        company: "Attendv / Betek",
        location: "Medellín, Colombia",
        period: "May 2024 – Oct 2024",
        points: [
          "Desarrollé una aplicación web completa de servicios bajo demanda con React y Firebase, implementando funcionalidades dinámicas que mejoraron la interacción del usuario.",
          "Optimicé el rendimiento y el SEO de la aplicación con código eficiente y buenas prácticas, mejorando la velocidad de carga y la visibilidad en buscadores.",
          "Configuré e implementé pipelines de CI/CD (integración y entrega continua), automatizando el despliegue y agilizando el flujo de trabajo del equipo.",
        ],
      },
      {
        role: "Desarrollador de Software (Freelance)",
        company: "Autonomic Mind",
        location: "Medellín, Colombia",
        period: "Sep 2023 – Oct 2023",
        points: [
          "Desarrollé soluciones de software en múltiples lenguajes (Dart, Kotlin, R, Lua), aplicando programación funcional y recursión para resolver problemas de negocio específicos.",
          "Implementé control de versiones con Git en un entorno colaborativo, facilitando la integración de código y el trabajo en equipo.",
        ],
      },
      {
        role: "Desarrollador de Software (Trainee)",
        company: "Holberton School",
        location: "Bogotá, Colombia",
        period: "Sep 2022 – Jul 2023",
        points: [
          "Desarrollé proyectos fullstack completos con React, Python (Flask) y MySQL dentro de un programa intensivo, cubriendo todo el ciclo de vida del desarrollo de software.",
          "Apliqué pruebas unitarias y de integración para garantizar la calidad y robustez del código en todos los proyectos.",
          "Resolví más de 100 ejercicios de lógica, algoritmos y estructuras de datos, fortaleciendo la resolución de problemas y la optimización de código.",
        ],
      },
    ],
    skills: [
      ["Frontend", "React.js, React Native, Electron.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, SASS, Tailwind CSS, Chakra UI"],
      ["Backend y bases de datos", "Node.js, Python (Flask, Django), MySQL, Firebase, APIs REST"],
      ["Gestión de estado", "Redux, TanStack Query (React Query)"],
      ["IA aplicada al desarrollo", "Claude Code, desarrollo asistido por IA"],
      ["Testing y QA", "Pruebas funcionales (web, móvil y escritorio), pruebas unitarias y de integración, documentación de bugs, seguimiento de incidencias"],
      ["Herramientas y metodologías", "Git, GitHub, CI/CD, Scrum (metodologías ágiles), resolución de problemas"],
    ],
    education: [
      { title: "Certificación en Desarrollo Frontend", institution: "Betek", period: "Nov 2024" },
      { title: "Certificación en Desarrollo de Software", institution: "Holberton School", period: "Jul 2023" },
      { title: "Bachiller Académico", institution: "Instituto Técnico Industrial", period: "Nov 2020" },
    ],
    languages: "Español: nativo | Inglés: intermedio",
  },

  en: {
    lang: "en",
    contact: { ...contact, location: "Socorro, Santander, Colombia", portfolio: { label: "Portfolio", url: portfolioUrl("en") } },
    headline: "Fullstack Software Developer | React | React Native | Node.js | TypeScript | AI (Claude Code)",
    sections: {
      summary: "Professional Summary",
      experience: "Work Experience",
      skills: "Technical Skills",
      education: "Education",
      languages: "Languages",
    },
    summary:
      "Fullstack Software Developer with 2+ years of experience designing, building and maintaining web, mobile and desktop applications. Specialized in the JavaScript and TypeScript ecosystem (React, React Native, Node.js) and in backend development with Node.js and Python (Flask, Django) on MySQL. Experienced in scalable frontend architecture, REST API integration, UX/UI, technology migration, CI/CD and functional testing, working with Git and Agile (Scrum). I bring AI-assisted development with Claude Code into my workflow.",
    experience: [
      {
        role: "Software Developer",
        company: "Seguridad Penta / Bartik",
        location: "Bogotá, Colombia",
        period: "May 2025 – Present",
        points: [
          "Led UX/UI improvements across a suite of 5 web, mobile and desktop applications, optimizing key workflows and increasing usability and user satisfaction.",
          "Designed and implemented the frontend architecture of 4 SaaS applications, integrating REST APIs and building intuitive interfaces aligned with business needs.",
          "Directed the migration and update of critical dependencies and ran cross-platform functional testing, reducing technical debt and improving product stability.",
        ],
      },
      {
        role: "Frontend Developer",
        company: "Attendv / Betek",
        location: "Medellín, Colombia",
        period: "May 2024 – Oct 2024",
        points: [
          "Built a complete on-demand services web application with React and Firebase, implementing dynamic features that improved user interaction.",
          "Optimized application performance and SEO through efficient code and best practices, improving load speed and search visibility.",
          "Set up and implemented CI/CD (continuous integration and delivery) pipelines, automating deployment and streamlining the team's workflow.",
        ],
      },
      {
        role: "Software Developer (Freelance)",
        company: "Autonomic Mind",
        location: "Medellín, Colombia",
        period: "Sep 2023 – Oct 2023",
        points: [
          "Built software solutions in multiple languages (Dart, Kotlin, R, Lua), applying functional programming and recursion to solve specific business problems.",
          "Used Git version control in a collaborative environment, streamlining code integration and teamwork.",
        ],
      },
      {
        role: "Software Developer (Trainee)",
        company: "Holberton School",
        location: "Bogotá, Colombia",
        period: "Sep 2022 – Jul 2023",
        points: [
          "Built complete fullstack projects with React, Python (Flask) and MySQL in an intensive program, covering the full software development lifecycle.",
          "Applied unit and integration testing to ensure code quality and robustness across all projects.",
          "Solved 100+ logic, algorithms and data structures exercises, strengthening problem solving and code optimization.",
        ],
      },
    ],
    skills: [
      ["Frontend", "React.js, React Native, Electron.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, SASS, Tailwind CSS, Chakra UI"],
      ["Backend & Databases", "Node.js, Python (Flask, Django), MySQL, Firebase, REST APIs"],
      ["State Management", "Redux, TanStack Query (React Query)"],
      ["AI for Development", "Claude Code, AI-assisted development"],
      ["Testing & QA", "Functional testing (web, mobile and desktop), unit and integration testing, bug documentation, issue tracking"],
      ["Tools & Methodologies", "Git, GitHub, CI/CD, Scrum (Agile), problem solving"],
    ],
    education: [
      { title: "Frontend Development Certification", institution: "Betek", period: "Nov 2024" },
      { title: "Software Development Certification", institution: "Holberton School", period: "Jul 2023" },
      { title: "High School Diploma (Academic)", institution: "Instituto Técnico Industrial", period: "Nov 2020" },
    ],
    languages: "Spanish: native | English: intermediate",
  },
};
