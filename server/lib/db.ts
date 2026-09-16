import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  var __supaClient: SupabaseClient | undefined;
}

function createSupaClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }
  return createClient(url, key);
}

export const supa: SupabaseClient = globalThis.__supaClient ?? createSupaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__supaClient = supa;
}

type EqTuple = [string, any];
type OrderOpt = { column: string; ascending?: boolean };

function buildFilterChain(table: string, method: string, options?: {
  select?: string;
  eq?: EqTuple[];
  in?: [string, any[]];
  order?: OrderOpt | OrderOpt[];
  limit?: number;
  data?: any;
  onConflict?: string;
}): Promise<{ data: any[]; count?: number; error: any }> {
  const sel = options?.select || "*";

  switch (method) {
    case "select": {
      let q: any = supa.from(table).select(sel, { count: "exact" });
      for (const [col, val] of options?.eq ?? []) q = q.eq(col, val);
      if (options?.in) q = q.in(options.in[0], options.in[1]);
      if (options?.order) {
        const orders = Array.isArray(options.order) ? options.order : [options.order];
        for (const o of orders) q = q.order(o.column, { ascending: o.ascending ?? true });
      }
      if (options?.limit) q = q.limit(options.limit);
      return q;
    }
    case "insert": {
      let q: any = supa.from(table).insert(options?.data || {}, { count: "exact" });
      for (const [col, val] of options?.eq ?? []) q = q.eq(col, val);
      if (options?.onConflict) q = q.onConflict(options.onConflict);
      return q.select(sel, { count: "exact" });
    }
    case "upsert": {
      let q: any = supa.from(table).upsert(options?.data || {}, {
        onConflict: options?.onConflict || "",
        count: "exact",
      });
      for (const [col, val] of options?.eq ?? []) q = q.eq(col, val);
      return q.select(sel, { count: "exact" });
    }
    case "update": {
      let q: any = supa.from(table).update(options?.data || "");
      for (const [col, val] of options?.eq ?? []) q = q.eq(col, val);
      return q.select(sel, { count: "exact" });
    }
    case "delete": {
      let q: any = supa.from(table).delete({ count: "exact" });
      for (const [col, val] of options?.eq ?? []) q = q.eq(col, val);
      if (options?.in) q = q.in(options.in[0], options.in[1]);
      if (options?.order) {
        const orders = Array.isArray(options.order) ? options.order : [options.order];
        for (const o of orders) q = q.order(o.column, { ascending: o.ascending ?? true });
      }
      if (options?.limit) q = q.limit(options.limit);
      return q;
    }
    default:
      return Promise.reject(new Error(`Unknown query method: ${method}`));
  }
}

export async function query<T = any>(
  table: string,
  method: "select" | "insert" | "upsert" | "update" | "delete",
  options?: {
    select?: string;
    eq?: EqTuple[];
    in?: [string, any[]];
    order?: OrderOpt | OrderOpt[];
    limit?: number;
    data?: any;
    onConflict?: string;
  }
): Promise<{ rows: T[]; rowCount: number; error: any }> {
  const result = await buildFilterChain(table, method, options);
  const error = result.error;

  if (error) {
    const err = new Error(error.message || "DB error") as any;
    err.code = error.code;
    err.details = error.details;
    err.hint = error.hint;
    throw err;
  }

  const count = typeof result.count === "number" ? result.count : 0;
  const rows = (result.data as T[]) || [];
  return { rows, rowCount: count, error: null };
}

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  database?: string;
  serverTime?: string;
  error?: string;
}> {
  try {
    const { error } = supa.from("settings").select("key").limit(1);
    if (error) throw error;
    return {
      success: true,
      database: new URL(supa.supabaseUrl).hostname,
      serverTime: new Date().toISOString(),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export const pool = { supa, query, testDatabaseConnection } as const;
export default pool;
