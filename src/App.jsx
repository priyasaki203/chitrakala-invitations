// ─── INSTALL DEPENDENCIES ─────────────────────────────────────────────────────
// npm install @supabase/supabase-js @emailjs/browser
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = "https://myenjbljtvlwptlxzlhh.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZW5qYmxqdHZsd3B0bHh6bGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTk1NzAsImV4cCI6MjA5MjA5NTU3MH0.zLEW6w3nZSViXMAvyuxR72HrhCIIuAkmBvTtV27Jv5Q";

const EMAILJS_PUBLIC_KEY  = "sMgdbh9Kiv0o3szux";
const EMAILJS_SERVICE_ID  = "service_fuq1yop";
const EMAILJS_DEVICE_TPL  = "template_device_login";
const EMAILJS_ENQUIRY_TPL = "template_u46iezf";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import emailjs from "@emailjs/browser";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const _A   = { e: "priyasaki190@gmail.com", p: "priyasaki@9840" };
const WA   = "919840903746";
const MAIL = "priyasaki190@gmail.com";
const IG   = "https://instagram.com/priyasaki__19";

// ─── HELPER: detect if URL is a video ────────────────────────────────────────
function isVideoUrl(url) {
  if (!url) return false;
  if (url.startsWith("data:video")) return true;
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

function getDeviceFingerprint() {
  return (navigator.userAgent || "unknown").substring(0, 120);
}

const session = {
  get: () => { try { const v = sessionStorage.getItem("ck_sess"); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (s)  => { try { sessionStorage.setItem("ck_sess", JSON.stringify(s)); } catch {} },
  del: ()   => { try { sessionStorage.removeItem("ck_sess"); } catch {} },
};

function sendEnquiryEmail(template, pushToast) {
  pushToast("📨 Sending enquiry email...");
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ENQUIRY_TPL, {
    to_email: MAIL, template_title: template.title,
    template_price: `₹${template.price.toLocaleString()}`, from_name: "Chitrakala Invitations",
  }).then(() => pushToast("✅ Email sent! We'll contact you soon."))
    .catch(() => pushToast("❌ Email failed. Please try WhatsApp."));
}

function sendDeviceAlertEmail(userEmail, deviceInfo) {
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_DEVICE_TPL, {
    to_email: userEmail, user_name: userEmail.split("@")[0],
    device_info: deviceInfo, login_time: new Date().toLocaleString("en-IN"),
    message: "New login detected from another device",
  }).catch((e) => console.error("EmailJS device-alert error:", e));
}

async function fetchTemplates(isAdmin = false) {
  let q = supabase.from("templates").select("*").order("created_at", { ascending: false });
  if (!isAdmin) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) { console.error("fetchTemplates:", error.message); return []; }
  return data;
}

const STORAGE_BUCKET = "templates-media";

async function uploadMediaFile(file) {
  const ext      = file.name.split(".").pop();
  const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET).upload(filePath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error("File upload failed: " + uploadError.message);
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  if (!urlData?.publicUrl) throw new Error("Could not get public URL.");
  return urlData.publicUrl;
}

async function insertTemplate(tpl) {
  let imageUrl = tpl.image;
  if (tpl._file instanceof File) imageUrl = await uploadMediaFile(tpl._file);
  const { data, error } = await supabase.from("templates")
    .insert([{ title: tpl.title, category: tpl.category, price: tpl.price, image: imageUrl, is_active: tpl.is_active }])
    .select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateTemplate(tpl) {
  let imageUrl = tpl.image;
  if (tpl._file instanceof File) imageUrl = await uploadMediaFile(tpl._file);
  const { data, error } = await supabase.from("templates")
    .update({ title: tpl.title, category: tpl.category, price: tpl.price, image: imageUrl, is_active: tpl.is_active })
    .eq("id", tpl.id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function deleteTemplate(id) {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function toggleTemplate(id, currentActive) {
  const { data, error } = await supabase.from("templates")
    .update({ is_active: !currentActive }).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function upsertUser(email, deviceInfo) {
  const { data: existing } = await supabase.from("users").select("*").eq("email", email).single();
  const isNewDevice = existing && existing.device_info && existing.device_info !== deviceInfo;
  await supabase.from("users").upsert(
    { email, last_login: new Date().toISOString(), device_info: deviceInfo },
    { onConflict: "email" }
  );
  return { isNewDevice, previousDevice: existing?.device_info ?? null };
}

async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*").order("joined_at", { ascending: false });
  if (error) { console.error("fetchUsers:", error.message); return []; }
  return data;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
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
@keyframes spin{to{transform:rotate(360deg)}}

.hdr{background:rgba(255,255,255,0.88);backdrop-filter:blur(18px);border-bottom:1px solid rgba(232,24,109,0.10);position:sticky;top:0;z-index:200;box-shadow:0 2px 18px rgba(232,24,109,0.06)}
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

/* ── CARD ── */
.tcard{flex:1 1 260px;max-width:320px;min-width:0;background:#fff;border-radius:var(--r);overflow:hidden;box-shadow:var(--sh1);border:1px solid rgba(232,24,109,0.07);transition:transform 0.32s cubic-bezier(0.4,0,0.2,1),box-shadow 0.32s cubic-bezier(0.4,0,0.2,1);animation:fadeUp 0.5s ease both;position:relative}
.tcard:hover{transform:translateY(-8px) scale(1.012);box-shadow:var(--sh3)}
.tcard-img-wrap{position:relative;height:210px;overflow:hidden;background:var(--pk4)}
.tcard-img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1)}
.tcard:hover .tcard-img{transform:scale(1.09)}

.tcard-vid-thumb{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1)}
.tcard:hover .tcard-vid-thumb{transform:scale(1.09)}

.tcard-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,10,18,0.55) 0%,transparent 55%);opacity:0;transition:opacity 0.3s;pointer-events:none}
.tcard:hover .tcard-ov{opacity:1}

