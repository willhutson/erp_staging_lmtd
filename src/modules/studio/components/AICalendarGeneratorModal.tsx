"use client";

import { useState, useMemo } from "react";
import { format, addMonths, startOfMonth } from "date-fns";
import {
  X,
  Sparkles,
  Calendar,
  Target,
  Palette,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  Gift,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialContentType } from "@prisma/client";
import {
  generateAICalendar,
  saveGeneratedCalendarEntries,
  getHolidaysForMonth,
  UAE_HOLIDAYS_2025,
  SOCIAL_AWARENESS_DAYS,
  type AICalendarGeneratorInput,
  type GeneratedCalendarEntry,
  type PlatformCadence,
} from "../actions/ai-calendar-actions";

interface AICalendarGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  clients: { id: string; name: string; code?: string }[];
}

type Step = "setup" | "cadence" | "preview";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "from-purple-500 to-pink-500" },
  { id: "facebook", label: "Facebook", color: "from-blue-600 to-blue-400" },
  { id: "linkedin", label: "LinkedIn", color: "from-blue-700 to-blue-500" },
  { id: "twitter", label: "Twitter/X", color: "from-gray-800 to-gray-600" },
  { id: "tiktok", label: "TikTok", color: "from-pink-500 to-cyan-400" },
];

const CONTENT_TYPES: { value: SocialContentType; label: string }[] = [
  { value: "POST", label: "Static Post" },
  { value: "CAROUSEL", label: "Carousel" },
  { value: "REEL", label: "Reel/Short" },
  { value: "STORY", label: "Story" },
  { value: "LIVE", label: "Live" },
  { value: "ARTICLE", label: "Article" },
  { value: "THREAD", label: "Thread" },
];

const DEFAULT_CADENCE: PlatformCadence = {
  instagram: { postsPerWeek: 5, contentMix: [{ type: "POST", percentage: 40 }, { type: "REEL", percentage: 40 }, { type: "STORY", percentage: 20 }] },
  facebook: { postsPerWeek: 3, contentMix: [{ type: "POST", percentage: 60 }, { type: "CAROUSEL", percentage: 40 }] },
  linkedin: { postsPerWeek: 3, contentMix: [{ type: "POST", percentage: 50 }, { type: "ARTICLE", percentage: 30 }, { type: "CAROUSEL", percentage: 20 }] },
  twitter: { postsPerWeek: 7, contentMix: [{ type: "POST", percentage: 70 }, { type: "THREAD", percentage: 30 }] },
  tiktok: { postsPerWeek: 3, contentMix: [{ type: "REEL", percentage: 100 }] },
};

