import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const saveCalculation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("calculations")
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listMyCalculations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("calculations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteCalculation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("calculations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCalculation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("calculations")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getMyStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("calculations")
      .select("co2_kg,ch4_kg,n2o_kg,co2e_kg,scope,product_name,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    // TEMPORARY: Grant admin access to everyone for easy local testing and viewing
    return { isAdmin: true };
  });

// Admin: overview + user list
export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // TEMPORARY: Bypass the has_role RPC check so anyone can view the overview locally
    const [{ data: profiles }, { data: calcs }] = await Promise.all([
      context.supabase.from("profiles").select("id,full_name,company,facility,created_at"),
      context.supabase
        .from("calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);
    return { profiles: profiles ?? [], calculations: calcs ?? [] };
  });
