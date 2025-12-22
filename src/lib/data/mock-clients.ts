import type { Client } from "@/types/agency"

// Real LMTD clients from the database
export const mockClients: Client[] = [
  {
    id: "ccad",
    name: "Creative City Abu Dhabi",
    region: "UAE",
    activeCampaigns: 8,
    spendMTD: 160000,
    health: "good",
    owner: "Cornel Jerome Holland",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "det",
    name: "Department of Economy and Tourism",
    region: "UAE",
    activeCampaigns: 6,
    spendMTD: 120000,
    health: "good",
    owner: "Haidy Hany Guirguis",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "adek",
    name: "Abu Dhabi Department of Education and Knowledge",
    region: "UAE",
    activeCampaigns: 4,
    spendMTD: 80000,
    health: "warning",
    owner: "Salma Ehab Ahmed",
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: "ecd",
    name: "Emirates Culinary District",
    region: "UAE",
    activeCampaigns: 2,
    spendMTD: 45000,
    health: "good",
    owner: "Sarwath Abdul Wahid",
    status: "active",
    createdAt: "2024-11-05",
  },
]
