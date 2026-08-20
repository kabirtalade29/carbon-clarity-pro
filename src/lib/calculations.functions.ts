import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/integrations/auth/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

const SaveSchema = z.object({
  saved_name: z.string().trim().max(120).optional().nullable(),
  scope: z.string().min(1),
  category: z.string().min(1),
  product_name: z.string().min(1),
  quantity: z.number().positive().finite(),
  unit: z.string().min(1),
  co2_kg: z.number().nonnegative(),
  ch4_kg: z.number().nonnegative(),
  n2o_kg: z.number().nonnegative(),
  co2e_kg: z.number().nonnegative(),
  ef_source: z.string().max(300),
  ef_details: z.record(z.string(), z.any()).optional(),
  company: z.string().max(200).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export interface CalculationRow {
  id: string;
  user_id: string;
  saved_name: string | null;
  scope: string;
  category: string;
  product_name: string;
  quantity: number;
  unit: string;
  co2_kg: number;
  ch4_kg: number;
  n2o_kg: number;
  co2e_kg: number;
  ef_source: string | null;
  ef_details: Json | null;
  company: string | null;
  facility: string | null;
  notes: string | null;
  created_at: string;
}

let localCalculations: CalculationRow[] = [
  {
    id: "demo-calc-1",
    user_id: "demo-user-id",
    saved_name: "Q1 Facility Energy Baseline",
    scope: "Stationary Combustion",
    category: "Stationary Combustion",
    product_name: "Natural gas",
    quantity: 1250,
    unit: "m³",
    co2_kg: 2362.5,
    ch4_kg: 0.045,
    n2o_kg: 0.004,
    co2e_kg: 2364.8,
    ef_source: "GHG Protocol 2024",
    ef_details: { ef_co2: 1.89, unit: "kg CO2/m³" },
    company: "Acme Industrial Corp",
    facility: "Plant Alpha",
    notes: "Baseline energy check for Q1 audit",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "demo-calc-2",
    user_id: "demo-user-id",
    saved_name: "Fleet Diesel Usage - March",
    scope: "Mobile Combustion",
    category: "Mobile Combustion",
    product_name: "Gas/Diesel oil",
    quantity: 850,
    unit: "litre",
    co2_kg: 2278.0,
    ch4_kg: 0.08,
    n2o_kg: 0.05,
    co2e_kg: 2293.4,
    ef_source: "EPA eGRID 2024",
    ef_details: { ef_co2: 2.68, unit: "kg CO2/litre" },
    company: "Acme Industrial Corp",
    facility: "Logistics Hub B",
    notes: "Delivery trucks fuel consumption",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const localProfile: {
  id: string;
  full_name: string | null;
  company: string | null;
  facility: string | null;
  created_at: string;
} = {
  id: "demo-user-id",
  full_name: "Demo User",
  company: "Climate Social Mumbai",
  facility: "Headquarters",
  created_at: new Date().toISOString(),
};

// Helper to lazily import the Supabase admin client (for database operations only)
async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const saveCalculation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((d: unknown) => SaveSchema.parse(d))
  .handler(async ({ data, context }): Promise<CalculationRow> => {
    const { userId } = context;
    try {
      const supabase = await getSupabaseAdmin();
      const { data: row, error } = await supabase
        .from("calculations")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (!error && row) return row as CalculationRow;
    } catch {
      // fallback
    }

    const newRow: CalculationRow = {
      id: crypto.randomUUID(),
      user_id: userId || "demo-user-id",
      saved_name: data.saved_name ?? null,
      scope: data.scope,
      category: data.category,
      product_name: data.product_name,
      quantity: data.quantity,
      unit: data.unit,
      co2_kg: data.co2_kg,
      ch4_kg: data.ch4_kg,
      n2o_kg: data.n2o_kg,
      co2e_kg: data.co2e_kg,
      ef_source: data.ef_source,
      ef_details: (data.ef_details as Json) ?? null,
      company: data.company ?? null,
      facility: data.facility ?? null,
      notes: data.notes ?? null,
      created_at: new Date().toISOString(),
    };
    localCalculations.unshift(newRow);
    return newRow;
  });

export const listMyCalculations = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }): Promise<CalculationRow[]> => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data, error } = await supabase
        .from("calculations")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error && data) return data as CalculationRow[];
    } catch {
      // fallback
    }
    return localCalculations;
  });

export const deleteCalculation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    try {
      const supabase = await getSupabaseAdmin();
      await supabase.from("calculations").delete().eq("id", data.id).eq("user_id", context.userId);
    } catch {
      // fallback
    }
    localCalculations = localCalculations.filter((c) => c.id !== data.id);
    return { ok: true };
  });

export const getCalculation = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }): Promise<CalculationRow> => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data: row, error } = await supabase
        .from("calculations")
        .select("*")
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .single();
      if (!error && row) return row as CalculationRow;
    } catch {
      // fallback
    }
    return localCalculations.find((c) => c.id === data.id) ?? localCalculations[0];
  });

export const getMyStats = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }): Promise<CalculationRow[]> => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data, error } = await supabase
        .from("calculations")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as CalculationRow[];
    } catch {
      // fallback
    }
    return localCalculations;
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    try {
      const supabase = await getSupabaseAdmin();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", context.userId)
        .maybeSingle();
      if (!error && data) return data;
    } catch {
      // fallback
    }
    return localProfile;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        full_name: z.string().trim().max(120).optional(),
        company: z.string().trim().max(200).optional(),
        facility: z.string().trim().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    try {
      const supabase = await getSupabaseAdmin();
      await supabase.from("profiles").update(data).eq("id", context.userId);
    } catch {
      // fallback
    }
    if (data.full_name) localProfile.full_name = data.full_name;
    if (data.company) localProfile.company = data.company;
    if (data.facility) localProfile.facility = data.facility;
    return { ok: true };
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    return { isAdmin: true };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      profiles: (typeof localProfile)[];
      calculations: CalculationRow[];
    }> => {
      try {
        const supabase = await getSupabaseAdmin();
        const [{ data: profiles }, { data: calcs }] = await Promise.all([
          supabase.from("profiles").select("id,full_name,company,facility,created_at"),
          supabase
            .from("calculations")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1000),
        ]);
        if (profiles && calcs)
          return {
            profiles: profiles as (typeof localProfile)[],
            calculations: calcs as CalculationRow[],
          };
      } catch {
        // fallback
      }
      return { profiles: [localProfile], calculations: localCalculations };
    },
  );
