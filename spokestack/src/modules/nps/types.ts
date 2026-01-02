"use server";

import type { NPSSurvey, NPSResponse, SurveyStatus, NPSCategory } from "@prisma/client";

// Survey with relations
export type NPSSurveyWithRelations = NPSSurvey & {
  client: { id: string; name: string; code: string };
  sentTo: { id: string; name: string; email: string | null } | null;
  responses: NPSResponse[];
  _count?: { responses: number };
};

// Response with relations
export type NPSResponseWithRelations = NPSResponse & {
  survey: NPSSurvey & {
    client: { id: string; name: string; code: string };
  };
  contact?: { id: string; name: string; email: string | null } | null;
  portalUser?: { id: string; name: string } | null;
};

// Stats result
export interface NPSStatsResult {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  avgScore: number;
  byQuarter: Array<{ quarter: number; responses: number; npsScore: number | null }>;
  byClient: Array<{
    client: { id: string; name: string; code: string };
    responses: number;
    npsScore: number;
    avgScore: number;
  }>;
}

// Input types
export interface CreateNPSSurveyInput {
  clientId: string;
  quarter: number;
  year: number;
  sentToId?: string;
}

export interface SubmitNPSResponseInput {
  surveyId: string;
  score: number;
  whatWeDoWell?: string;
  whatToImprove?: string;
  additionalNotes?: string;
  contactId?: string;
  portalUserId?: string;
}

export interface NPSSurveyFilters {
  status?: SurveyStatus;
  year?: number;
  clientId?: string;
}

export { SurveyStatus, NPSCategory };