.play-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.play-btn{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 22px rgba(0,0,0,0.28);transition:transform 0.22s,box-shadow 0.22s,background 0.22s}
.tcard-img-wrap:hover .play-btn{transform:scale(1.15);box-shadow:0 6px 30px rgba(232,24,109,0.5);background:#fff}
.play-arrow{width:0;height:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:20px solid var(--pk);margin-left:4px}

.vid-badge{position:absolute;bottom:10px;left:12px;background:rgba(0,0,0,0.62);color:#fff;font-size:0.64rem;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:0.6px;backdrop-filter:blur(4px)}

.cat-badge{position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);color:var(--pk2);font-size:0.7rem;font-weight:700;padding:4px 12px;border-radius:var(--r3);text-transform:uppercase;letter-spacing:0.6px;border:1px solid rgba(232,24,109,0.12)}
.tcard-body{padding:1.2rem 1.3rem 1.3rem}
.tcard-title{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:var(--txt);margin-bottom:4px;line-height:1.3}
.tcard-price{font-size:1.35rem;font-weight:700;color:var(--pk);margin-bottom:1rem;display:flex;align-items:baseline;gap:5px}
.tcard-price sub{font-size:0.75rem;font-weight:400;color:var(--txt3)}
.tcard-btns{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}
.ctab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 4px;border-radius:var(--r2);font-size:0.68rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;border:none;text-decoration:none;transition:var(--tr);letter-spacing:0.3px}
.ctab svg{width:15px;height:15px;flex-shrink:0}
.ctab:hover{transform:translateY(-2px);filter:brightness(1.07)}
.ctab:active{transform:scale(0.96)}
.cwa{background:linear-gradient(135deg,#25D366,#1aad54);color:#fff;box-shadow:0 3px 10px rgba(37,211,102,0.28)}
.cml{background:linear-gradient(135deg,var(--pk),#f5458a);color:#fff;box-shadow:0 3px 10px rgba(232,24,109,0.28)}
.cig{background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;box-shadow:0 3px 10px rgba(220,39,67,0.28)}

.adm-ctrl{position:absolute;top:10px;right:10px;display:flex;gap:5px;z-index:5}
.acb{background:rgba(255,255,255,0.9);backdrop-filter:blur(4px);border:none;border-radius:8px;padding:5px 7px;cursor:pointer;font-size:13px;transition:var(--tr)}
.acb:hover{transform:scale(1.12)}

/* ═══════════════════════════════════════════════════
   VIDEO CHOICE DIALOG
   ═══════════════════════════════════════════════════ */
.vcd-overlay{
  position:fixed;inset:0;
  background:rgba(10,0,20,0.72);
  backdrop-filter:blur(10px);
  z-index:800;
  display:flex;align-items:center;justify-content:center;
  padding:1rem;
  animation:fadeIn 0.18s ease;
}
.vcd-box{
  background:#fff;
  border-radius:22px;
  padding:2rem 2.2rem 2rem;
  width:100%;max-width:360px;
  box-shadow:0 30px 80px rgba(232,24,109,0.22),0 4px 24px rgba(0,0,0,0.18);
  animation:fadeUp 0.22s ease;
  text-align:center;
  position:relative;
}
.vcd-close{
  position:absolute;top:14px;right:14px;
  width:30px;height:30px;border-radius:50%;
  background:var(--pk4);border:none;cursor:pointer;
  color:var(--pk);font-size:13px;
  display:flex;align-items:center;justify-content:center;
  transition:var(--tr);
}
.vcd-close:hover{background:var(--pk);color:#fff;transform:rotate(90deg)}
.vcd-thumb-wrap{
  width:100%;height:160px;
  border-radius:14px;overflow:hidden;
  background:var(--pk5);
  margin-bottom:1.4rem;
  position:relative;
  border:1.5px solid var(--pk3);
}
.vcd-thumb{width:100%;height:100%;object-fit:cover;display:block}
.vcd-play-pill{
  position:absolute;bottom:10px;left:50%;transform:translateX(-50%);
  background:rgba(232,24,109,0.92);
  color:#fff;
  font-size:0.72rem;font-weight:700;letter-spacing:0.6px;
  padding:4px 14px;border-radius:20px;
  display:flex;align-items:center;gap:5px;
  backdrop-filter:blur(4px);
  white-space:nowrap;
}
.vcd-title{
  font-family:'Cormorant Garamond',serif;
  font-size:1.25rem;font-weight:700;color:var(--txt);
  margin-bottom:4px;
}
.vcd-subtitle{font-size:0.8rem;color:var(--txt3);margin-bottom:1.5rem;line-height:1.5}
.vcd-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.vcd-btn{
  padding:12px 10px;
  border-radius:12px;
  border:none;cursor:pointer;
  font-family:'DM Sans',sans-serif;
  font-size:0.88rem;font-weight:700;
  transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
  display:flex;flex-direction:column;
  align-items:center;gap:5px;
}
.vcd-btn-icon{font-size:1.4rem}
.vcd-btn.preview{
  background:var(--pk4);
  border:1.5px solid var(--pk3);
  color:var(--pk2);
}
.vcd-btn.preview:hover{
  background:var(--pk);border-color:var(--pk);color:#fff;
  transform:translateY(-2px);
  box-shadow:0 6px 20px rgba(232,24,109,0.32);
}
.vcd-btn.fullscreen{
  background:linear-gradient(135deg,var(--pk),var(--pk2));
  color:#fff;
  box-shadow:0 4px 16px rgba(232,24,109,0.3);
}
.vcd-btn.fullscreen:hover{
  box-shadow:0 8px 28px rgba(232,24,109,0.48);
  transform:translateY(-2px);
}

/* ═══════════════════════════════════════════════════
   VIDEO PREVIEW MODAL
   ═══════════════════════════════════════════════════ */
.vpm-overlay{
  position:fixed;inset:0;
  background:rgba(0,0,0,0.92);
  z-index:900;
  display:flex;align-items:center;justify-content:center;
  padding:1rem;
  animation:fadeIn 0.2s ease;
  backdrop-filter:blur(12px);
}
.vpm-box{
  position:relative;
  width:100%;max-width:880px;
  background:#111;
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.06);
  animation:fadeUp 0.25s ease;
}
.vpm-close{
  position:absolute;top:12px;right:12px;z-index:10;
  width:38px;height:38px;border-radius:50%;
  background:rgba(255,255,255,0.14);
  border:none;color:#fff;font-size:15px;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  backdrop-filter:blur(6px);
  transition:background 0.2s,transform 0.2s;
}
.vpm-close:hover{background:var(--pk);transform:rotate(90deg)}
.vpm-fs-btn{
  position:absolute;top:12px;right:58px;z-index:10;
  width:38px;height:38px;border-radius:50%;
  background:rgba(255,255,255,0.14);
  border:none;color:#fff;font-size:15px;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  backdrop-filter:blur(6px);
  transition:background 0.2s;
}
.vpm-fs-btn:hover{background:rgba(255,255,255,0.28)}
.vpm-video{
  width:100%;max-height:82vh;display:block;outline:none;
  transition:opacity 0.3s ease;
}
.vpm-video.loading{opacity:0}
.vpm-video.ready{opacity:1}
.vpm-loading{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:12px;
  background:#111;
  transition:opacity 0.3s ease;
  pointer-events:none;
}
.vpm-loading.hidden{opacity:0}
.vpm-spinner{
  width:42px;height:42px;
  border:3px solid rgba(255,255,255,0.12);
  border-top-color:var(--pk);
  border-radius:50%;
  animation:spin 0.75s linear infinite;
}
.vpm-load-text{
  font-size:0.82rem;color:rgba(255,255,255,0.45);
  font-family:'DM Sans',sans-serif;letter-spacing:0.5px;
}
.vpm-title{
  position:absolute;bottom:0;left:0;right:0;
  padding:18px 20px 16px;
  background:linear-gradient(to top,rgba(0,0,0,0.82),transparent);
  color:#fff;
  font-family:'Cormorant Garamond',serif;
  font-size:1.15rem;font-weight:600;
  pointer-events:none;
  display:flex;align-items:center;gap:8px;
}

/* ── GENERAL MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(10,0,18,0.6);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px);animation:fadeIn 0.2s ease}
.modal{background:#fff;border-radius:20px;padding:2.2rem;width:100%;max-width:440px;box-shadow:0 30px 80px rgba(0,0,0,0.28);animation:fadeUp 0.3s ease;position:relative;max-height:90vh;overflow-y:auto}
.modal.wide{max-width:580px}
.modal-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;background:var(--pk4);border:none;cursor:pointer;font-size:14px;color:var(--pk);display:flex;align-items:center;justify-content:center;transition:var(--tr);z-index:10}
.modal-close:hover{background:var(--pk);color:#fff;transform:rotate(90deg)}
.m-icon{text-align:center;font-size:2.2rem;margin-bottom:0.8rem}
.m-title{font-family:'Cormorant Garamond',serif;font-size:1.7rem;font-weight:700;color:var(--txt);text-align:center;margin-bottom:0.3rem}
.m-sub{font-size:0.85rem;color:var(--txt3);text-align:center;margin-bottom:1.6rem;line-height:1.5}
.fg{margin-bottom:1rem}
.flabel{display:block;font-size:0.78rem;font-weight:700;color:var(--txt2);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px}
.fi{width:100%;padding:10px 14px;border:1.5px solid rgba(232,24,109,0.18);border-radius:var(--r2);font-family:'DM Sans',sans-serif;font-size:0.9rem;color:var(--txt);outline:none;transition:border-color 0.2s;background:#fff}
.fi:focus{border-color:var(--pk);box-shadow:0 0 0 3px rgba(232,24,109,0.07)}
.fsel{width:100%;padding:10px 14px;border:1.5px solid rgba(232,24,109,0.18);border-radius:var(--r2);font-family:'DM Sans',sans-serif;font-size:0.9rem;color:var(--txt);outline:none;background:#fff;cursor:pointer}
.sub-btn{width:100%;padding:13px;border:none;border-radius:var(--r2);background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;font-size:0.95rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:var(--tr);margin-top:8px;box-shadow:0 4px 16px rgba(232,24,109,0.28)}
.sub-btn:hover:not(:disabled){box-shadow:0 8px 28px rgba(232,24,109,0.42);transform:translateY(-1px)}
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
.adm-tabs{display:flex;gap:8px;background:rgba(26,10,18,0.07);padding:4px;border-radius:var(--r2);margin-bottom:1.5rem}
.adm-tab{flex:1;padding:9px 16px;border:none;background:transparent;color:var(--txt2);font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:600;cursor:pointer;border-radius:8px;transition:var(--tr)}
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
.bw{background:#fce4f3;color:var(--pk2)}.bh{background:#e8f5e9;color:#2e7d32}.bb{background:#fff3e0;color:#e65100}
.tog{background:none;border:none;cursor:pointer;font-size:1.2rem;transition:transform 0.15s}
.tog:hover{transform:scale(1.25)}
.icb{background:none;border:none;cursor:pointer;padding:5px 7px;border-radius:7px;font-size:0.95rem;transition:background 0.15s}
.icb:hover{background:var(--pk4)}.icb.del:hover{background:#fdecea}
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
.toast-wrap{position:fixed;bottom:2rem;right:2rem;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{background:linear-gradient(135deg,#1a0a12,#3d0020);color:#fff;padding:12px 20px;border-radius:var(--r2);font-size:0.85rem;box-shadow:0 8px 28px rgba(0,0,0,0.28);animation:slideDown 0.3s ease;border-left:3px solid var(--pk);max-width:300px}
.footer{background:linear-gradient(135deg,#1a0a12,#3d0020);padding:3rem 2rem;text-align:center;color:rgba(255,255,255,0.5);font-size:0.82rem;margin-top:2rem}
.footer-brand{font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--pk3);margin-bottom:0.5rem}
.footer-brand span{color:var(--gd2)}
.gold-div{width:60px;height:2px;background:linear-gradient(to right,transparent,var(--gd2),transparent);margin:0 auto 1.2rem}
.flinks{display:flex;justify-content:center;gap:2rem;margin:1.2rem 0;flex-wrap:wrap}
.flink{color:rgba(255,255,255,0.4);transition:color 0.2s;text-decoration:none;cursor:pointer;font-size:0.82rem}
.flink:hover{color:var(--pk3)}
.loading-overlay{display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:1rem}
.spinner{width:38px;height:38px;border:3px solid var(--pk3);border-top-color:var(--pk);border-radius:50%;animation:spin 0.7s linear infinite}

@media(max-width:1200px){.tcard{flex:1 1 220px;max-width:280px}}
@media(max-width:768px){.tcard{flex:1 1 calc(50% - 0.75rem);max-width:calc(50% - 0.75rem)}}
@media(max-width:480px){.tcard{flex:1 1 100%;max-width:100%}}
@media(max-width:680px){
  .hdr-in{padding:0 1rem}.hero{padding:3.5rem 1rem 3rem}
  .hero-stats{gap:1.5rem}.sep{display:none}
  .fbar{padding:0.7rem 1rem}.main{padding:2rem 1rem 3rem}
  .adm{padding:1rem}.adm-hdr{padding:1.2rem}.adm-tabs{flex-direction:column}
  .vpm-box{border-radius:10px}.vcd-box{border-radius:14px}
}
`;

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
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

// ─── TOAST HOOK ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VIDEO CHOICE DIALOG
//  Shows when user clicks a video card thumbnail.
//  Two options: "Preview" (centered modal) or "Full Preview" (fullscreen).
// ═══════════════════════════════════════════════════════════════════════════════
function VideoChoiceDialog({ url, title, onClose, onPreview, onFullPreview }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="vcd-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="vcd-box">
        <button className="vcd-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Live video thumbnail */}
        <div className="vcd-thumb-wrap">
          <video
            className="vcd-thumb"
            src={url}
            muted
            preload="metadata"
            playsInline
            onLoadedMetadata={(e) => { e.target.currentTime = 0.1; }}
          />
          <div className="vcd-play-pill">▶ VIDEO</div>
        </div>

        <div className="vcd-title">{title}</div>
        <div className="vcd-subtitle">How would you like to watch this?</div>

        <div className="vcd-btns">
          {/* Opens inline centered modal */}
          <button className="vcd-btn preview" onClick={onPreview}>
            <span className="vcd-btn-icon">🎬</span>
            Preview
          </button>
          {/* Opens native fullscreen / new tab fallback */}
          <button className="vcd-btn fullscreen" onClick={onFullPreview}>
            <span className="vcd-btn-icon">⛶</span>
            Full Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VIDEO PREVIEW MODAL
//  Centered dark modal with autoplay + loading spinner.
//  Includes an in-modal fullscreen button (⛶) as a shortcut.
// ═══════════════════════════════════════════════════════════════════════════════
function VideoPreviewModal({ url, title, onClose }) {
  const videoRef       = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Autoplay once buffered enough
  const handleCanPlay = () => {
    setReady(true);
    videoRef.current?.play().catch(() => {
      // Browser blocked autoplay — user can press play manually
    });
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    onClose();
  };

  // Fullscreen shortcut button inside modal
  const handleFullscreen = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if      (vid.requestFullscreen)          vid.requestFullscreen();
    else if (vid.webkitRequestFullscreen)    vid.webkitRequestFullscreen();
    else if (vid.mozRequestFullScreen)       vid.mozRequestFullScreen();
  };

  return (
    <div
      className="vpm-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="vpm-box">
        <button className="vpm-close" onClick={handleClose} aria-label="Close">✕</button>
        <button className="vpm-fs-btn" onClick={handleFullscreen} title="Fullscreen" aria-label="Fullscreen">⛶</button>

        {/* Loading spinner — fades out once video is ready */}
        <div className={`vpm-loading${ready ? " hidden" : ""}`}>
          <div className="vpm-spinner" />
          <div className="vpm-load-text">Loading video…</div>
        </div>

        {/* The actual video player */}
        <video
          ref={videoRef}
          className={`vpm-video${ready ? " ready" : " loading"}`}
          src={url}
          controls
          playsInline
          preload="auto"
          onCanPlay={handleCanPlay}
        />

        {title && (
          <div className="vpm-title">
            <span>▶</span>{title}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE CARD
//  Images → nothing on click (unchanged behavior)
//  Videos → click thumbnail → VideoChoiceDialog
//            "Preview"      → VideoPreviewModal
//            "Full Preview" → native fullscreen (new tab fallback for iOS)
// ═══════════════════════════════════════════════════════════════════════════════
function TCard({ tpl, isAdmin, onEdit, onDelete, onToggle, delay, onEmailClick }) {
  // null | "choice" | "preview"
  const [videoMode, setVideoMode] = useState(null);

  const waMsg = encodeURIComponent(`Hi, I'm interested in this invitation template: ${tpl.title}`);
  const isVid = isVideoUrl(tpl.image);

  // ── Full Preview: native fullscreen via a temporary <video> element ────────
  const handleFullPreview = () => {
    setVideoMode(null); // close dialog first

    const vid         = document.createElement("video");
    vid.src           = tpl.image;
    vid.controls      = true;
    vid.autoplay      = true;
    vid.playsInline   = true;
    vid.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;background:#000;z-index:9999;outline:none;";

    document.body.appendChild(vid);

    const cleanup = () => {
      vid.pause();
      if (document.body.contains(vid)) document.body.removeChild(vid);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };

    const onFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fsEl) cleanup(); // user exited fullscreen → remove element
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    const req =
      vid.requestFullscreen      ||
      vid.webkitRequestFullscreen ||
      vid.mozRequestFullScreen;

    if (req) {
      req.call(vid).catch(() => {
        // Fullscreen blocked (e.g. iOS Safari) → fallback to new tab
        cleanup();
        window.open(tpl.image, "_blank", "noopener,noreferrer");
      });
    } else {
      // No fullscreen API → new tab
      cleanup();
      window.open(tpl.image, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div
        className="tcard"
        style={{
          animationDelay: `${delay}ms`,
          opacity: !tpl.is_active && isAdmin ? 0.58 : 1,
        }}
      >
        {/* ── Media thumbnail area ─────────────────────────────────────── */}
        <div
          className="tcard-img-wrap"
          onClick={() => isVid && setVideoMode("choice")}
          style={{ cursor: isVid ? "pointer" : "default" }}
        >
          {isVid ? (
            <>
              {/* Muted thumbnail — seeks to 0.1s so first frame renders */}
              <video
                className="tcard-vid-thumb"
                src={tpl.image}
                muted
                preload="metadata"
                playsInline
                onLoadedMetadata={(e) => { e.target.currentTime = 0.1; }}
              />
              <div className="tcard-ov" />
              <div className="play-overlay">
                <div className="play-btn">
                  <div className="play-arrow" />
                </div>
              </div>
              <span className="vid-badge">▶ VIDEO</span>
            </>
          ) : (
            <>
              <img
                className="tcard-img"
                src={tpl.image}
                alt={tpl.title}
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=420&fit=crop";
                }}
              />
              <div className="tcard-ov" />
            </>
          )}

          <span className="cat-badge">
            {tpl.category === "wedding"
              ? "💍 Wedding"
              : tpl.category === "housewarming"
              ? "🏡 Housewarming"
              : "🎂 Birthday"}
          </span>

          {isAdmin && (
            <div className="adm-ctrl">
              <button className="acb" title={tpl.is_active ? "Deactivate" : "Activate"}
                onClick={(e) => { e.stopPropagation(); onToggle(tpl.id, tpl.is_active); }}>
                {tpl.is_active ? "👁️" : "🙈"}
              </button>
              <button className="acb" title="Edit"
                onClick={(e) => { e.stopPropagation(); onEdit(tpl); }}>✏️</button>
              <button className="acb" title="Delete"
                onClick={(e) => { e.stopPropagation(); onDelete(tpl.id); }}>🗑️</button>
            </div>
          )}
        </div>

        {/* ── Card body ────────────────────────────────────────────────── */}
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

      {/* ── Step 1: Choice dialog ── */}
      {videoMode === "choice" && (
        <VideoChoiceDialog
          url={tpl.image}
          title={tpl.title}
          onClose={() => setVideoMode(null)}
          onPreview={() => setVideoMode("preview")}
          onFullPreview={handleFullPreview}
        />
      )}

      {/* ── Step 2a: Inline preview modal ── */}
      {videoMode === "preview" && (
        <VideoPreviewModal
          url={tpl.image}
          title={tpl.title}
          onClose={() => setVideoMode(null)}
        />
      )}
    </>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);

  const handleEmailChange = (val) => { setEmail(val); setErr(""); setShowPass(val.trim() === _A.e); };

  const submit = async () => {
    setErr("");
    if (!email.trim()) return setErr("Please enter your email address.");
    const isAdminUser = email.trim() === _A.e;
    if (isAdminUser) {
      if (!pass) return setErr("Password required.");
      if (pass !== _A.p) return setErr("Incorrect password.");
      setLoading(true);
      const s = { email: _A.e, role: "admin", name: "Admin", at: Date.now() };
      session.set(s); onLogin(s); setLoading(false);
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        return setErr("Please enter a valid email.");
      setLoading(true);
      try {
        const lower = email.trim().toLowerCase();
        const deviceInfo = getDeviceFingerprint();
        const { isNewDevice } = await upsertUser(lower, deviceInfo);
        if (isNewDevice) sendDeviceAlertEmail(lower, deviceInfo);
        const s = { email: lower, role: "user", name: lower.split("@")[0], at: Date.now() };
        session.set(s); onLogin(s);
      } catch { setErr("Something went wrong. Please try again."); }
      finally { setLoading(false); }
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
  const [preview, setPreview] = useState(tpl?.image || "");
  const [_file, setFile]      = useState(null);
  const [saving, setSaving]   = useState(false);
  const fileInputRef          = useRef(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    return () => { if (_file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview); };
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setErr("");
  };

  const save = async () => {
    setErr(""); setSuccess(false);
    if (!f.title.trim()) return setErr("Title is required.");
    const priceNum = Number(f.price);
    if (!f.price || isNaN(priceNum) || priceNum <= 0) return setErr("Enter a valid price.");
    if (!f.image && !_file) return setErr("Please upload an image or video.");
    setSaving(true);
    try {
      await onSave({ ...f, price: priceNum, id: tpl?.id, _file });
      setSuccess(true);
      setTimeout(() => onClose(), 900);
    } catch (e) { setErr(e?.message || "Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  const isVidPreview = _file ? _file.type.startsWith("video/") : isVideoUrl(preview);

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
            <input className="fi" type="number" placeholder="999" value={f.price} min="1"
              onChange={(e) => set("price", e.target.value)} />
          </div>
          <div className="fg" style={{ gridColumn: "1/-1" }}>
            <label className="flabel">Image / Video *</label>
            <input ref={fileInputRef} className="fi" type="file" accept="image/*,video/*"
              onChange={handleFile} style={{ padding: "7px 10px", cursor: "pointer" }} />
            {_file ? (
              <div style={{ fontSize: "0.75rem", color: "var(--pk2)", marginTop: 4 }}>✅ New file: {_file.name}</div>
            ) : tpl?.image ? (
              <div style={{ fontSize: "0.75rem", color: "var(--txt3)", marginTop: 4 }}>No new file — existing media kept.</div>
            ) : null}
          </div>
          {preview && (
            <div style={{ gridColumn: "1/-1", borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--pk3)", maxHeight: 180 }}>
              {isVidPreview ? (
                <video src={preview} controls style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
              ) : (
                <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
              )}
            </div>
          )}
          <div className="fg" style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="act" checked={f.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              style={{ accentColor: "var(--pk)", width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="act" style={{ fontSize: "0.88rem", color: "var(--txt2)", cursor: "pointer", fontWeight: 500 }}>
              Active — visible to all users
            </label>
          </div>
        </div>
        {err     && <div className="errmsg" style={{ marginTop: 8 }}>⚠️ {err}</div>}
        {success && <div style={{ fontSize: "0.85rem", color: "#27ae60", marginTop: 8, textAlign: "center" }}>✅ Saved!</div>}
        <button type="button" className="sub-btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : tpl ? "Save Changes" : "Add Template"}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDash({ templates, onAdd, onEdit, onDelete, onToggle, onLogout }) {
  const [tab, setTab]           = useState("templates");
  const [showForm, setShowForm] = useState(false);
  const [editTpl, setEditTpl]   = useState(null);
  const [users, setUsers]       = useState([]);

  useEffect(() => { if (tab === "users") fetchUsers().then(setUsers); }, [tab]);

  const total  = templates.length;
  const active = templates.filter((t) => t.is_active).length;
  const bycat  = (c) => templates.filter((t) => t.category === c).length;

  const doSave = async (data) => {
    data.id ? await onEdit(data) : await onAdd(data);
    setShowForm(false); setEditTpl(null);
  };

  return (
    <div className="adm">
      <div className="adm-hdr">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2>Admin Dashboard</h2><span className="adm-badge">Admin</span>
          </div>
          <p>Manage templates · View user registrations · Control visibility</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="add-fab" onClick={() => { setEditTpl(null); setShowForm(true); }}>＋ Add Template</button>
          <button className="btn-nav" style={{ color: "rgba(255,255,255,0.65)", borderColor: "rgba(255,255,255,0.2)" }} onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="stats-row">
        {[["Total",total,"var(--pk)"],["Active",active,"#27ae60"],["Hidden",total-active,"var(--pk)"],
          ["Wedding",bycat("wedding"),"var(--pk)"],["Housewarming",bycat("housewarming"),"var(--pk)"],
          ["Birthday",bycat("birthday"),"var(--pk)"],["Users",users.length,"var(--pk)"]
        ].map(([label, val, color]) => (
          <div key={label} className="scard"><div className="n" style={{ color }}>{val}</div><div className="l">{label}</div></div>
        ))}
      </div>

      <div className="adm-tabs">
        <button className={`adm-tab${tab === "templates" ? " on" : ""}`} onClick={() => setTab("templates")}>📦 Templates ({total})</button>
        <button className={`adm-tab${tab === "users" ? " on" : ""}`} onClick={() => setTab("users")}>👥 Users ({users.length})</button>
      </div>

      {tab === "templates" && (
        <div className="tbl-wrap">
          <table className="atbl">
            <thead><tr><th>Preview</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {templates.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--txt3)" }}>No templates yet.</td></tr>
              )}
              {templates.map((t) => (
                <tr key={t.id}>
                  <td>
                    {isVideoUrl(t.image) ? (
                      <video src={t.image} className="thumb" muted preload="metadata"
                        onLoadedMetadata={(e) => { e.target.currentTime = 0.1; }}
                        style={{ borderRadius: 8, border: "1px solid var(--pk3)" }} />
                    ) : (
                      <img className="thumb" src={t.image} alt={t.title}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=52&h=38&fit=crop"; }} />
                    )}
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 170 }}>{t.title}</td>
                  <td><span className={`bcat ${t.category === "wedding" ? "bw" : t.category === "housewarming" ? "bh" : "bb"}`}>{t.category}</span></td>
                  <td style={{ color: "var(--pk)", fontWeight: 700 }}>₹{t.price.toLocaleString()}</td>
                  <td><button className="tog" onClick={() => onToggle(t.id, t.is_active)}>{t.is_active ? "✅" : "❌"}</button></td>
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
          {users.length === 0 && <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--txt3)" }}>No users yet.</div>}
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

      {showForm && <TplForm tpl={editTpl} onClose={() => { setShowForm(false); setEditTpl(null); }} onSave={doSave} />}
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ templates, session: sess, isAdmin, onEdit, onDelete, onToggle, onLoginClick, toast }) {
  const [cat, setCat]           = useState("all");
  const [maxPrice, setMaxPrice] = useState(2500);
  const [editTpl, setEditTpl]   = useState(null);
  const highPrice = templates.length ? Math.max(...templates.map((t) => t.price), 2500) : 2500;
  const shown = templates
    .filter((t) => isAdmin || t.is_active)
    .filter((t) => cat === "all" || t.category === cat)
    .filter((t) => t.price <= maxPrice);
  const cats = [
    { k: "all", l: "✨ All" }, { k: "wedding", l: "💍 Wedding" },
    { k: "housewarming", l: "🏡 Housewarming" }, { k: "birthday", l: "🎂 Birthday" },
  ];

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
            <button className="btn-hero primary" onClick={() => document.getElementById("tgrid")?.scrollIntoView({ behavior: "smooth" })}>Explore Designs →</button>
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
              <input type="range" min={200} max={highPrice} step={50} value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))} />
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
            <p style={{ marginBottom: "1.8rem" }}>Create a free account — no OTP, instant access</p>
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
                    onEmailClick={(t) => sendEnquiryEmail(t, toast)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {editTpl && (
        <TplForm tpl={editTpl} onClose={() => setEditTpl(null)}
          onSave={async (data) => { await onEdit(data); setEditTpl(null); toast("Template updated! ✅"); }} />
      )}
    </>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sess, setSess]           = useState(() => session.get());
  const [page, setPage]           = useState(() => session.get()?.role === "admin" ? "admin" : "home");
  const [showLogin, setShowLogin] = useState(false);
  const { toasts, push: toast }   = useToast();
  const channelRef                = useRef(null);
  const isAdmin                   = sess?.role === "admin";

  useEffect(() => {
    fetchTemplates(isAdmin).then((data) => { setTemplates(data); setLoading(false); });
  }, [isAdmin]);

  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const channel = supabase.channel("templates-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "templates" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new;
          if (!isAdmin && !r.is_active) return;
          setTemplates((p) => [r, ...p]);
        }
        if (payload.eventType === "UPDATE") {
          const u = payload.new;
          setTemplates((p) => {
            if (!isAdmin && !u.is_active) return p.filter((t) => t.id !== u.id);
            const exists = p.find((t) => t.id === u.id);
            if (exists) return p.map((t) => (t.id === u.id ? u : t));
            return [u, ...p];
          });
        }
        if (payload.eventType === "DELETE") {
          setTemplates((p) => p.filter((t) => t.id !== payload.old.id));
        }
      }).subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const addT  = async (tpl) => { const r = await insertTemplate(tpl); toast("Template added! ✨"); return r; };
  const editT = async (tpl) => { await updateTemplate(tpl); toast("Template updated! ✅"); };
  const delT  = async (id)  => { if (!window.confirm("Delete permanently?")) return; await deleteTemplate(id); toast("Deleted."); };
  const togT  = async (id, cur) => { await toggleTemplate(id, cur); toast("Visibility updated! 👁️"); };

  const handleLogin = async (s) => {
    setSess(s); setShowLogin(false);
    if (s.role === "admin") { setPage("admin"); toast("Welcome back, Admin! 🛡️"); fetchTemplates(true).then(setTemplates); }
    else toast(`Welcome, ${s.name}! 🌸`);
  };

  const handleLogout = () => {
    session.del(); setSess(null); setPage("home");
    toast("Logged out. See you soon! 👋");
    fetchTemplates(false).then(setTemplates);
  };

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
