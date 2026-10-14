"use server";

import { revalidatePath as rp } from "next/cache";

export async function revalidatePaths(paths: string[]) {
  for (const p of paths) {
    try {
      rp(p);
    } catch {
      // In Next.js 15+, revalidatePath() is not permitted during a React Server Component render pass.
      // Silently catching here allows actions to safely execute during page rendering (e.g. payment confirmation)
      // while preserving normal cache revalidation when actions are invoked from client triggers.
    }
  }
}
