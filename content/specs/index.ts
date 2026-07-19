import type { MotionSpec } from "@/lib/spec";
import fadeUp from "./text-fade-up";
import blurIn from "./text-blur-in";
import typewriter from "./text-typewriter";
import gradientFlow from "./text-gradient-flow";
import jitter from "./text-jitter";
import splitReveal from "./text-split-reveal";
import shuffle from "./text-shuffle";
import scrambleHover from "./text-scramble-hover";
import wave from "./text-wave";
import glitch from "./text-glitch";
import counter from "./text-counter";
import rotateWords from "./text-rotate-words";
import blurOutUp from "./text-blur-out-up";
import maskReveal from "./text-mask-reveal";
import magneticChars from "./text-magnetic-chars";
import textPathHint from "./text-text-path-hint";
import faqAccordion from "./sections-faq-accordion";
import locationGlobe from "./data-location-globe";
import iridescentLogo3d from "./interaction-iridescent-logo-3d";
import magneticButton from "./buttons-magnetic-button";
import auroraMesh from "./backgrounds-aurora-mesh";
import floatingDock from "./navigation-floating-dock";
import floatingLabelInput from "./forms-floating-label-input";
import cursorSpotlight from "./utilities-cursor-spotlight";
import bentoGrid from "./layout-bento-grid";
import animatedTagList from "./cms-animated-tag-list";
import browserFrame from "./embeds-browser-frame";
import coverflowCarousel from "./carousels-coverflow-carousel";
import pixelHero from "./sections-pixel-hero";
import flipBook from "./carousels-flip-book";
import mediaHoverList from "./cms-media-hover-list";
import shutterReveal from "./interaction-shutter-reveal";
import maskHoverReveal from "./utilities-mask-hover-reveal";
import cursorPet from "./interaction-cursor-pet";
import liquidGradient from "./backgrounds-liquid-gradient";
import glassPanels from "./layout-glass-panels";
import gravityGallery from "./interaction-gravity-gallery";
import spatialCarousel from "./carousels-spatial-carousel";
import kineticLines from "./backgrounds-kinetic-lines";
import shatterLogo from "./interaction-shatter-logo";
import thermalHeatmap from "./data-thermal-heatmap";
import particleEngine from "./backgrounds-particle-engine";
import fluidSimulation from "./backgrounds-fluid-simulation";
import particleMorph from "./text-particle-morph";
import scrollShowcase from "./sections-scroll-showcase";
import compareSlider from "./utilities-compare-slider";
import scrollReveal from "./text-scroll-reveal";
import logoMarquee from "./cms-logo-marquee";

/**
 * 명시적 배럴. content/specs/*.ts 신규 파일 추가 시 여기에 함께 등록해야
 * load-specs.ts가 인식한다 (Turbopack 정적 분석과 호환되는 방식).
 */
export const allSpecs: MotionSpec[] = [
  fadeUp,
  blurIn,
  typewriter,
  gradientFlow,
  jitter,
  splitReveal,
  shuffle,
  scrambleHover,
  wave,
  glitch,
  counter,
  rotateWords,
  blurOutUp,
  maskReveal,
  magneticChars,
  textPathHint,
  faqAccordion,
  locationGlobe,
  iridescentLogo3d,
  magneticButton,
  auroraMesh,
  floatingDock,
  floatingLabelInput,
  cursorSpotlight,
  bentoGrid,
  animatedTagList,
  browserFrame,
  coverflowCarousel,
  pixelHero,
  flipBook,
  mediaHoverList,
  shutterReveal,
  maskHoverReveal,
  cursorPet,
  liquidGradient,
  glassPanels,
  gravityGallery,
  spatialCarousel,
  kineticLines,
  shatterLogo,
  thermalHeatmap,
  particleEngine,
  fluidSimulation,
  particleMorph,
  scrollShowcase,
  compareSlider,
  scrollReveal,
  logoMarquee,
];
