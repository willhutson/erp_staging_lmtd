"use client";

import { useState, useTransition } from "react";
import { Upload, Palette, Type, Square, Sun, Moon, Monitor, Loader2 } from "lucide-react";
import {
  ThemeSettings,
  mergeTheme,
  availableFonts,
  borderRadiusOptions,
} from "@/lib/theme";
import { updateThemeSettings } from "@/modules/settings/actions/theme-actions";

interface BrandingFormProps {
  initialTheme: Partial<ThemeSettings> | null;
  organizationName: string;
  logo: string | null;
}

export function BrandingForm({ initialTheme, organizationName, logo }: BrandingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const theme = mergeTheme(initialTheme);

  const [colors, setColors] = useState(theme.colors);
  const [fonts, setFonts] = useState(theme.fonts);
  const [borderRadius, setBorderRadius] = useState(theme.borderRadius);
  const [mode, setMode] = useState(theme.mode);

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateThemeSettings({
        colors,
        fonts,
        borderRadius,
        mode,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Logo</h2>

        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-3">
              Upload your organization logo. Recommended size: 200x200px.
              Supported formats: PNG, JPG, SVG.
            </p>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Upload Logo
            </button>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Brand Colors
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <ColorInput
            label="Primary Color"
            value={colors.primary}
            onChange={(v) => handleColorChange("primary", v)}
            description="Used for buttons, links, and accents"
          />
          <ColorInput
            label="Primary Dark"
            value={colors.primaryDark}
            onChange={(v) => handleColorChange("primaryDark", v)}
            description="Used for hover states and emphasis"
          />
          <ColorInput
            label="Accent Color"
            value={colors.accent}
            onChange={(v) => handleColorChange("accent", v)}
            description="Secondary accent color"
          />
          <ColorInput
            label="Background"
            value={colors.background}
            onChange={(v) => handleColorChange("background", v)}
            description="Page background color"
          />
          <ColorInput
            label="Surface"
            value={colors.surface}
            onChange={(v) => handleColorChange("surface", v)}
            description="Card and component backgrounds"
          />
          <ColorInput
            label="Border"
            value={colors.border}
            onChange={(v) => handleColorChange("border", v)}
            description="Border and divider color"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
          <div className="flex items-center gap-3">
            <button
              style={{ backgroundColor: colors.primary }}
              className="px-4 py-2 text-gray-900 font-medium rounded-lg"
            >
              Primary Button
            </button>
            <button
              style={{ backgroundColor: colors.primaryDark }}
              className="px-4 py-2 text-white font-medium rounded-lg"
            >
              Dark Button
            </button>
            <span style={{ color: colors.primary }} className="font-medium">
              Link Text
            </span>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Type className="w-5 h-5" />
          Typography
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <select
              value={fonts.heading}
              onChange={(e) => {
                setFonts((prev) => ({ ...prev, heading: e.target.value }));
                setSaved(false);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            >
              {availableFonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Font
            </label>
            <select
              value={fonts.body}
              onChange={(e) => {
                setFonts((prev) => ({ ...prev, body: e.target.value }));
                setSaved(false);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            >
              {availableFonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Square className="w-5 h-5" />
          Appearance
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <select
              value={borderRadius}
              onChange={(e) => {
                setBorderRadius(e.target.value as ThemeSettings["borderRadius"]);
                setSaved(false);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            >
              {borderRadiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode("light");
                  setSaved(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  mode === "light"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => {
                  setMode("dark");
                  setSaved(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  mode === "dark"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => {
                  setMode("system");
                  setSaved(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  mode === "system"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Monitor className="w-4 h-4" />
                System
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Branding */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Email Branding
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email From Name
            </label>
            <input
              type="text"
              defaultValue={organizationName}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              placeholder="e.g., TeamLMTD"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Footer Text
            </label>
            <textarea
              rows={2}
              defaultValue={`© ${organizationName}. All rights reserved.`}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {saved && (
          <span className="px-4 py-2 text-green-600 font-medium">
            Changes saved!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] uppercase"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}
