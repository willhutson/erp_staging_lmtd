/**
 * UAE National Holidays Configuration
 *
 * Includes both fixed and Islamic calendar holidays.
 * Islamic holidays are approximations and should be verified annually.
 *
 * @module config/holidays/uae
 */

export interface Holiday {
  name: string;
  nameAr: string;
  date: string; // ISO date format YYYY-MM-DD
  duration: number; // Number of days
  isIslamic: boolean; // Islamic calendar holidays vary each year
  contentThemes?: string[]; // Suggested content themes for clients
  hashtags?: string[];
}

export interface YearlyHolidays {
  year: number;
  holidays: Holiday[];
  lastUpdated: string;
}

/**
 * UAE Holidays for 2025
 *
 * Islamic holidays are based on predicted dates and should be
 * confirmed closer to the date as they depend on moon sighting.
 */
export const UAE_HOLIDAYS_2025: YearlyHolidays = {
  year: 2025,
  lastUpdated: "2024-12-01",
  holidays: [
    // Fixed Holidays
    {
      name: "New Year's Day",
      nameAr: "رأس السنة الميلادية",
      date: "2025-01-01",
      duration: 1,
      isIslamic: false,
      contentThemes: [
        "New beginnings",
        "2025 goals",
        "Year in review",
        "Thank you messages",
      ],
      hashtags: ["#HappyNewYear", "#NewYear2025", "#UAE", "#Dubai"],
    },
    {
      name: "Emirati Mother's Day",
      nameAr: "يوم الأم الإماراتي",
      date: "2025-03-21",
      duration: 1,
      isIslamic: false,
      contentThemes: [
        "Celebrating mothers",
        "Family love",
        "Appreciation",
        "Gratitude",
        "Emirati women",
        "Strong mothers",
      ],
      hashtags: [
        "#MothersDay",
        "#EmiratiMothersDay",
        "#يوم_الأم",
        "#UAE",
        "#عيد_الأم",
        "#الإمارات",
      ],
    },
    {
      name: "Martyrs Day (Commemoration Day)",
      nameAr: "يوم الشهيد",
      date: "2025-11-30",
      duration: 1,
      isIslamic: false,
      contentThemes: [
        "Heroes tribute",
        "Remembrance",
        "National pride",
        "Gratitude",
      ],
      hashtags: ["#MartyrsDay", "#CommemorationDay", "#يوم_الشهيد", "#UAE", "#الإمارات"],
    },
    {
      name: "UAE National Day",
      nameAr: "اليوم الوطني الإماراتي",
      date: "2025-12-02",
      duration: 2, // Dec 2-3
      isIslamic: false,
      contentThemes: [
        "National pride",
        "UAE achievements",
        "Spirit of the union",
        "Leadership",
        "Heritage",
        "Future vision",
      ],
      hashtags: [
        "#UAENationalDay",
        "#UAE54",
        "#SpiritOfTheUnion",
        "#اليوم_الوطني",
        "#الإمارات",
      ],
    },

    // Islamic Holidays (2025 estimated dates)
    {
      name: "Eid Al Fitr",
      nameAr: "عيد الفطر",
      date: "2025-03-30",
      duration: 4, // Usually 3-4 days
      isIslamic: true,
      contentThemes: [
        "Celebration",
        "Family gatherings",
        "Gratitude",
        "New beginnings",
        "Giving",
        "Togetherness",
      ],
      hashtags: [
        "#EidMubarak",
        "#EidAlFitr",
        "#عيد_الفطر",
        "#عيد_مبارك",
        "#UAE",
      ],
    },
    {
      name: "Arafat Day",
      nameAr: "يوم عرفة",
      date: "2025-06-05",
      duration: 1,
      isIslamic: true,
      contentThemes: ["Reflection", "Prayer", "Spiritual journey", "Pilgrimage"],
      hashtags: ["#ArafatDay", "#يوم_عرفة", "#Hajj", "#الحج"],
    },
    {
      name: "Eid Al Adha",
      nameAr: "عيد الأضحى",
      date: "2025-06-06",
      duration: 4,
      isIslamic: true,
      contentThemes: [
        "Sacrifice",
        "Family",
        "Generosity",
        "Community",
        "Gratitude",
        "Celebration",
      ],
      hashtags: [
        "#EidAlAdha",
        "#EidMubarak",
        "#عيد_الأضحى",
        "#عيد_مبارك",
        "#UAE",
      ],
    },
    {
      name: "Islamic New Year",
      nameAr: "رأس السنة الهجرية",
      date: "2025-06-26",
      duration: 1,
      isIslamic: true,
      contentThemes: [
        "New beginnings",
        "Reflection",
        "Islamic heritage",
        "Hope",
      ],
      hashtags: [
        "#IslamicNewYear",
        "#Hijri1447",
        "#رأس_السنة_الهجرية",
        "#هجري",
      ],
    },
    {
      name: "Prophet's Birthday (Mawlid)",
      nameAr: "المولد النبوي الشريف",
      date: "2025-09-04",
      duration: 1,
      isIslamic: true,
      contentThemes: [
        "Celebration",
        "Islamic values",
        "Peace",
        "Compassion",
        "Unity",
      ],
      hashtags: [
        "#ProphetsBirthday",
        "#Mawlid",
        "#المولد_النبوي",
        "#محمد_رسول_الله",
      ],
    },
  ],
};

/**
 * UAE Holidays for 2026 (Estimated)
 */
