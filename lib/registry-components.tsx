import type { ComponentType } from "react";
import { FadeUpText } from "@/registry/typography/fade-up";
import { BlurInText } from "@/registry/typography/blur-in";
import { TypewriterText } from "@/registry/typography/typewriter";
import { AnimatedGradient } from "@/registry/typography/gradient-flow";
import { JitterText } from "@/registry/typography/jitter";
import { SplitReveal } from "@/registry/typography/split-reveal";
import { ShuffleText } from "@/registry/typography/shuffle";
import { ScrambleOnHover } from "@/registry/typography/scramble-hover";
import { WaveText } from "@/registry/typography/wave";
import { GlitchText } from "@/registry/typography/glitch";
import { CountUp } from "@/registry/typography/counter";
import { RotatingWords } from "@/registry/typography/rotate-words";
import { BlurOutUp } from "@/registry/typography/blur-out-up";
import { MaskReveal } from "@/registry/typography/mask-reveal";
import { MagneticCharacters } from "@/registry/typography/magnetic-chars";
import { CharStaggerHero } from "@/registry/typography/text-path-hint";
import { FAQAccordion } from "@/registry/sections/faq-accordion";
import { LocationGlobe } from "@/registry/data/location-globe";
import { IridescentLogo3D } from "@/registry/interaction/iridescent-logo-3d";
import { MagneticButton } from "@/registry/buttons/magnetic-button";
import { AuroraMesh } from "@/registry/backgrounds/aurora-mesh";
import { FloatingDock } from "@/registry/navigation/floating-dock";
import { FloatingLabelInput } from "@/registry/forms/floating-label-input";
import { CursorSpotlight } from "@/registry/utilities/cursor-spotlight";
import { BentoGrid } from "@/registry/layout/bento-grid";
import { AnimatedTagList } from "@/registry/cms/animated-tag-list";
import { BrowserFrame } from "@/registry/embeds/browser-frame";
import { CoverflowCarousel } from "@/registry/carousels/coverflow-carousel";
import { PixelHero } from "@/registry/sections/pixel-hero";
import { FlipBook } from "@/registry/carousels/flip-book";
import { MediaHoverList } from "@/registry/cms/media-hover-list";
import { ShutterReveal } from "@/registry/interaction/shutter-reveal";
import { MaskHoverReveal } from "@/registry/utilities/mask-hover-reveal";
import { CursorPet } from "@/registry/interaction/cursor-pet";
import { LiquidGradient } from "@/registry/backgrounds/liquid-gradient";
import { GlassPanels } from "@/registry/layout/glass-panels";
import { GravityGallery } from "@/registry/interaction/gravity-gallery";
import { SpatialCarousel } from "@/registry/carousels/spatial-carousel";
import { KineticLines } from "@/registry/backgrounds/kinetic-lines";
import { ShatterLogo } from "@/registry/interaction/shatter-logo";
import { ThermalHeatmap } from "@/registry/data/thermal-heatmap";
import { ParticleEngine } from "@/registry/backgrounds/particle-engine";
import { FluidSimulation } from "@/registry/backgrounds/fluid-simulation";
import { ParticleMorph } from "@/registry/typography/particle-morph";
import { ScrollShowcase } from "@/registry/sections/scroll-showcase";
import { CompareSlider } from "@/registry/utilities/compare-slider";
import { ScrollReveal } from "@/registry/typography/scroll-reveal";
import { LogoMarquee } from "@/registry/cms/logo-marquee";
import { ConfidentialFolder } from "@/registry/interaction/confidential-folder";
import { FocusSliceCarousel } from "@/registry/carousels/focus-slice";
import { GalleryStack } from "@/registry/carousels/gallery-stack";
import { ProgressiveBlur } from "@/registry/utilities/progressive-blur";
import { EditorialTicker } from "@/registry/cms/editorial-ticker";
import { EyeFollowButton } from "@/registry/buttons/eye-follow-button";
import { FanCarousel } from "@/registry/carousels/fan-carousel";
import { BorderBeamButton } from "@/registry/buttons/border-beam-button";
import { PanoramaCarousel } from "@/registry/carousels/panorama-carousel";
import { DepthCarousel } from "@/registry/carousels/depth-carousel";
import { GlowCard } from "@/registry/layout/glow-card";
import { ScrollGallery } from "@/registry/cms/scroll-gallery";
import { TaskRunnerCard } from "@/registry/interaction/task-runner";
import { MorphNavbar } from "@/registry/navigation/morph-navbar";

