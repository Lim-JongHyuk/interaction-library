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
import { WorldMapConnections } from "@/registry/data/world-map-connections";
import { CubeGallery } from "@/registry/interaction/cube-gallery";
import { CosmicOrb } from "@/registry/interaction/cosmic-orb";
import { GalleryTunnel } from "@/registry/interaction/gallery-tunnel";
import { BlackHole } from "@/registry/interaction/blackhole";
import { FluidGlassButton } from "@/registry/buttons/fluid-glass-button";
import { CosmicRay } from "@/registry/backgrounds/cosmic-ray";
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
import { MaskHoverReveal } from "@/registry/utilities/mask-hover-reveal";
import { CursorPet } from "@/registry/interaction/cursor-pet";
import { LiquidGradient } from "@/registry/backgrounds/liquid-gradient";
import { GlassPanels } from "@/registry/layout/glass-panels";
import { GravityGallery } from "@/registry/interaction/gravity-gallery";
import { SpatialCarousel } from "@/registry/carousels/spatial-carousel";
import { KineticLines } from "@/registry/backgrounds/kinetic-lines";
import { ThermalHeatmap } from "@/registry/data/thermal-heatmap";
import { ParticleEngine } from "@/registry/backgrounds/particle-engine";
import { FluidSimulation } from "@/registry/backgrounds/fluid-simulation";
import { ParticleMorph } from "@/registry/typography/particle-morph";
import { ScrollShowcase } from "@/registry/sections/scroll-showcase";
import { CompareSlider } from "@/registry/utilities/compare-slider";
import { ScrollReveal } from "@/registry/typography/scroll-reveal";
import { LogoMarquee } from "@/registry/cms/logo-marquee";
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
import { StickyStack } from "@/registry/sections/sticky-stack";
import { VelocityMarquee } from "@/registry/typography/velocity-marquee";
import { SpiralSlider } from "@/registry/carousels/spiral-slider";
import { ImageTrail } from "@/registry/interaction/image-trail";
import { Constellation } from "@/registry/backgrounds/constellation";
import { GooeyMenu } from "@/registry/navigation/gooey-menu";
import { TerminalFrame } from "@/registry/embeds/terminal-frame";
import { OTPInput } from "@/registry/forms/otp-input";
import { SwipeDeck } from "@/registry/carousels/swipe-deck";
import { SplitFlap } from "@/registry/data/split-flap";
import { InfiniteCanvas } from "@/registry/interaction/infinite-canvas";
import { DeviceScroll } from "@/registry/sections/device-scroll";
import { HorizontalScrollGallery } from "@/registry/sections/horizontal-scroll";
import { ParallaxTiltCard } from "@/registry/interaction/tilt-card";
import { CommandPalette } from "@/registry/navigation/command-menu";
import { ParticleText } from "@/registry/typography/particle-text";
import { SpotlightCardGrid } from "@/registry/layout/spotlight-grid";
import { HeroParallax } from "@/registry/sections/hero-parallax";
import { ScrollTimeline } from "@/registry/sections/scroll-timeline";
import { TestimonialStack } from "@/registry/carousels/testimonial-stack";
import { ExpandingPanels } from "@/registry/cms/expanding-panels";
import { LampGlow } from "@/registry/backgrounds/lamp-glow";
import { MagneticDotGrid } from "@/registry/interaction/magnetic-dots";
import { RippleDistortion } from "@/registry/interaction/ripple-distortion";
import { SwarmCursor } from "@/registry/interaction/swarm-cursor";
import { HalftoneReveal } from "@/registry/interaction/halftone-reveal";
import { Antigravity } from "@/registry/interaction/antigravity";
import { FluidGlass } from "@/registry/interaction/fluid-glass";
import { MoltenMetal } from "@/registry/backgrounds/molten-metal";
import { WebThreads } from "@/registry/backgrounds/web-threads";

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
  "buttons/fluid-glass-button": FluidGlassButton,
  "backgrounds/cosmic-ray": CosmicRay,
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
  "utilities/mask-hover-reveal": MaskHoverReveal,
  "interaction/cursor-pet": CursorPet,
  "backgrounds/liquid-gradient": LiquidGradient,
  "layout/glass-panels": GlassPanels,
  "interaction/gravity-gallery": GravityGallery,
  "carousels/spatial-carousel": SpatialCarousel,
  "backgrounds/kinetic-lines": KineticLines,
  "data/thermal-heatmap": ThermalHeatmap,
  "backgrounds/particle-engine": ParticleEngine,
  "backgrounds/fluid-simulation": FluidSimulation,
  "typography/particle-morph": ParticleMorph,
  "sections/scroll-showcase": ScrollShowcase,
  "utilities/compare-slider": CompareSlider,
  "typography/scroll-reveal": ScrollReveal,
  "cms/logo-marquee": LogoMarquee,
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
  "sections/sticky-stack": StickyStack,
  "typography/velocity-marquee": VelocityMarquee,
  "carousels/spiral-slider": SpiralSlider,
  "interaction/image-trail": ImageTrail,
  "backgrounds/constellation": Constellation,
  "navigation/gooey-menu": GooeyMenu,
  "embeds/terminal-frame": TerminalFrame,
  "forms/otp-input": OTPInput,
  "carousels/swipe-deck": SwipeDeck,
  "data/split-flap": SplitFlap,
  "interaction/infinite-canvas": InfiniteCanvas,
  "sections/device-scroll": DeviceScroll,
  "sections/horizontal-scroll": HorizontalScrollGallery,
  "interaction/tilt-card": ParallaxTiltCard,
  "navigation/command-menu": CommandPalette,
  "typography/particle-text": ParticleText,
  "layout/spotlight-grid": SpotlightCardGrid,
  "sections/hero-parallax": HeroParallax,
  "sections/scroll-timeline": ScrollTimeline,
  "carousels/testimonial-stack": TestimonialStack,
  "cms/expanding-panels": ExpandingPanels,
  "backgrounds/lamp-glow": LampGlow,
  "interaction/magnetic-dots": MagneticDotGrid,
  "interaction/ripple-distortion": RippleDistortion,
  "interaction/swarm-cursor": SwarmCursor,
  "interaction/halftone-reveal": HalftoneReveal,
  "interaction/antigravity": Antigravity,
  "interaction/fluid-glass": FluidGlass,
  "backgrounds/molten-metal": MoltenMetal,
  "backgrounds/web-threads": WebThreads,
  "data/world-map-connections": WorldMapConnections,
  "interaction/cube-gallery": CubeGallery,
  "interaction/cosmic-orb": CosmicOrb,
  "interaction/gallery-tunnel": GalleryTunnel,
  "interaction/blackhole": BlackHole,
};
