// ─── INSTALL DEPENDENCIES ─────────────────────────────────────────────────────
// npm install @supabase/supabase-js @emailjs/browser
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION
//  Two ways to set your keys — pick ONE:
//
//  OPTION A (Vite .env file — recommended for Vercel deploys)
//    Create a file called  .env  in your project root:
//      VITE_SUPABASE_URL=https://xxxx.supabase.co
//      VITE_SUPABASE_ANON=eyJh...
//    Then redeploy on Vercel and add the same vars in:
//      Vercel Dashboard → Your Project → Settings → Environment Variables
//
//  OPTION B (hardcode — quick local test only, never commit to git)
//    Replace the empty strings below directly.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient }  from "@supabase/supabase-js";
import emailjs           from "@emailjs/browser";

// ── Read from Vite env first; fall back to hardcoded strings ─────────────────
const SUPABASE_URL  =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL)
    || "https://YOUR_PROJECT.supabase.co";   // ← OPTION B: replace this

const SUPABASE_ANON =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON)
    || "YOUR_ANON_KEY";                       // ← OPTION B: replace this

const EMAILJS_PUBLIC_KEY  = "sMgdbh9Kiv0o3szux";
const EMAILJS_SERVICE_ID  = "service_fuq1yop";
const EMAILJS_DEVICE_TPL  = "template_device_login";
const EMAILJS_ENQUIRY_TPL = "template_u46iezf";

// ─── GUARD: catch placeholder/empty keys before any network call ──────────────
// "Failed to fetch" is almost always caused by the URL still being a placeholder.
if (
  !SUPABASE_URL ||
  SUPABASE_URL.includes("YOUR_PROJECT") ||
  !SUPABASE_ANON ||
  SUPABASE_ANON === "YOUR_ANON_KEY"
) {
  const msg =
    "⛔ Supabase keys are not set.\n\n" +
    "Either:\n" +
    "  1. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON\n" +
    "  2. Or replace the placeholder strings at the top of App.jsx\n\n" +
    "Then restart the dev server (npm run dev) or redeploy on Vercel.";
  // Show a visible alert so the error is obvious, not buried in the console
  // eslint-disable-next-line no-alert
  alert(msg);
  throw new Error(msg);
}

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  // Explicit fetch keeps things working even in strict browser environments
  global: { fetch: (...args) => fetch(...args) },
});

// ── Quick connectivity check printed to console on startup ───────────────────
supabase.from("templates").select("id", { count: "exact", head: true }).then(({ error }) => {
  if (error) {
    console.error("⛔ Supabase connectivity check FAILED:", error.message);
    console.error("   URL used:", SUPABASE_URL);
  } else {
    console.log("✅ Supabase connected successfully →", SUPABASE_URL);
  }
});

// ─── EMAILJS INIT ─────────────────────────────────────────────────────────────
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const _A   = { e: "priyasaki190@gmail.com", p: "priyasaki@9840" };
const WA   = "919840903746";
const MAIL = "priyasaki190@gmail.com";
const IG   = "https://instagram.com/priyasaki__19";

// ─── DEVICE INFO HELPER ───────────────────────────────────────────────────────
// We store a short fingerprint so we can detect a truly new device.
function getDeviceFingerprint() {
  // Take the first 120 chars of userAgent — enough to tell Chrome/Safari/Firefox
  // and Windows/Mac/Android/iOS apart without storing PII.
  return (navigator.userAgent || "unknown").substring(0, 120);
}

// ─── SESSION HELPERS (still uses sessionStorage — only for current tab) ───────
// We intentionally do NOT use localStorage for session so that the server
// (Supabase) is always the source of truth for templates and users.
const session = {
  get: () => { try { const v = sessionStorage.getItem("ck_sess"); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (s)  => { try { sessionStorage.setItem("ck_sess", JSON.stringify(s)); } catch {} },
  del: ()   => { try { sessionStorage.removeItem("ck_sess"); } catch {} },
};

// ─── EMAILJS: SEND ENQUIRY EMAIL (unchanged from original) ───────────────────
function sendEnquiryEmail(template, pushToast) {
  pushToast("📨 Sending enquiry email...");
  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_ENQUIRY_TPL, {
      to_email:       MAIL,
      template_title: template.title,
      template_price: `₹${template.price.toLocaleString()}`,
      from_name:      "Chitrakala Invitations",
    })
    .then(()  => pushToast("✅ Email sent! We'll contact you soon."))
    .catch((e) => { console.error("EmailJS enquiry error:", e); pushToast("❌ Email failed. Please try WhatsApp."); });
}

// ─── EMAILJS: SEND NEW-DEVICE ALERT ──────────────────────────────────────────
function sendDeviceAlertEmail(userEmail, deviceInfo) {
  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_DEVICE_TPL, {
      to_email:    userEmail,
      user_name:   userEmail.split("@")[0],
      device_info: deviceInfo,
      login_time:  new Date().toLocaleString("en-IN"),
      message:     "New login detected from another device",
    })
    .catch((e) => console.error("EmailJS device-alert error:", e));
}

// ─── SUPABASE: TEMPLATES ──────────────────────────────────────────────────────
// Fetch all templates (admin sees all; regular users only see active ones)
async function fetchTemplates(isAdmin = false) {
  let q = supabase.from("templates").select("*").order("created_at", { ascending: false });
  if (!isAdmin) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) { console.error("fetchTemplates:", error.message); return []; }
  return data;
}

// ─── SUPABASE STORAGE: upload a File object, return public URL ───────────────
// Bucket name must exactly match what you created in Supabase → Storage.
// The fix_policies.sql we ran earlier created "templates-media" — using that.
const STORAGE_BUCKET = "templates-media";