/**
 * 명시적 배럴. registry/**.tsx 신규 컴포넌트 추가 시 여기에 함께 등록해야
 * 상세 페이지 프리뷰가 인식한다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registryComponents: Record<string, ComponentType<any>> = {
  "typography/fade-up": FadeUpText,
  "typography/blur-in": BlurInText,
  "typography/typewriter": TypewriterText,
  "typography/gradient-flow": AnimatedGradient,
  "typography/jitter": JitterText,
  "typography/split-reveal": SplitReveal,
  "typography/shuffle": ShuffleText,
  "typography/scramble-hover": ScrambleOnHover,
  "typography/wave": WaveText,
  "typography/glitch": GlitchText,
  "typography/counter": CountUp,
  "typography/rotate-words": RotatingWords,
  "typography/blur-out-up": BlurOutUp,
  "typography/mask-reveal": MaskReveal,
  "typography/magnetic-chars": MagneticCharacters,
  "typography/text-path-hint": CharStaggerHero,
  "sections/faq-accordion": FAQAccordion,
  "data/location-globe": LocationGlobe,
  "interaction/iridescent-logo-3d": IridescentLogo3D,
  "buttons/magnetic-button": MagneticButton,
  "backgrounds/aurora-mesh": AuroraMesh,
  "navigation/floating-dock": FloatingDock,
  "forms/floating-label-input": FloatingLabelInput,
  "utilities/cursor-spotlight": CursorSpotlight,
  "layout/bento-grid": BentoGrid,
  "cms/animated-tag-list": AnimatedTagList,
  "embeds/browser-frame": BrowserFrame,
  "carousels/coverflow-carousel": CoverflowCarousel,
  "sections/pixel-hero": PixelHero,
  "carousels/flip-book": FlipBook,
  "cms/media-hover-list": MediaHoverList,
  "interaction/shutter-reveal": ShutterReveal,
  "utilities/mask-hover-reveal": MaskHoverReveal,
  "interaction/cursor-pet": CursorPet,
  "backgrounds/liquid-gradient": LiquidGradient,
  "layout/glass-panels": GlassPanels,
  "interaction/gravity-gallery": GravityGallery,
  "carousels/spatial-carousel": SpatialCarousel,
  "backgrounds/kinetic-lines": KineticLines,
  "interaction/shatter-logo": ShatterLogo,
  "data/thermal-heatmap": ThermalHeatmap,
  "backgrounds/particle-engine": ParticleEngine,
  "backgrounds/fluid-simulation": FluidSimulation,
  "typography/particle-morph": ParticleMorph,
  "sections/scroll-showcase": ScrollShowcase,
  "utilities/compare-slider": CompareSlider,
  "typography/scroll-reveal": ScrollReveal,
  "cms/logo-marquee": LogoMarquee,
  "interaction/confidential-folder": ConfidentialFolder,
  "carousels/focus-slice": FocusSliceCarousel,
  "carousels/gallery-stack": GalleryStack,
  "utilities/progressive-blur": ProgressiveBlur,
  "cms/editorial-ticker": EditorialTicker,
  "buttons/eye-follow-button": EyeFollowButton,
  "carousels/fan-carousel": FanCarousel,
  "buttons/border-beam-button": BorderBeamButton,
  "carousels/panorama-carousel": PanoramaCarousel,
  "carousels/depth-carousel": DepthCarousel,
  "layout/glow-card": GlowCard,
  "cms/scroll-gallery": ScrollGallery,
  "interaction/task-runner": TaskRunnerCard,
  "navigation/morph-navbar": MorphNavbar,
};