export function AICalendarGeneratorModal({
  isOpen,
  onClose,
  onComplete,
  clients,
}: AICalendarGeneratorModalProps) {
  const [step, setStep] = useState<Step>("setup");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEntries, setGeneratedEntries] = useState<GeneratedCalendarEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());

  // Form state - Setup
  const [clientId, setClientId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(addMonths(new Date(), 1)));
  const [moodTheme, setMoodTheme] = useState("");
  const [goals, setGoals] = useState("");
  const [isPitchMode, setIsPitchMode] = useState(false);
  const [referenceNotes, setReferenceNotes] = useState("");
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
  const [customEvents, setCustomEvents] = useState("");

  // Form state - Cadence
  const [activePlatforms, setActivePlatforms] = useState<string[]>(["instagram", "facebook", "linkedin"]);
  const [cadence, setCadence] = useState<PlatformCadence>(DEFAULT_CADENCE);

  // Get holidays for selected month
  const monthHolidays = useMemo(() => getHolidaysForMonth(selectedMonth), [selectedMonth]);

  const selectedClient = clients.find(c => c.id === clientId);

  const handleTogglePlatform = (platform: string) => {
    setActivePlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCadenceChange = (platform: string, postsPerWeek: number) => {
    setCadence(prev => ({
      ...prev,
      [platform]: { ...prev[platform as keyof PlatformCadence], postsPerWeek },
    }));
  };

  const handleHolidayToggle = (holiday: string) => {
    setSelectedHolidays(prev =>
      prev.includes(holiday)
        ? prev.filter(h => h !== holiday)
        : [...prev, holiday]
    );
  };

  const handleGenerate = async () => {
    if (!clientId || !selectedClient) {
      setError("Please select a client");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const input: AICalendarGeneratorInput = {
      clientId,
      clientName: selectedClient.name,
      month: selectedMonth,
      moodTheme: moodTheme || "Professional and engaging",
      goals: goals || "Build brand awareness and engagement",
      holidays: selectedHolidays,
      customEvents,
      cadence: Object.fromEntries(
        Object.entries(cadence).map(([platform, config]) => [
          platform,
          activePlatforms.includes(platform) ? config : { postsPerWeek: 0, contentMix: [] },
        ])
      ) as PlatformCadence,
      isPitchMode,
      referenceNotes,
    };

    const result = await generateAICalendar(input);

    setIsGenerating(false);

    if (result.success && result.entries) {
      setGeneratedEntries(result.entries);
      setSelectedEntries(new Set(result.entries.map((_, i) => i)));
      setStep("preview");
    } else {
      setError(result.error || "Failed to generate calendar");
    }
  };

  const handleSave = async () => {
    const entriesToSave = generatedEntries.filter((_, i) => selectedEntries.has(i));

    if (entriesToSave.length === 0) {
      setError("Please select at least one entry to save");
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await saveGeneratedCalendarEntries(entriesToSave, clientId);

    setIsSaving(false);

    if (result.success) {
      onComplete();
      onClose();
      resetForm();
    } else {
      setError(result.error || "Failed to save entries");
    }
  };

  const resetForm = () => {
    setStep("setup");
    setClientId("");
    setSelectedMonth(startOfMonth(addMonths(new Date(), 1)));
    setMoodTheme("");
    setGoals("");
    setIsPitchMode(false);
    setReferenceNotes("");
    setSelectedHolidays([]);
    setCustomEvents("");
    setActivePlatforms(["instagram", "facebook", "linkedin"]);
    setCadence(DEFAULT_CADENCE);
    setGeneratedEntries([]);
    setSelectedEntries(new Set());
    setError(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const toggleEntrySelection = (index: number) => {
    setSelectedEntries(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAllEntries = () => {
    setSelectedEntries(new Set(generatedEntries.map((_, i) => i)));
  };

  const deselectAllEntries = () => {
    setSelectedEntries(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-ltd-surface-2 rounded-[var(--ltd-radius-xl)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ltd-border-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--ltd-radius-md)] bg-gradient-to-br from-ltd-primary to-ltd-primary-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-ltd-primary-text" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ltd-text-1">AI Calendar Generator</h2>
              <p className="text-sm text-ltd-text-3">
                {step === "setup" && "Step 1: Define your content strategy"}
                {step === "cadence" && "Step 2: Set posting cadence"}
                {step === "preview" && "Step 3: Review & save generated entries"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <X className="w-5 h-5 text-ltd-text-2" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 rounded-[var(--ltd-radius-md)] bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Step: Setup */}
          {step === "setup" && (
            <div className="space-y-6">
              {/* Pitch Mode Toggle */}
              <div
                onClick={() => setIsPitchMode(!isPitchMode)}
                className={cn(
                  "p-4 rounded-[var(--ltd-radius-lg)] border-2 cursor-pointer transition-all",
                  isPitchMode
                    ? "border-ltd-primary bg-ltd-primary/10"
                    : "border-ltd-border-1 hover:border-ltd-border-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-[var(--ltd-radius-md)] flex items-center justify-center",
                    isPitchMode ? "bg-ltd-primary" : "bg-ltd-surface-3"
                  )}>
                    <Briefcase className={cn(
                      "w-5 h-5",
                      isPitchMode ? "text-ltd-primary-text" : "text-ltd-text-2"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-ltd-text-1">Sample Content Calendar for Pitch</h3>
                      {isPitchMode && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-ltd-primary text-ltd-primary-text rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ltd-text-3">
                      Generate showcase-quality content ideas for RFP demos
                    </p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isPitchMode ? "border-ltd-primary bg-ltd-primary" : "border-ltd-border-2"
                  )}>
                    {isPitchMode && <Check className="w-4 h-4 text-ltd-primary-text" />}
                  </div>
                </div>
              </div>

              {/* Client & Month Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-2 mb-2">
                    Client
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3 text-ltd-text-1 focus:outline-none focus:border-ltd-primary"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.code && `(${client.code})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ltd-text-2 mb-2">
                    Target Month
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}
                      className="p-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3"
                    >
                      <ChevronLeft className="w-4 h-4 text-ltd-text-2" />
                    </button>
                    <div className="flex-1 px-4 py-2 text-center rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3 text-ltd-text-1 font-medium">
                      {format(selectedMonth, "MMMM yyyy")}
                    </div>
                    <button
                      onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                      className="p-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3"
                    >
                      <ChevronRight className="w-4 h-4 text-ltd-text-2" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mood/Theme */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ltd-text-2 mb-2">
                  <Palette className="w-4 h-4" />
                  Mood / Theme / Aesthetic
                </label>
                <textarea
                  value={moodTheme}
                  onChange={(e) => setMoodTheme(e.target.value)}
                  placeholder="e.g., Minimalist and modern, warm earth tones, bold and playful, professional yet approachable..."
                  className="w-full px-3 py-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:border-ltd-primary resize-none"
                  rows={2}
                />
              </div>

              {/* Goals */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ltd-text-2 mb-2">
                  <Target className="w-4 h-4" />
                  Goals / Objectives / Key Messages
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g., Launch new product line, increase engagement by 20%, promote sustainability initiative, drive traffic to website..."
                  className="w-full px-3 py-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:border-ltd-primary resize-none"
                  rows={3}
                />
              </div>

              {/* Holidays & Events */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ltd-text-2 mb-2">
                  <Gift className="w-4 h-4" />
                  Holidays & Events for {format(selectedMonth, "MMMM")}
                </label>
                {monthHolidays.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3">
                    {monthHolidays.map((holiday) => (
                      <button
                        key={holiday.date}
                        onClick={() => handleHolidayToggle(`${holiday.name} (${format(new Date(holiday.date), "MMM d")})`)}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-full border transition-colors",
                          selectedHolidays.includes(`${holiday.name} (${format(new Date(holiday.date), "MMM d")})`)
                            ? "border-ltd-primary bg-ltd-primary/20 text-ltd-primary"
                            : "border-ltd-border-2 text-ltd-text-2 hover:border-ltd-primary/50"
                        )}
                      >
                        {holiday.name}
                        <span className="ml-1 text-ltd-text-3">
                          {format(new Date(holiday.date), "d")}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ltd-text-3 p-3 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3">
                    No major holidays in this month. Add custom events below.
                  </p>
                )}
              </div>

              {/* Custom Events */}
              <div>
                <label className="block text-sm font-medium text-ltd-text-2 mb-2">
                  Custom Events / Campaigns
                </label>
                <textarea
                  value={customEvents}
                  onChange={(e) => setCustomEvents(e.target.value)}
                  placeholder="e.g., Product launch on Jan 15, Company anniversary on Jan 20, Flash sale week Jan 25-31..."
                  className="w-full px-3 py-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:border-ltd-primary resize-none"
                  rows={2}
                />
              </div>

              {/* Reference Notes */}
              <div>
                <label className="block text-sm font-medium text-ltd-text-2 mb-2">
                  What Worked Before (Reference)
                </label>
                <textarea
                  value={referenceNotes}
                  onChange={(e) => setReferenceNotes(e.target.value)}
                  placeholder="e.g., Behind-the-scenes content gets high engagement, User testimonials perform well, Reels with trending audio drive views..."
                  className="w-full px-3 py-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-3 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:border-ltd-primary resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step: Cadence */}
          {step === "cadence" && (
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-ltd-text-2 mb-3">
                  Active Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handleTogglePlatform(platform.id)}
                      className={cn(
                        "px-4 py-2 rounded-[var(--ltd-radius-md)] border font-medium text-sm transition-all",
                        activePlatforms.includes(platform.id)
                          ? `bg-gradient-to-r ${platform.color} text-white border-transparent`
                          : "border-ltd-border-1 text-ltd-text-2 hover:border-ltd-border-2"
                      )}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cadence Settings per Platform */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-ltd-text-2">
                  <Clock className="w-4 h-4" />
                  Posts Per Week
                </label>
                {PLATFORMS.filter(p => activePlatforms.includes(p.id)).map((platform) => (
                  <div
                    key={platform.id}
                    className="p-4 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-ltd-text-1">{platform.label}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCadenceChange(
                            platform.id,
                            Math.max(0, cadence[platform.id as keyof PlatformCadence].postsPerWeek - 1)
                          )}
                          className="w-8 h-8 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-2 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold text-ltd-text-1">
                          {cadence[platform.id as keyof PlatformCadence].postsPerWeek}
                        </span>
                        <button
                          onClick={() => handleCadenceChange(
                            platform.id,
                            Math.min(14, cadence[platform.id as keyof PlatformCadence].postsPerWeek + 1)
                          )}
                          className="w-8 h-8 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-2 flex items-center justify-center"
                        >
                          +
                        </button>
                        <span className="text-sm text-ltd-text-3 ml-2">per week</span>
                      </div>
                    </div>
                    <p className="text-xs text-ltd-text-3">
                      ≈ {Math.round(cadence[platform.id as keyof PlatformCadence].postsPerWeek * 4.3)} posts/month
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-ltd-text-1">
                    Generated {generatedEntries.length} entries
                  </h3>
                  <p className="text-sm text-ltd-text-3">
                    {selectedEntries.size} selected to save
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllEntries}
                    className="px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllEntries}
                    className="px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {generatedEntries.map((entry, index) => (
                  <div
                    key={index}
                    onClick={() => toggleEntrySelection(index)}
                    className={cn(
                      "p-4 rounded-[var(--ltd-radius-lg)] border cursor-pointer transition-all",
                      selectedEntries.has(index)
                        ? "border-ltd-primary bg-ltd-primary/5"
                        : "border-ltd-border-1 bg-ltd-surface-3 opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1 h-full min-h-[60px] rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-ltd-text-1 truncate">
                            {entry.title}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-ltd-surface-2 text-ltd-text-3">
                            {entry.contentType}
                          </span>
                        </div>
                        <p className="text-sm text-ltd-text-2 mb-2 line-clamp-2">
                          {entry.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-ltd-text-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(entry.scheduledDate), "MMM d")} at {entry.scheduledTime}
                          </span>
                          <span>{entry.platforms.join(", ")}</span>
                        </div>
                        {entry.aiSuggestion && (
                          <div className="mt-2 p-2 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-xs text-ltd-text-2 italic">
                            "{entry.aiSuggestion}"
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedEntries.has(index)
                          ? "border-ltd-primary bg-ltd-primary"
                          : "border-ltd-border-2"
                      )}>
                        {selectedEntries.has(index) && (
                          <Check className="w-4 h-4 text-ltd-primary-text" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ltd-border-1">
          <div>
            {step !== "setup" && (
              <button
                onClick={() => setStep(step === "preview" ? "cadence" : "setup")}
                className="px-4 py-2 text-sm text-ltd-text-2 hover:text-ltd-text-1 transition-colors"
                disabled={isGenerating || isSaving}
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
              disabled={isGenerating || isSaving}
            >
              Cancel
            </button>

            {step === "setup" && (
              <button
                onClick={() => setStep("cadence")}
                disabled={!clientId}
                className="px-4 py-2 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Set Cadence
              </button>
            )}

            {step === "cadence" && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || activePlatforms.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Calendar
                  </>
                )}
              </button>
            )}

            {step === "preview" && (
              <button
                onClick={handleSave}
                disabled={isSaving || selectedEntries.size === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save {selectedEntries.size} Entries
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
