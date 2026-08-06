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
import worldMapConnections from "./data-world-map-connections";
import cubeGallery from "./interaction-cube-gallery";
import cosmicOrb from "./interaction-cosmic-orb";
import galleryTunnel from "./interaction-gallery-tunnel";
import blackHole from "./interaction-blackhole";
import fluidGlassButton from "./buttons-fluid-glass-button";
import cosmicRay from "./backgrounds-cosmic-ray";
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
import maskHoverReveal from "./utilities-mask-hover-reveal";
import cursorPet from "./interaction-cursor-pet";
import liquidGradient from "./backgrounds-liquid-gradient";
import glassPanels from "./layout-glass-panels";
import gravityGallery from "./interaction-gravity-gallery";
import spatialCarousel from "./carousels-spatial-carousel";
import kineticLines from "./backgrounds-kinetic-lines";
import thermalHeatmap from "./data-thermal-heatmap";
import particleEngine from "./backgrounds-particle-engine";
import fluidSimulation from "./backgrounds-fluid-simulation";
import particleMorph from "./text-particle-morph";
import scrollShowcase from "./sections-scroll-showcase";
import compareSlider from "./utilities-compare-slider";
import scrollReveal from "./text-scroll-reveal";
import logoMarquee from "./cms-logo-marquee";
import focusSlice from "./carousels-focus-slice";
import galleryStack from "./carousels-gallery-stack";
import progressiveBlur from "./utilities-progressive-blur";
import editorialTicker from "./cms-editorial-ticker";
import eyeFollowButton from "./buttons-eye-follow-button";
import fanCarousel from "./carousels-fan-carousel";
import borderBeamButton from "./buttons-border-beam-button";
import panoramaCarousel from "./carousels-panorama-carousel";
import depthCarousel from "./carousels-depth-carousel";
import glowCard from "./layout-glow-card";
import scrollGallery from "./cms-scroll-gallery";
import taskRunner from "./interaction-task-runner";
import morphNavbar from "./navigation-morph-navbar";
import stickyStack from "./sections-sticky-stack";
import velocityMarquee from "./text-velocity-marquee";
import spiralSlider from "./carousels-spiral-slider";
import imageTrail from "./interaction-image-trail";
import constellation from "./backgrounds-constellation";
import gooeyMenu from "./navigation-gooey-menu";
import terminalFrame from "./embeds-terminal-frame";
import otpInput from "./forms-otp-input";
import swipeDeck from "./carousels-swipe-deck";
import splitFlap from "./data-split-flap";
import infiniteCanvas from "./interaction-infinite-canvas";
import deviceScroll from "./sections-device-scroll";
import horizontalScroll from "./sections-horizontal-scroll";
import tiltCard from "./interaction-tilt-card";
import commandMenu from "./navigation-command-menu";
import particleText from "./typography-particle-text";
import spotlightGrid from "./layout-spotlight-grid";
import heroParallax from "./sections-hero-parallax";
import scrollTimeline from "./sections-scroll-timeline";
import testimonialStack from "./carousels-testimonial-stack";
import expandingPanels from "./cms-expanding-panels";
import lampGlow from "./backgrounds-lamp-glow";
import magneticDots from "./interaction-magnetic-dots";

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
  cosmicOrb,
  galleryTunnel,
  blackHole,
  fluidGlassButton,
  cosmicRay,
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
  maskHoverReveal,
  cursorPet,
  liquidGradient,
  glassPanels,
  gravityGallery,
  spatialCarousel,
  kineticLines,
  thermalHeatmap,
  particleEngine,
  fluidSimulation,
  particleMorph,
  scrollShowcase,
  compareSlider,
  scrollReveal,
  logoMarquee,
  focusSlice,
  galleryStack,
  progressiveBlur,
  editorialTicker,
  eyeFollowButton,
  fanCarousel,
  borderBeamButton,
  panoramaCarousel,
  depthCarousel,
  glowCard,
  scrollGallery,
  taskRunner,
  morphNavbar,
  stickyStack,
  velocityMarquee,
  spiralSlider,
  imageTrail,
  constellation,
  gooeyMenu,
  terminalFrame,
  otpInput,
  swipeDeck,
  splitFlap,
  infiniteCanvas,
  deviceScroll,
  horizontalScroll,
  tiltCard,
  commandMenu,
  particleText,
  spotlightGrid,
  heroParallax,
  scrollTimeline,
  testimonialStack,
  expandingPanels,
  lampGlow,
  magneticDots,
  worldMapConnections,
  cubeGallery,
];
