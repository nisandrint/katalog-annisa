import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSsrServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Normalisasi URL Supabase jika memiliki akhiran /rest/v1 atau garis miring di akhir.
 */
function normalisasiUrl(rawUrl) {
  return rawUrl?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "") || "";
}

/**
 * Membuat client Supabase untuk server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca katalog dan detail produk di sisi server (publik).
 */
export function buatClientServer() {
  const rawUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!rawUrl || !secretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diatur di environment variable."
    );
  }

  const url = normalisasiUrl(rawUrl);

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Membuat client Supabase untuk sesi admin menggunakan @supabase/ssr dan cookie.
 * Digunakan untuk login, keluar, ganti password, dan aksi admin yang terlindungi.
 */
export async function buatClientAdmin() {
  const cookieStore = await cookies();
  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diatur di environment variable."
    );
  }

  const url = normalisasiUrl(rawUrl);

  return createSsrServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Abaikan jika dipanggil dari Server Component
        }
      },
    },
  });
}

export {
  buatClientServer as createServerClient,
  buatClientServer as createClient,
  buatClientAdmin as createAdminClient,
  buatClientAdmin as buatClientSesiAdmin,
};
export default buatClientServer;
