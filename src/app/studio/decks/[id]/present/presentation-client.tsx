"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Grid,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeckWithRelations, DeckSlide } from "@/modules/studio/types";

interface PresentationClientProps {
  deck: DeckWithRelations;
}

export function PresentationClient({ deck }: PresentationClientProps) {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = deck.slides || [];
  const currentSlide = slides[currentSlideIndex];

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length) {
        setCurrentSlideIndex(index);
        setShowGrid(false);
      }
    },
    [slides.length]
  );

  const goNext = useCallback(() => {
    goToSlide(currentSlideIndex + 1);
  }, [currentSlideIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(currentSlideIndex - 1);
  }, [currentSlideIndex, goToSlide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
          goNext();
          break;
        case "ArrowLeft":
        case "Backspace":
          goPrev();
          break;
        case "Escape":
          if (showGrid) {
            setShowGrid(false);
          } else {
            router.push(`/decks/${deck.id}`);
          }
          break;
        case "g":
          setShowGrid((prev) => !prev);
          break;
        case "n":
          setShowNotes((prev) => !prev);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "Home":
          goToSlide(0);
          break;
        case "End":
          goToSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, goToSlide, router, deck.id, showGrid, slides.length, toggleFullscreen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Slide Display */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {currentSlide ? (
          <div className="w-full max-w-6xl aspect-video">
            <SlideView slide={currentSlide} />
          </div>
        ) : (
          <div className="text-white/50 text-xl">No slides</div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          disabled={currentSlideIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button
          onClick={goNext}
          disabled={currentSlideIndex === slides.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/decks/${deck.id}`)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <span className="text-white/70 text-sm">{deck.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showGrid ? "bg-white/20" : "hover:bg-white/10"
            )}
            title="Grid view (G)"
          >
            <Grid className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showNotes ? "bg-white/20" : "hover:bg-white/10"
            )}
            title="Speaker notes (N)"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Fullscreen (F)"
          >
            <Maximize2 className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentSlideIndex ? "bg-white" : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Speaker Notes Panel */}
      {showNotes && currentSlide?.speakerNotes && (
        <div className="absolute bottom-16 left-4 right-4 max-w-2xl mx-auto p-4 bg-white/95 rounded-lg shadow-xl">
          <div className="text-xs font-medium text-gray-500 mb-1">Speaker Notes</div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {currentSlide.speakerNotes}
          </div>
        </div>
      )}

      {/* Grid View Overlay */}
      {showGrid && (
        <div className="absolute inset-0 bg-black/90 z-20 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-medium">All Slides</h2>
              <button
                onClick={() => setShowGrid(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                    index === currentSlideIndex
                      ? "border-white ring-2 ring-white/50"
                      : "border-transparent hover:border-white/50"
                  )}
                >
                  <div className="relative w-full h-full bg-white">
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                      {index + 1}
                    </div>
                    <div className="p-2 h-full flex items-center justify-center text-center">
                      <span className="text-xs text-gray-700 truncate">
                        {slide.title || slide.layoutType}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Full slide view for presentation
function SlideView({ slide }: { slide: DeckSlide }) {
  const content = (slide.content || {}) as Record<string, unknown>;

  return (
    <div
      className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden"
      style={{
        backgroundColor: slide.backgroundColor || undefined,
        backgroundImage: slide.backgroundUrl ? `url(${slide.backgroundUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full h-full p-12 flex flex-col">
        {/* Title Slide */}
        {slide.layoutType === "TITLE" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {slide.title && (
              <h1 className="text-6xl font-bold text-gray-900 mb-6">{slide.title}</h1>
            )}
            {slide.subtitle && (
              <p className="text-2xl text-gray-600">{slide.subtitle}</p>
            )}
          </div>
        )}

        {/* Content */}
        {slide.layoutType === "CONTENT" && (
          <div className="flex-1 flex flex-col">
            {slide.title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-8">{slide.title}</h2>
            )}
            {typeof content.body === "string" && content.body && (
              <p className="text-xl text-gray-700 whitespace-pre-wrap flex-1">
                {content.body}
              </p>
            )}
          </div>
        )}

        {/* Two Column */}
        {slide.layoutType === "TWO_COLUMN" && (
          <div className="flex-1 flex flex-col">
            {slide.title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-8">{slide.title}</h2>
            )}
            <div className="flex-1 grid grid-cols-2 gap-8">
              <div className="text-lg text-gray-700 whitespace-pre-wrap">
                {(content.left as string) || ""}
              </div>
              <div className="text-lg text-gray-700 whitespace-pre-wrap">
                {(content.right as string) || ""}
              </div>
            </div>
          </div>
        )}

        {/* Quote */}
        {slide.layoutType === "QUOTE" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-8xl text-emerald-500/50 leading-none mb-4">"</span>
            {slide.title && (
              <blockquote className="text-3xl italic text-gray-800 max-w-4xl mb-6">
                {slide.title}
              </blockquote>
            )}
            {slide.subtitle && (
              <cite className="text-xl text-gray-600 not-italic">— {slide.subtitle}</cite>
            )}
          </div>
        )}

        {/* Stats */}
        {slide.layoutType === "STATS" && (
          <div className="flex-1 flex flex-col">
            {slide.title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-12">{slide.title}</h2>
            )}
            <div className="flex-1 grid grid-cols-3 gap-8 items-center">
              {((content.stats as { value: string; label: string }[]) || []).map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-6xl font-bold text-emerald-500 mb-2">
                    {stat.value || "—"}
                  </div>
                  <div className="text-lg text-gray-600">{stat.label || ""}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default/Other Layouts */}
        {!["TITLE", "CONTENT", "TWO_COLUMN", "QUOTE", "STATS"].includes(slide.layoutType) && (
          <div className="flex-1 flex flex-col">
            {slide.title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{slide.title}</h2>
            )}
            {slide.subtitle && (
              <p className="text-xl text-gray-600">{slide.subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
