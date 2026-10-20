"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientAdmin } from "@/lib/supabase/server";

/**
 * Server Action untuk login admin (US-04).
 * Memvalidasi kredensial via Supabase Auth dan menyimpan sesi di cookie.
 */
export async function masuk(prevStateOrFormData, maybeFormData) {
  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;
  const email = formData?.get("email")?.toString().trim();
  const password = formData?.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatClientAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let pesan = error.message;
    if (pesan === "Invalid login credentials" || error.status === 400) {
      pesan = "Email atau password salah.";
    }
    return { error: pesan };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

/**
 * Server Action untuk keluar / logout admin (US-04).
 * Mengakhiri sesi Supabase Auth dan menghapus cookie login.
 */
export async function keluar() {
  const supabase = await buatClientAdmin();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

/**
 * Server Action untuk ganti password admin (US-05).
 * Memeriksa sesi login admin, memvalidasi password baru minimal 8 karakter
 * dan kesamaan dengan konfirmasi, lalu memperbarui password di Supabase Auth.
 */
export async function gantiPassword(prevStateOrFormData, maybeFormData) {
  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;
  const passwordBaru = formData?.get("password_baru")?.toString() || "";
  const konfirmasiPassword = formData?.get("konfirmasi_password")?.toString() || "";

  // 1. Validasi sesi admin di server
  const supabase = await buatClientAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi admin tidak ditemukan. Silakan login kembali." };
  }

  // 2. Validasi panjang minimal password baru
  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  // 3. Validasi konfirmasi password
  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  // 4. Perbarui password di Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (updateError) {
    return { error: updateError.message || "Gagal mengganti password." };
  }

  return { success: true, pesan: "Password berhasil diganti." };
}
