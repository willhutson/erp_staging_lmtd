// Re-export prisma as db for compatibility with studio module
import prisma from "./prisma";

export const db = prisma;
export default prisma;
