import { createClient } from "@supabase/supabase-js";

/**
 * Membuat client Supabase untuk server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca katalog dan detail produk di sisi server.
 */
export function buatClientServer() {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!rawUrl || !secretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diatur di environment variable."
    );
  }

  // Normalisasi URL jika memiliki akhiran /rest/v1 atau trailing slash
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { buatClientServer as createServerClient, buatClientServer as createClient };
export default buatClientServer;