async function uploadMediaFile(file) {
  // ── Pre-flight checks ────────────────────────────────────────────────────
  if (!file || !(file instanceof File)) {
    throw new Error("uploadMediaFile: no valid File object received.");
  }
  console.log("[upload] ▶ starting", {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024).toFixed(1)} KB`,
    bucket: STORAGE_BUCKET,
    supabaseUrl: SUPABASE_URL,
  });

  // ── Build a unique storage path ──────────────────────────────────────────
  const ext      = file.name.split(".").pop().toLowerCase();
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  // ── Upload to Supabase Storage ───────────────────────────────────────────
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(safeName, file, {
      contentType: file.type || "application/octet-stream",
      upsert:      false,   // never silently overwrite
      cacheControl: "3600",
    });

  if (uploadError) {
    // Print the full error object — this is the key diagnostic for "Failed to fetch"
    console.error("[upload] ✖ storage.upload failed:", {
      message:  uploadError.message,
      error:    uploadError.error,
      status:   uploadError.statusCode,
      // If message is "Failed to fetch" the URL or anon key is wrong
      hint: uploadError.message === "Failed to fetch"
        ? "CHECK: Is SUPABASE_URL correct? Is the anon key valid? Is the bucket 'templates-media' created and public?"
        : "Check Supabase Dashboard → Storage → Logs for more detail.",
    });
    throw new Error("File upload failed: " + uploadError.message);
  }

  console.log("[upload] ✔ file stored at:", uploadData?.path);

  // ── Get the permanent public URL (no network call — purely local) ────────
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(safeName);

  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) {
    throw new Error(
      "getPublicUrl returned nothing. Make sure the bucket '" +
      STORAGE_BUCKET +
      "' exists and is set to Public in Supabase → Storage."
    );
  }

  console.log("[upload] ✔ public URL:", publicUrl);
  return publicUrl;
}

// Insert a new template  (tpl._file may be a raw File object from <input type="file">)
async function insertTemplate(tpl) {
  // If there is a raw File attached, upload it first and use the public URL
  let imageUrl = tpl.image;
  if (tpl._file instanceof File) {
    imageUrl = await uploadMediaFile(tpl._file);
  }

  console.log("[insertTemplate] inserting with imageUrl:", imageUrl?.substring(0, 80));

  const { data, error } = await supabase
    .from("templates")
    .insert([{ title: tpl.title, category: tpl.category, price: tpl.price, image: imageUrl, is_active: tpl.is_active }])
    .select()
    .single();

  if (error) {
    console.error("[insertTemplate] error:", error.message, error.details, error.hint);
    throw new Error(error.message);
  }
  console.log("[insertTemplate] done:", data.id);
  return data;
}

// Update an existing template  (tpl._file may be a raw File object)
async function updateTemplate(tpl) {
  // If a new file was picked, upload it; otherwise keep the existing URL
  let imageUrl = tpl.image;
  if (tpl._file instanceof File) {
    imageUrl = await uploadMediaFile(tpl._file);
  }

  console.log("[updateTemplate] id:", tpl.id, "imageUrl:", imageUrl?.substring(0, 80));

  const { data, error } = await supabase
    .from("templates")
    .update({
      title:     tpl.title,
      category:  tpl.category,
      price:     tpl.price,
      image:     imageUrl,
      is_active: tpl.is_active,
    })
    .eq("id", tpl.id)
    .select()
    .single();

  if (error) {
    console.error("[updateTemplate] error:", error.message, error.details, error.hint);
    throw new Error(error.message);
  }
  console.log("[updateTemplate] done:", data.id);
  return data;
}

// Delete a template by id
async function deleteTemplate(id) {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Toggle is_active
async function toggleTemplate(id, currentActive) {
  const { data, error } = await supabase
    .from("templates")
    .update({ is_active: !currentActive })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── SUPABASE: USERS ──────────────────────────────────────────────────────────
// Upsert user row and return {isNewDevice, previousDevice}
async function upsertUser(email, deviceInfo) {
  // 1. Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  const isNewDevice = existing && existing.device_info && existing.device_info !== deviceInfo;

  // 2. Upsert: update last_login and device_info
  await supabase.from("users").upsert(
    { email, last_login: new Date().toISOString(), device_info: deviceInfo },
    { onConflict: "email" }
  );

  return { isNewDevice, previousDevice: existing?.device_info ?? null };
}

// Fetch all users (for admin dashboard)
async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*").order("joined_at", { ascending: false });
  if (error) { console.error("fetchUsers:", error.message); return []; }
  return data;
}

// ─── STYLES (unchanged from original) ────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
:root{
  --pk:#e8186d;--pk2:#c4105a;--pk3:#f9c6dd;--pk4:#fef0f6;--pk5:#fff7fb;
  --gd:#c9952a;--gd2:#e8b84b;--gd3:#fdf3dc;
  --txt:#1a0a12;--txt2:#5c2d45;--txt3:#9a6878;
  --sh1:0 2px 16px rgba(232,24,109,0.10);
  --sh2:0 8px 40px rgba(232,24,109,0.16);
  --sh3:0 20px 60px rgba(232,24,109,0.22);
  --r:14px;--r2:10px;--r3:50px;
  --tr:all 0.28s cubic-bezier(0.4,0,0.2,1);
}
body{font-family:'DM Sans',sans-serif;background:var(--pk5);color:var(--txt);overflow-x:hidden}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-thumb{background:var(--pk3);border-radius:10px}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
.hdr{background:rgba(255,255,255,0.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(232,24,109,0.10);position:sticky;top:0;z-index:200;box-shadow:0 2px 18px rgba(232,24,109,0.06)}
.hdr-in{max-width:1280px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:68px}
.logo{display:flex;align-items:center;gap:11px;cursor:pointer;text-decoration:none}
.logo-mark{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--pk),var(--pk2));display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(232,24,109,0.35);animation:float 3s ease-in-out infinite}
.logo-text{font-family:'Cormorant Garamond',serif;font-size:1.45rem;font-weight:700;color:var(--txt)}
.logo-text span{color:var(--pk)}
.nav-right{display:flex;align-items:center;gap:10px}
.chip-user{background:linear-gradient(135deg,var(--pk4),var(--pk3));border:1px solid var(--pk3);color:var(--pk2);padding:6px 16px;border-radius:var(--r3);font-size:0.8rem;font-weight:600}
.btn-nav{font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:600;padding:8px 18px;border-radius:var(--r3);cursor:pointer;border:1.5px solid rgba(232,24,109,0.22);background:transparent;color:var(--txt2);transition:var(--tr)}
.btn-nav:hover{border-color:var(--pk);color:var(--pk);background:var(--pk4)}
.btn-nav.solid{background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;border-color:transparent;box-shadow:0 4px 16px rgba(232,24,109,0.3)}
.btn-nav.solid:hover{box-shadow:0 6px 24px rgba(232,24,109,0.45);transform:translateY(-1px)}
.btn-nav.gold{background:linear-gradient(135deg,var(--gd),var(--gd2));color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(201,149,42,0.3)}
.btn-nav.gold:hover{box-shadow:0 6px 22px rgba(201,149,42,0.45);transform:translateY(-1px)}
.hero{background:linear-gradient(160deg,#fff7fb 0%,#fce8f3 40%,#fdf3dc 100%);padding:5.5rem 2rem 4.5rem;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-60px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(232,24,109,0.07),transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-40px;left:-60px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(201,149,42,0.07),transparent 70%);pointer-events:none}
.hero-tag{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,var(--gd3),#fff);border:1px solid rgba(201,149,42,0.28);border-radius:var(--r3);padding:6px 18px;font-size:0.78rem;font-weight:600;color:var(--gd);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:1.5rem;animation:fadeUp 0.6s ease both}
.hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,5.5vw,4rem);font-weight:700;line-height:1.15;color:var(--txt);margin-bottom:1.2rem;animation:fadeUp 0.6s 0.1s ease both}
.hero-h1 em{color:var(--pk);font-style:italic}
.gold-word{background:linear-gradient(135deg,var(--gd),var(--gd2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-p{font-size:1.05rem;color:var(--txt3);max-width:520px;margin:0 auto 2.5rem;line-height:1.7;font-weight:300;animation:fadeUp 0.6s 0.2s ease both}
.hero-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;animation:fadeUp 0.6s 0.3s ease both;margin-bottom:3rem}
.btn-hero{padding:13px 32px;border-radius:var(--r3);font-size:0.95rem;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;border:none;transition:var(--tr)}
.btn-hero.primary{background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;box-shadow:0 6px 24px rgba(232,24,109,0.35)}
.btn-hero.primary:hover{box-shadow:0 10px 36px rgba(232,24,109,0.5);transform:translateY(-2px)}
.btn-hero.secondary{background:#fff;color:var(--pk);border:2px solid var(--pk3);box-shadow:var(--sh1);text-decoration:none;display:inline-flex;align-items:center}
.btn-hero.secondary:hover{border-color:var(--pk);background:var(--pk4);transform:translateY(-2px)}
.hero-stats{display:flex;justify-content:center;gap:2.5rem;flex-wrap:wrap;animation:fadeUp 0.6s 0.4s ease both}
.hstat{text-align:center}
.hstat-n{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:700;color:var(--pk);line-height:1}
.hstat-l{font-size:0.73rem;text-transform:uppercase;letter-spacing:1px;color:var(--txt3);margin-top:3px}
.sep{width:1px;background:linear-gradient(to bottom,transparent,var(--pk3),transparent);align-self:stretch}
.fbar{background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(232,24,109,0.07);position:sticky;top:68px;z-index:190;box-shadow:0 2px 12px rgba(232,24,109,0.03);padding:0.9rem 2rem}
.fbar-in{max-width:1280px;margin:0 auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.fchip{padding:7px 20px;border-radius:var(--r3);font-size:0.83rem;font-weight:500;border:1.5px solid rgba(232,24,109,0.16);background:transparent;color:var(--txt2);cursor:pointer;transition:var(--tr);font-family:'DM Sans',sans-serif;white-space:nowrap}
.fchip:hover{border-color:var(--pk);color:var(--pk);background:var(--pk4)}
.fchip.on{background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;border-color:transparent;box-shadow:0 3px 12px rgba(232,24,109,0.28)}
.fprice{display:flex;align-items:center;gap:10px;margin-left:auto}
.fprice label{font-size:0.8rem;color:var(--txt3);white-space:nowrap;font-weight:500}
.fprice input[type=range]{accent-color:var(--pk);width:110px;cursor:pointer}
.fpval{font-size:0.82rem;font-weight:700;color:var(--pk);min-width:60px}
.fcnt{font-size:0.78rem;color:var(--txt3);background:var(--pk4);padding:4px 12px;border-radius:var(--r3);font-weight:500;white-space:nowrap}
.main{max-width:1280px;margin:0 auto;padding:2.5rem 2rem 4rem}
.sec-hdr{display:flex;align-items:baseline;gap:12px;margin-bottom:2rem}
.sec-title{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:700;color:var(--txt)}
.sec-line{flex:1;height:1px;background:linear-gradient(to right,var(--pk3),transparent)}
.tgrid{display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center}
.tcard{flex:1 1 260px;max-width:320px;min-width:0}
.tcard{background:#fff;border-radius:var(--r);overflow:hidden;box-shadow:var(--sh1);border:1px solid rgba(232,24,109,0.07);transition:transform 0.32s cubic-bezier(0.4,0,0.2,1),box-shadow 0.32s cubic-bezier(0.4,0,0.2,1);animation:fadeUp 0.5s ease both;position:relative}
.tcard:hover{transform:translateY(-8px) scale(1.012);box-shadow:var(--sh3)}
.tcard-img-wrap{position:relative;height:210px;overflow:hidden;background:var(--pk4)}
.tcard-img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1)}
.tcard:hover .tcard-img{transform:scale(1.09)}
.tcard-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,10,18,0.55) 0%,transparent 55%);opacity:0;transition:opacity 0.3s}
.tcard:hover .tcard-ov{opacity:1}
.cat-badge{position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);color:var(--pk2);font-size:0.7rem;font-weight:700;padding:4px 12px;border-radius:var(--r3);text-transform:uppercase;letter-spacing:0.6px;border:1px solid rgba(232,24,109,0.12)}
.tcard-body{padding:1.2rem 1.3rem 1.3rem}
.tcard-title{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:var(--txt);margin-bottom:4px;line-height:1.3}
.tcard-price{font-size:1.35rem;font-weight:700;color:var(--pk);margin-bottom:1rem;display:flex;align-items:baseline;gap:5px}
.tcard-price sub{font-size:0.75rem;font-weight:400;color:var(--txt3)}
.tcard-btns{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}
.ctab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 4px;border-radius:var(--r2);font-size:0.68rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;border:none;text-decoration:none;transition:var(--tr);position:relative;overflow:hidden;letter-spacing:0.3px}
.ctab svg{width:15px;height:15px;flex-shrink:0}
.ctab:hover{transform:translateY(-2px);filter:brightness(1.07)}
.ctab:active{transform:scale(0.96)}
.cwa{background:linear-gradient(135deg,#25D366,#1aad54);color:#fff;box-shadow:0 3px 10px rgba(37,211,102,0.28)}
.cwa:hover{box-shadow:0 5px 18px rgba(37,211,102,0.42)}
.cml{background:linear-gradient(135deg,var(--pk),#f5458a);color:#fff;box-shadow:0 3px 10px rgba(232,24,109,0.28)}
.cml:hover{box-shadow:0 5px 18px rgba(232,24,109,0.42)}
.cig{background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;box-shadow:0 3px 10px rgba(220,39,67,0.28)}
.cig:hover{box-shadow:0 5px 18px rgba(220,39,67,0.42)}
.adm-ctrl{position:absolute;top:10px;right:10px;display:flex;gap:5px}
.acb{background:rgba(255,255,255,0.9);backdrop-filter:blur(4px);border:none;border-radius:8px;padding:5px 7px;cursor:pointer;font-size:13px;transition:var(--tr)}
.acb:hover{transform:scale(1.12)}
.overlay{position:fixed;inset:0;background:rgba(10,0,18,0.6);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px);animation:fadeIn 0.2s ease}
.modal{background:#fff;border-radius:20px;padding:2.2rem;width:100%;max-width:440px;box-shadow:0 30px 80px rgba(0,0,0,0.28);animation:fadeUp 0.3s ease;position:relative}
.modal.wide{max-width:580px}
.modal-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;background:var(--pk4);border:none;cursor:pointer;font-size:14px;color:var(--pk);display:flex;align-items:center;justify-content:center;transition:var(--tr)}
.modal-close:hover{background:var(--pk);color:#fff;transform:rotate(90deg)}
.m-icon{text-align:center;font-size:2.2rem;margin-bottom:0.8rem}
.m-title{font-family:'Cormorant Garamond',serif;font-size:1.7rem;font-weight:700;color:var(--txt);text-align:center;margin-bottom:0.3rem}
.m-sub{font-size:0.85rem;color:var(--txt3);text-align:center;margin-bottom:1.6rem;line-height:1.5}
.fg{margin-bottom:1rem}
.flabel{display:block;font-size:0.78rem;font-weight:700;color:var(--txt2);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px}
.fi{width:100%;padding:10px 14px;border:1.5px solid rgba(232,24,109,0.18);border-radius:var(--r2);font-family:'DM Sans',sans-serif;font-size:0.9rem;color:var(--txt);outline:none;transition:border-color 0.2s;background:#fff}
.fi:focus{border-color:var(--pk);box-shadow:0 0 0 3px rgba(232,24,109,0.07)}
.fsel{width:100%;padding:10px 14px;border:1.5px solid rgba(232,24,109,0.18);border-radius:var(--r2);font-family:'DM Sans',sans-serif;font-size:0.9rem;color:var(--txt);outline:none;background:#fff}
.sub-btn{width:100%;padding:13px;border:none;border-radius:var(--r2);background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;font-size:0.95rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:var(--tr);margin-top:8px;box-shadow:0 4px 16px rgba(232,24,109,0.28)}
.sub-btn:hover{box-shadow:0 8px 28px rgba(232,24,109,0.42);transform:translateY(-1px)}
.sub-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.errmsg{font-size:0.8rem;color:#c0392b;margin-top:5px}
.hr{border:none;border-top:1px solid var(--pk3);margin:1.2rem 0}
.slink{text-align:center;font-size:0.83rem;color:var(--txt3)}
.slink a{color:var(--pk);cursor:pointer;font-weight:700;text-decoration:none}
.adm{max-width:1200px;margin:0 auto;padding:2rem}
.adm-hdr{background:linear-gradient(135deg,#1a0a12,#3d0020);border-radius:var(--r);padding:1.8rem 2rem;display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;box-shadow:var(--sh2)}
.adm-hdr h2{font-family:'Cormorant Garamond',serif;font-size:1.7rem;font-weight:700;color:#fff;margin-bottom:3px}
.adm-hdr p{font-size:0.83rem;color:rgba(255,255,255,0.45)}
.adm-badge{background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;padding:4px 14px;border-radius:var(--r3);font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.adm-tabs{display:flex;gap:8px;background:rgba(255,255,255,0.07);padding:4px;border-radius:var(--r2);margin-bottom:1.5rem}
.adm-tab{flex:1;padding:9px 16px;border:none;background:transparent;color:rgba(255,255,255,0.5);font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:600;cursor:pointer;border-radius:8px;transition:var(--tr)}
.adm-tab.on{background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;box-shadow:0 3px 12px rgba(232,24,109,0.38)}
.stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:1.8rem}
.scard{background:#fff;border-radius:var(--r2);padding:1.2rem;text-align:center;border:1px solid rgba(232,24,109,0.09);box-shadow:var(--sh1)}
.scard .n{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--pk);line-height:1}
.scard .l{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.7px;color:var(--txt3);margin-top:4px}
.add-fab{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;border:none;border-radius:var(--r2);padding:10px 20px;font-size:0.85rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:var(--tr);box-shadow:0 4px 14px rgba(232,24,109,0.28)}
.add-fab:hover{box-shadow:0 8px 24px rgba(232,24,109,0.42);transform:translateY(-1px)}
.tbl-wrap{background:#fff;border-radius:var(--r);overflow:hidden;box-shadow:var(--sh1);border:1px solid rgba(232,24,109,0.07);overflow-x:auto}
.atbl{width:100%;border-collapse:collapse;font-size:0.85rem;min-width:580px}
.atbl thead tr{background:linear-gradient(135deg,#1a0a12,#3d0020)}
.atbl th{padding:12px 16px;color:rgba(255,255,255,0.65);font-weight:600;text-align:left;font-size:0.73rem;text-transform:uppercase;letter-spacing:0.7px}
.atbl td{padding:11px 16px;border-bottom:1px solid var(--pk4);color:var(--txt);vertical-align:middle}
.atbl tr:last-child td{border-bottom:none}
.atbl tr:hover td{background:#fff9fc}
.thumb{width:52px;height:38px;object-fit:cover;border-radius:8px;border:1px solid var(--pk3)}
.bcat{padding:3px 10px;border-radius:var(--r3);font-size:0.7rem;font-weight:700;text-transform:capitalize}
.bw{background:#fce4f3;color:var(--pk2)}
.bh{background:#e8f5e9;color:#2e7d32}
.bb{background:#fff3e0;color:#e65100}
.tog{background:none;border:none;cursor:pointer;font-size:1.2rem;transition:transform 0.15s}
.tog:hover{transform:scale(1.25)}
.icb{background:none;border:none;cursor:pointer;padding:5px 7px;border-radius:7px;font-size:0.95rem;transition:background 0.15s}
.icb:hover{background:var(--pk4)}
.icb.del:hover{background:#fdecea}
.act-cell{display:flex;gap:3px}
.user-row{display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--pk4)}
.user-row:last-child{border-bottom:none}
.uavatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--pk3),var(--pk4));display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:var(--pk2);flex-shrink:0}
.uemail{font-size:0.88rem;font-weight:500;color:var(--txt)}
.utime{font-size:0.75rem;color:var(--txt3);margin-top:1px}
.ucnt{font-size:0.75rem;background:var(--pk4);color:var(--pk2);padding:3px 10px;border-radius:var(--r3);font-weight:600}
.empty{text-align:center;padding:4rem 2rem}
.empty-icon{font-size:3.5rem;margin-bottom:1rem;animation:pulse 2.5s infinite}
.empty p{color:var(--txt3);font-size:0.95rem}
.toast-wrap{position:fixed;bottom:2rem;right:2rem;z-index:999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{background:linear-gradient(135deg,#1a0a12,#3d0020);color:#fff;padding:12px 20px;border-radius:var(--r2);font-size:0.85rem;box-shadow:0 8px 28px rgba(0,0,0,0.28);animation:slideDown 0.3s ease;border-left:3px solid var(--pk);max-width:300px;pointer-events:all}
.footer{background:linear-gradient(135deg,#1a0a12,#3d0020);padding:3rem 2rem;text-align:center;color:rgba(255,255,255,0.5);font-size:0.82rem;margin-top:2rem}
.footer-brand{font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--pk3);margin-bottom:0.5rem}
.footer-brand span{color:var(--gd2)}
.gold-div{width:60px;height:2px;background:linear-gradient(to right,transparent,var(--gd2),transparent);margin:0 auto 1.2rem}
.flinks{display:flex;justify-content:center;gap:2rem;margin:1.2rem 0;flex-wrap:wrap}
.flink{color:rgba(255,255,255,0.4);transition:color 0.2s;text-decoration:none;cursor:pointer;font-size:0.82rem}
.flink:hover{color:var(--pk3)}
.loading-overlay{display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:1rem}
.spinner{width:38px;height:38px;border:3px solid var(--pk3);border-top-color:var(--pk);border-radius:50%;animation:spin 0.7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:1200px){.tcard{flex:1 1 220px;max-width:280px}}
@media(max-width:768px){.tcard{flex:1 1 calc(50% - 0.75rem);max-width:calc(50% - 0.75rem)}}
@media(max-width:480px){.tcard{flex:1 1 100%;max-width:100%}}
@media(max-width:680px){
  .hdr-in{padding:0 1rem}
  .hero{padding:3.5rem 1rem 3rem}
  .hero-stats{gap:1.5rem}
  .sep{display:none}
  .fbar{padding:0.7rem 1rem}
  .main{padding:2rem 1rem 3rem}
  .adm{padding:1rem}
  .adm-hdr{padding:1.2rem}
  .adm-tabs{flex-direction:column}
}
`;

// ─── SVG ICONS (unchanged) ────────────────────────────────────────────────────
const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.849L.057 23.547a.5.5 0 0 0 .609.608l5.763-1.453A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.579-.49-5.075-1.343l-.363-.214-3.767.949.97-3.687-.233-.374A9.947 9.947 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

// ─── TOAST HOOK (unchanged) ───────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

// ─── TEMPLATE CARD (unchanged UI) ────────────────────────────────────────────
function TCard({ tpl, isAdmin, onEdit, onDelete, onToggle, delay, onEmailClick }) {
  const waMsg = encodeURIComponent(`Hi, I'm interested in this invitation template: ${tpl.title}`);
  const isVideo = tpl.image?.startsWith("data:video") ||
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(tpl.image ?? "");

  return (
    <div className="tcard" style={{ animationDelay: `${delay}ms`, opacity: !tpl.is_active && isAdmin ? 0.58 : 1 }}>
      <div className="tcard-img-wrap">
        {isVideo ? (
          <video src={tpl.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay muted loop playsInline />
        ) : (
          <img className="tcard-img" src={tpl.image} alt={tpl.title}
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=420&fit=crop"; }} />
        )}
        <div className="tcard-ov" />
        <span className="cat-badge">
          {tpl.category === "wedding" ? "💍 Wedding" : tpl.category === "housewarming" ? "🏡 Housewarming" : "🎂 Birthday"}
        </span>
        {isAdmin && (
          <div className="adm-ctrl">
            <button className="acb" onClick={() => onToggle(tpl.id, tpl.is_active)} title={tpl.is_active ? "Deactivate" : "Activate"}>
              {tpl.is_active ? "👁️" : "🙈"}
            </button>
            <button className="acb" onClick={() => onEdit(tpl)} title="Edit">✏️</button>
            <button className="acb" onClick={() => onDelete(tpl.id)} title="Delete">🗑️</button>
          </div>
        )}
      </div>
      <div className="tcard-body">
        <div className="tcard-title">{tpl.title}</div>
        <div className="tcard-price">₹{tpl.price.toLocaleString()} <sub>/ design</sub></div>
        <div className="tcard-btns">
          <a className="ctab cwa" href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noreferrer">
            <WaIcon />WhatsApp
          </a>
          <button className="ctab cml" onClick={() => onEmailClick(tpl)}>
            <MailIcon />Email
          </button>
          <a className="ctab cig" href={IG} target="_blank" rel="noreferrer">
            <IgIcon />Instagram
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN MODAL (unchanged UI, new Supabase logic) ───────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);

  const handleEmailChange = (val) => {
    setEmail(val);
    setErr("");
    setShowPass(val === _A.e);
  };

  const submit = async () => {
    setErr("");
    if (!email.trim()) return setErr("Please enter your email address.");

    const isAdminUser = email.trim() === _A.e;

    if (isAdminUser) {
      if (!pass) return setErr("Password required.");
      if (pass !== _A.p) return setErr("Incorrect password.");
      setLoading(true);
      // Admin: no device-change email needed
      const s = { email: _A.e, role: "admin", name: "Admin", at: Date.now() };
      session.set(s);
      onLogin(s);
      setLoading(false);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) return setErr("Please enter a valid email.");

      setLoading(true);
      try {
        const lower      = email.trim().toLowerCase();
        const deviceInfo = getDeviceFingerprint();

        // ── Upsert user row + check for new device ──────────────────────────
        const { isNewDevice } = await upsertUser(lower, deviceInfo);

        // ── If logging in from a different device, send an alert email ──────
        if (isNewDevice) {
          sendDeviceAlertEmail(lower, deviceInfo);
        }

        const s = { email: lower, role: "user", name: lower.split("@")[0], at: Date.now() };
        session.set(s);
        onLogin(s);
      } catch (e) {
        console.error("Login error:", e);
        setErr("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="m-icon">🌸</div>
        <div className="m-title">Welcome to Chitrakala</div>
        <div className="m-sub">Sign in to explore premium invitation designs</div>
        <div className="fg">
          <label className="flabel">Email Address</label>
          <input className="fi" type="email" placeholder="your@email.com" value={email} autoFocus
            onChange={(e) => handleEmailChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        {showPass && (
          <div className="fg">
            <label className="flabel">Password</label>
            <input className="fi" type="password" placeholder="••••••••" value={pass} autoFocus
              onChange={(e) => { setPass(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
        )}
        {err && <div className="errmsg">⚠️ {err}</div>}
        <button className="sub-btn" onClick={submit} disabled={loading}>
          {loading ? "Signing in..." : showPass ? "Login →" : "Continue →"}
        </button>
        <hr className="hr" />
        <div className="slink">By continuing you agree to our <a>Privacy Policy</a></div>
      </div>
    </div>
  );
}

// ─── TEMPLATE FORM ────────────────────────────────────────────────────────────
function TplForm({ tpl, onClose, onSave }) {
  const blank = { title: "", category: "wedding", price: "", image: "", is_active: true };

  const [f, setF]             = useState(tpl ? { ...tpl } : blank);
  const [err, setErr]         = useState("");
  const [success, setSuccess] = useState(false);
  // preview is an object URL (for new picks) or the existing https URL
  const [preview, setPreview] = useState(tpl?.image || "");
  // _file holds the raw File object when user picks a new file
  const [_file, setFile]      = useState(null);
  const [saving, setSaving]   = useState(false);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Store the raw File for upload; create a temporary object URL for preview
    setFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    // We no longer embed base64 into f.image — the upload helper will get the URL
    setErr("");
  };

  const save = async () => {
    setErr("");
    setSuccess(false);

    // ── Validation ──────────────────────────────────────────────────────────
    if (!f.title.trim())                   return setErr("Title is required.");
    if (!f.price || Number(f.price) <= 0)  return setErr("Enter a valid price.");
    // Must have either an existing URL or a freshly picked file
    if (!f.image && !_file)                return setErr("Please upload an image or video.");

    setSaving(true);
    console.log("[TplForm] save clicked — id:", tpl?.id, "newFile:", _file?.name ?? "none");

    try {
      // Pass both form fields AND the raw File (_file) so the upload helper can
      // upload it to Storage and get a public URL before hitting the DB.
      await onSave({
        ...f,
        price: Number(f.price),
        id:    tpl?.id,
        _file, // raw File | null
      });

      console.log("[TplForm] onSave resolved successfully");
      setSuccess(true);
      // Close after a short delay so user sees the ✅
      setTimeout(() => onClose(), 900);
    } catch (e) {
      console.error("[TplForm] save error:", e.message);
      setErr(e.message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Detect video by MIME type of the picked file, or by URL extension/content-type
  const isVideo = _file
    ? _file.type.startsWith("video/")
    : preview?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) != null;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="m-icon">{tpl ? "✏️" : "✨"}</div>
        <div className="m-title">{tpl ? "Edit Template" : "Add Template"}</div>
        <div className="m-sub">{tpl ? "Update the details below" : "Fill in the details for the new design"}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="fg" style={{ gridColumn: "1/-1" }}>
            <label className="flabel">Title *</label>
            <input className="fi" placeholder="e.g. Royal Lotus Wedding" value={f.title}
              onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="fg">
            <label className="flabel">Category *</label>
            <select className="fsel" value={f.category} onChange={(e) => set("category", e.target.value)}>
              <option value="wedding">Wedding</option>
              <option value="housewarming">Housewarming</option>
              <option value="birthday">Birthday</option>
            </select>
          </div>
          <div className="fg">
            <label className="flabel">Price (₹) *</label>
            <input className="fi" type="number" placeholder="999" value={f.price}
              onChange={(e) => set("price", e.target.value)} />
          </div>

          <div className="fg" style={{ gridColumn: "1/-1" }}>
            <label className="flabel">Image / Video *</label>
            <input className="fi" type="file" accept="image/*,video/*" onChange={handleFile}
              style={{ padding: "7px 10px", cursor: "pointer" }} />
            {/* Show filename of new pick, or note that existing media is kept */}
            {_file ? (
              <div style={{ fontSize: "0.75rem", color: "var(--pk2)", marginTop: 4 }}>
                ✅ New file selected: {_file.name}
              </div>
            ) : tpl?.image ? (
              <div style={{ fontSize: "0.75rem", color: "var(--txt3)", marginTop: 4 }}>
                No new file chosen — existing media will be kept.
              </div>
            ) : null}
          </div>

          {preview && (
            <div style={{ gridColumn: "1/-1", borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--pk3)", maxHeight: 180 }}>
              {isVideo ? (
                <video src={preview} controls style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
              ) : (
                <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
              )}
            </div>
          )}

          <div className="fg" style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="act" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)}
              style={{ accentColor: "var(--pk)", width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="act" style={{ fontSize: "0.88rem", color: "var(--txt2)", cursor: "pointer", fontWeight: 500 }}>
              Active — visible to all users
            </label>
          </div>
        </div>

        {err     && <div className="errmsg" style={{ marginTop: 8 }}>⚠️ {err}</div>}
        {success && <div style={{ fontSize: "0.85rem", color: "#27ae60", marginTop: 8, textAlign: "center" }}>✅ Saved successfully!</div>}

        <button className="sub-btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : tpl ? "Save Changes" : "Add Template"}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDash({ templates, onAdd, onEdit, onDelete, onToggle, onLogout }) {
  const [tab, setTab]         = useState("templates");
  const [showForm, setShowForm] = useState(false);
  const [editTpl, setEditTpl] = useState(null);
  const [users, setUsers]     = useState([]);

  // Fetch users list whenever the Users tab is opened
  useEffect(() => {
    if (tab === "users") {
      fetchUsers().then(setUsers);
    }
  }, [tab]);

  const total   = templates.length;
  const active  = templates.filter((t) => t.is_active).length;
  const bycat   = (c) => templates.filter((t) => t.category === c).length;

  const doSave = async (data) => {
    data.id ? await onEdit(data) : await onAdd(data);
    setShowForm(false);
    setEditTpl(null);
  };

  return (
    <div className="adm">
      <div className="adm-hdr">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2>Admin Dashboard</h2>
            <span className="adm-badge">Admin</span>
          </div>
          <p>Manage templates · View user registrations · Control visibility</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="add-fab" onClick={() => { setEditTpl(null); setShowForm(true); }}>＋ Add Template</button>
          <button className="btn-nav" style={{ color: "rgba(255,255,255,0.65)", borderColor: "rgba(255,255,255,0.2)" }} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="scard"><div className="n">{total}</div><div className="l">Total</div></div>
        <div className="scard"><div className="n" style={{ color: "#27ae60" }}>{active}</div><div className="l">Active</div></div>
        <div className="scard"><div className="n">{total - active}</div><div className="l">Hidden</div></div>
        <div className="scard"><div className="n">{bycat("wedding")}</div><div className="l">Wedding</div></div>
        <div className="scard"><div className="n">{bycat("housewarming")}</div><div className="l">Housewarming</div></div>
        <div className="scard"><div className="n">{bycat("birthday")}</div><div className="l">Birthday</div></div>
        <div className="scard"><div className="n">{users.length}</div><div className="l">Users</div></div>
      </div>

      <div className="adm-tabs">
        <button className={`adm-tab${tab === "templates" ? " on" : ""}`} onClick={() => setTab("templates")}>
          📦 Templates ({total})
        </button>
        <button className={`adm-tab${tab === "users" ? " on" : ""}`} onClick={() => setTab("users")}>
          👥 Users ({users.length})
        </button>
      </div>

      {tab === "templates" && (
        <div className="tbl-wrap">
          <table className="atbl">
            <thead>
              <tr><th>Preview</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {templates.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--txt3)" }}>No templates yet.</td></tr>
              )}
              {templates.map((t) => (
                <tr key={t.id}>
                  <td>
                    {(t.image?.startsWith("data:video") || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(t.image ?? "")) ? (
                      <video src={t.image} className="thumb" muted style={{ borderRadius: 8, border: "1px solid var(--pk3)" }} />
                    ) : (
                      <img className="thumb" src={t.image} alt={t.title}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=52&h=38&fit=crop"; }} />
                    )}
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 170 }}>{t.title}</td>
                  <td>
                    <span className={`bcat ${t.category === "wedding" ? "bw" : t.category === "housewarming" ? "bh" : "bb"}`}>
                      {t.category}
                    </span>
                  </td>
                  <td style={{ color: "var(--pk)", fontWeight: 700 }}>₹{t.price.toLocaleString()}</td>
                  <td>
                    <button className="tog" onClick={() => onToggle(t.id, t.is_active)}>
                      {t.is_active ? "✅" : "❌"}
                    </button>
                  </td>
                  <td>
                    <div className="act-cell">
                      <button className="icb" onClick={() => { setEditTpl(t); setShowForm(true); }}>✏️</button>
                      <button className="icb del" onClick={() => onDelete(t.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="tbl-wrap">
          <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--pk4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--txt2)" }}>Registered Users</span>
            <span className="ucnt">{users.length} total</span>
          </div>
          {users.length === 0 && (
            <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--txt3)" }}>No users signed in yet.</div>
          )}
          {users.map((u, i) => (
            <div key={i} className="user-row">
              <div className="uavatar">{u.email.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div className="uemail">{u.email}</div>
                {u.joined_at && (
                  <div className="utime">
                    Joined: {new Date(u.joined_at).toLocaleString("en-IN")}
                    {u.last_login && ` · Last login: ${new Date(u.last_login).toLocaleString("en-IN")}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TplForm
          tpl={editTpl}
          onClose={() => { setShowForm(false); setEditTpl(null); }}
          onSave={doSave}
        />
      )}
    </div>
  );
}

// ─── HOME PAGE (unchanged UI) ─────────────────────────────────────────────────
function HomePage({ templates, session: sess, isAdmin, onEdit, onDelete, onToggle, onLoginClick, toast }) {
  const [cat, setCat]         = useState("all");
  const [maxPrice, setMaxPrice] = useState(2500);
  const [editTpl, setEditTpl] = useState(null);
  const highPrice = Math.max(...templates.map((t) => t.price), 2500);

  const shown = templates
    .filter((t) => isAdmin || t.is_active)
    .filter((t) => cat === "all" || t.category === cat)
    .filter((t) => t.price <= maxPrice);

  const cats = [
    { k: "all", l: "✨ All" },
    { k: "wedding", l: "💍 Wedding" },
    { k: "housewarming", l: "🏡 Housewarming" },
    { k: "birthday", l: "🎂 Birthday" },
  ];

  const handleEmailClick = (tpl) => sendEnquiryEmail(tpl, toast);

  return (
    <>
      <section className="hero">
        <div className="hero-tag">✦ Premium Digital Invitations ✦</div>
        <h1 className="hero-h1">Beautiful <em>Invitations</em><br />for Every <span className="gold-word">Celebration</span></h1>
        <p className="hero-p">Handcrafted digital invitation designs for weddings, housewarmings &amp; birthdays — share the joy, beautifully.</p>
        <div className="hero-cta">
          {!sess ? (
            <button className="btn-hero primary" onClick={onLoginClick}>Browse Designs →</button>
          ) : (
            <button className="btn-hero primary" onClick={() => document.getElementById("tgrid")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Designs →
            </button>
          )}
          <a className="btn-hero secondary" href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer">WhatsApp Us</a>
        </div>
        <div className="hero-stats">
          <div className="hstat"><div className="hstat-n">{templates.filter((t) => t.is_active).length}+</div><div className="hstat-l">Designs</div></div>
          <div className="sep" />
          <div className="hstat"><div className="hstat-n">3</div><div className="hstat-l">Categories</div></div>
          <div className="sep" />
          <div className="hstat"><div className="hstat-n">100%</div><div className="hstat-l">Custom</div></div>
          <div className="sep" />
          <div className="hstat"><div className="hstat-n">Fast</div><div className="hstat-l">Delivery</div></div>
        </div>
      </section>

      {sess && (
        <div className="fbar">
          <div className="fbar-in">
            {cats.map((c) => (
              <button key={c.k} className={`fchip${cat === c.k ? " on" : ""}`} onClick={() => setCat(c.k)}>{c.l}</button>
            ))}
            <div className="fprice">
              <label>Max price:</label>
              <input type="range" min={200} max={highPrice} step={50} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
              <span className="fpval">₹{maxPrice.toLocaleString()}</span>
            </div>
            <span className="fcnt">{shown.length} designs</span>
          </div>
        </div>
      )}

      <main className="main">
        {!sess ? (
          <div className="empty">
            <div className="empty-icon">🌸</div>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--txt)", marginBottom: 10 }}>Sign in to browse premium designs</p>
            <p style={{ marginBottom: "1.8rem" }}>Create a free account — no OTP, instant access to all templates</p>
            <button className="btn-hero primary" onClick={onLoginClick}>Sign In — It's Free →</button>
          </div>
        ) : (
          <>
            <div className="sec-hdr">
              <h2 className="sec-title">
                {cat === "all" ? "All Designs" : cats.find((c) => c.k === cat)?.l.replace(/^.+ /, "") + " Designs"}
              </h2>
              <div className="sec-line" />
            </div>
            {shown.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🌷</div>
                <p>No designs match your filters. Try adjusting the price or category.</p>
              </div>
            ) : (
              <div className="tgrid" id="tgrid">
                {shown.map((tpl, i) => (
                  <TCard key={tpl.id} tpl={tpl} isAdmin={isAdmin} delay={i * 55}
                    onEdit={(t) => setEditTpl(t)} onDelete={onDelete} onToggle={onToggle}
                    onEmailClick={handleEmailClick} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {editTpl && (
        <TplForm
          tpl={editTpl}
          onClose={() => setEditTpl(null)}
          onSave={async (data) => { await onEdit(data); setEditTpl(null); toast("Template updated! ✅"); }}
        />
      )}
    </>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sess, setSess]           = useState(session.get);
  const [page, setPage]           = useState(() => session.get()?.role === "admin" ? "admin" : "home");
  const [showLogin, setShowLogin] = useState(false);
  const { toasts, push: toast }   = useToast();
  const channelRef                = useRef(null);

  const isAdmin = sess?.role === "admin";

  // ── 1. Initial fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchTemplates(isAdmin).then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, [isAdmin]);

  // ── 2. Real-time subscription ─────────────────────────────────────────────
  //  Listens for INSERT / UPDATE / DELETE events on the templates table.
  //  When the admin changes anything, ALL connected clients update instantly.
  useEffect(() => {
    // Clean up any previous subscription
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel("templates-realtime")           // any unique name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "templates" },
        (payload) => {
          // payload.eventType = "INSERT" | "UPDATE" | "DELETE"
          // payload.new = new row data, payload.old = old row data

          if (payload.eventType === "INSERT") {
            const newRow = payload.new;
            // Non-admin users should only see active templates
            if (!isAdmin && !newRow.is_active) return;
            setTemplates((prev) => [newRow, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            const updated = payload.new;
            setTemplates((prev) => {
              // If a template was deactivated and the viewer is not admin, remove it
              if (!isAdmin && !updated.is_active) {
                return prev.filter((t) => t.id !== updated.id);
              }
              // Otherwise replace the old row with the updated one
              const exists = prev.find((t) => t.id === updated.id);
              if (exists) return prev.map((t) => (t.id === updated.id ? updated : t));
              // It was previously hidden from this user but is now active — add it
              return [updated, ...prev];
            });
          }

          if (payload.eventType === "DELETE") {
            setTemplates((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // ── 3. CRUD handlers (write to Supabase; real-time listener handles UI) ───
  const addT = async (tpl) => {
    const newRow = await insertTemplate(tpl);   // throws on error
    // Real-time INSERT event will update templates state automatically
    toast("Template added! ✨");
    return newRow;
  };

  const editT = async (tpl) => {
    await updateTemplate(tpl);                  // throws on error
    // Real-time UPDATE event will update templates state automatically
    toast("Template updated! ✅");
  };

  const delT = async (id) => {
    if (!window.confirm("Delete this template permanently?")) return;
    await deleteTemplate(id);                   // throws on error
    // Real-time DELETE event will update templates state automatically
    toast("Template deleted.");
  };

  const togT = async (id, currentActive) => {
    await toggleTemplate(id, currentActive);    // throws on error
    // Real-time UPDATE event will update templates state automatically
    toast("Visibility updated! 👁️");
  };

  // ── 4. Auth handlers ──────────────────────────────────────────────────────
  const handleLogin = async (s) => {
    setSess(s);
    setShowLogin(false);
    if (s.role === "admin") {
      setPage("admin");
      toast("Welcome back, Admin! 🛡️");
      // Admin sees all templates — re-fetch including hidden ones
      const all = await fetchTemplates(true);
      setTemplates(all);
    } else {
      toast(`Welcome, ${s.name}! 🌸`);
    }
  };

  const handleLogout = () => {
    session.del();
    setSess(null);
    setPage("home");
    toast("Logged out. See you soon! 👋");
    // After logout, re-fetch only active templates
    fetchTemplates(false).then(setTemplates);
  };

  // ── 5. Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="hdr">
        <div className="hdr-in">
          <div className="logo" onClick={() => setPage("home")}>
            <div className="logo-mark">🌸</div>
            <span className="logo-text">Chitrakala <span>Invitations</span></span>
          </div>
          <nav className="nav-right">
            {sess ? (
              <>
                <span className="chip-user">{isAdmin ? "🛡️ Admin" : `👤 ${sess.name}`}</span>
                {isAdmin && (
                  <button className="btn-nav gold" onClick={() => setPage(page === "admin" ? "home" : "admin")}>
                    {page === "admin" ? "🏠 Home" : "🛠️ Dashboard"}
                  </button>
                )}
                <button className="btn-nav" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className="btn-nav solid" onClick={() => setShowLogin(true)}>Sign In</button>
            )}
          </nav>
        </div>
      </header>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <p style={{ color: "var(--txt3)", fontSize: "0.9rem" }}>Loading designs…</p>
        </div>
      ) : page === "admin" && isAdmin ? (
        <AdminDash templates={templates} onAdd={addT} onEdit={editT} onDelete={delT} onToggle={togT} onLogout={handleLogout} />
      ) : (
        <HomePage templates={templates} session={sess} isAdmin={isAdmin}
          onEdit={editT} onDelete={delT} onToggle={togT}
          onLoginClick={() => setShowLogin(true)} toast={toast} />
      )}

      <footer className="footer">
        <div className="footer-brand">Chitrakala <span>Invitations</span></div>
        <div className="gold-div" />
        <div>Premium digital invitations for every milestone</div>
        <div className="flinks">
          <a className="flink" href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a className="flink" href={`mailto:${MAIL}`}>Email Us</a>
          <a className="flink" href={IG} target="_blank" rel="noreferrer">Instagram</a>
        </div>
        <div style={{ opacity: 0.3, fontSize: "0.75rem" }}>© 2025 Chitrakala Invitations. All rights reserved.</div>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}

      <div className="toast-wrap">
        {toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>
    </>
  );
}
