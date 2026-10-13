"use server";

import { revalidatePath as rp } from "next/cache";

export async function revalidatePaths(paths: string[]) {
  for (const p of paths) {
    rp(p);
  }
}
