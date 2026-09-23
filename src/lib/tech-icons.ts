import type { IconType } from "react-icons";
import {
  SiReact,
  SiElectron,
  SiTypescript,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiSass,
  SiTailwindcss,
  SiChakraui,
  SiRedux,
  SiReactquery,
  SiNodedotjs,
  SiPython,
  SiFlask,
  SiDjango,
  SiMysql,
  SiGit,
  SiGithub,
} from "react-icons/si";

/**
 * Maps a skill label (as it appears in messages/*.json) to its brand icon.
 * Labels with no entry here are rendered as static text, not as an animated icon —
 * they're processes/methodologies (e.g. "Scrum", "Pruebas funcionales"), not products with a logo.
 */
export const techIcons: Record<string, IconType> = {
  "React.js": SiReact,
  "React Native": SiReact,
  "Electron.js": SiElectron,
  TypeScript: SiTypescript,
  "JavaScript (ES6+)": SiJavascript,
  HTML5: SiHtml5,
  CSS3: SiCss,
  SASS: SiSass,
  "Tailwind CSS": SiTailwindcss,
  "Chakra UI": SiChakraui,
  Redux: SiRedux,
  "TanStack Query": SiReactquery,
  "Node.js": SiNodedotjs,
  Python: SiPython,
  Flask: SiFlask,
  Django: SiDjango,
  MySQL: SiMysql,
  Git: SiGit,
  GitHub: SiGithub,
};
