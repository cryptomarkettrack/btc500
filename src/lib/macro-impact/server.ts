import { createServerFn } from "@tanstack/react-start";
import { buildMacroImpactData } from "./analyze";
import type { DashboardData } from "./types";

export const getMacroImpactData = createServerFn({ method: "GET" }).handler(async () => {
  return buildMacroImpactData();
});