export const UAE_HOLIDAYS_2026: YearlyHolidays = {
  year: 2026,
  lastUpdated: "2024-12-01",
  holidays: [
    {
      name: "New Year's Day",
      nameAr: "رأس السنة الميلادية",
      date: "2026-01-01",
      duration: 1,
      isIslamic: false,
      contentThemes: ["New beginnings", "2026 goals", "Year in review"],
      hashtags: ["#HappyNewYear", "#NewYear2026", "#UAE"],
    },
    {
      name: "Emirati Mother's Day",
      nameAr: "يوم الأم الإماراتي",
      date: "2026-03-21",
      duration: 1,
      isIslamic: false,
      contentThemes: [
        "Celebrating mothers",
        "Family love",
        "Appreciation",
        "Gratitude",
      ],
      hashtags: [
        "#MothersDay",
        "#EmiratiMothersDay",
        "#يوم_الأم",
        "#عيد_الأم",
      ],
    },
    {
      name: "Eid Al Fitr",
      nameAr: "عيد الفطر",
      date: "2026-03-20",
      duration: 4,
      isIslamic: true,
      contentThemes: ["Celebration", "Family", "Gratitude"],
      hashtags: ["#EidMubarak", "#EidAlFitr", "#عيد_الفطر"],
    },
    {
      name: "Arafat Day",
      nameAr: "يوم عرفة",
      date: "2026-05-26",
      duration: 1,
      isIslamic: true,
      contentThemes: ["Reflection", "Pilgrimage"],
      hashtags: ["#ArafatDay", "#Hajj"],
    },
    {
      name: "Eid Al Adha",
      nameAr: "عيد الأضحى",
      date: "2026-05-27",
      duration: 4,
      isIslamic: true,
      contentThemes: ["Sacrifice", "Family", "Celebration"],
      hashtags: ["#EidAlAdha", "#EidMubarak", "#عيد_الأضحى"],
    },
    {
      name: "Islamic New Year",
      nameAr: "رأس السنة الهجرية",
      date: "2026-06-16",
      duration: 1,
      isIslamic: true,
      contentThemes: ["New beginnings", "Reflection"],
      hashtags: ["#IslamicNewYear", "#Hijri1448"],
    },
    {
      name: "Prophet's Birthday (Mawlid)",
      nameAr: "المولد النبوي الشريف",
      date: "2026-08-25",
      duration: 1,
      isIslamic: true,
      contentThemes: ["Celebration", "Peace"],
      hashtags: ["#ProphetsBirthday", "#Mawlid"],
    },
    {
      name: "Martyrs Day (Commemoration Day)",
      nameAr: "يوم الشهيد",
      date: "2026-11-30",
      duration: 1,
      isIslamic: false,
      contentThemes: [
        "Heroes tribute",
        "Remembrance",
        "National pride",
        "Gratitude",
      ],
      hashtags: ["#MartyrsDay", "#CommemorationDay", "#يوم_الشهيد", "#UAE"],
    },
    {
      name: "UAE National Day",
      nameAr: "اليوم الوطني الإماراتي",
      date: "2026-12-02",
      duration: 2,
      isIslamic: false,
      contentThemes: ["National pride", "UAE achievements"],
      hashtags: ["#UAENationalDay", "#UAE55"],
    },
  ],
};

// Export all years
export const ALL_HOLIDAYS: Record<number, YearlyHolidays> = {
  2025: UAE_HOLIDAYS_2025,
  2026: UAE_HOLIDAYS_2026,
};

/**
 * Get holidays for a specific year
 */
export function getHolidaysForYear(year: number): Holiday[] {
  return ALL_HOLIDAYS[year]?.holidays || [];
}

/**
 * Get upcoming holidays within a date range
 */
export function getUpcomingHolidays(
  fromDate: Date,
  daysAhead: number = 30
): Holiday[] {
  const endDate = new Date(fromDate);
  endDate.setDate(endDate.getDate() + daysAhead);

  const year = fromDate.getFullYear();
  const nextYear = year + 1;

  const holidays = [
    ...getHolidaysForYear(year),
    ...getHolidaysForYear(nextYear),
  ];

  return holidays.filter((h) => {
    const holidayDate = new Date(h.date);
    return holidayDate >= fromDate && holidayDate <= endDate;
  });
}

/**
 * Get the next upcoming holiday
 */
export function getNextHoliday(fromDate: Date = new Date()): Holiday | null {
  const upcoming = getUpcomingHolidays(fromDate, 365);
  return upcoming.length > 0 ? upcoming[0] : null;
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date): Holiday | null {
  const dateStr = date.toISOString().split("T")[0];
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year);

  for (const holiday of holidays) {
    const holidayStart = new Date(holiday.date);
    const holidayEnd = new Date(holiday.date);
    holidayEnd.setDate(holidayEnd.getDate() + holiday.duration - 1);

    if (date >= holidayStart && date <= holidayEnd) {
      return holiday;
    }
  }

  return null;
}

/**
 * Content planning reminder thresholds (days before holiday)
 */
export const CONTENT_PLANNING_REMINDERS = {
  FIRST_REMINDER: 30, // 30 days: Start brainstorming
  SECOND_REMINDER: 14, // 14 days: Finalize concepts
  FINAL_REMINDER: 7, // 7 days: Content should be ready
};

/**
 * Leave planning reminder thresholds (days before holiday)
 */
export const LEAVE_PLANNING_REMINDERS = {
  FIRST_REMINDER: 14, // 14 days: Plan your leave
  FINAL_REMINDER: 7, // 7 days: Last call for leave requests
};
