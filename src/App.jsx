// ─── INSTALL DEPENDENCIES ─────────────────────────────────────────────────────
// npm install @supabase/supabase-js @emailjs/browser
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = "https://myenjbljtvlwptlxzlhh.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZW5qYmxqdHZsd3B0bHh6bGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTk1NzAsImV4cCI6MjA5MjA5NTU3MH0.zLEW6w3nZSViXMAvyuxR72HrhCIIuAkmBvTtV27Jv5Q";

const EMAILJS_PUBLIC_KEY  = "sMgdbh9Kiv0o3szux";
const EMAILJS_SERVICE_ID  = "service_fuq1yop";
const EMAILJS_DEVICE_TPL  = "template_device_login";
const EMAILJS_ENQUIRY_TPL = "template_u46iezf";

const BROCHURE_B64 = "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";

function downloadBrochure() {
  const bc = atob(BROCHURE_B64);
  const ba = new Uint8Array(bc.length);
  for (let i = 0; i < bc.length; i++) ba[i] = bc.charCodeAt(i);
  const blob = new Blob([ba], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "WORKIX_Brochure.docx"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import emailjs from "@emailjs/browser";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const _A   = { e: "priyasaki190@gmail.com", p: "priyasaki@9840" };
const WA   = "919840903746";
const MAIL = "workiz986@gmail.com";
const IG = "https://www.instagram.com/work_iix";

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

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

.hdr{background:rgba(255,255,255,0.97);border-bottom:1px solid rgba(232,24,109,0.10);position:sticky;top:0;z-index:200;box-shadow:0 2px 18px rgba(232,24,109,0.06)}
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
.fbar{background:rgba(255,255,255,0.97);border-bottom:1px solid rgba(232,24,109,0.07);position:sticky;top:68px;z-index:190;box-shadow:0 2px 12px rgba(232,24,109,0.03);padding:0.9rem 2rem}
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
.tgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.tcard{width:100%;background:#fff;border-radius:var(--r);overflow:hidden;box-shadow:var(--sh1);border:1px solid rgba(232,24,109,0.07);transition:transform 0.32s cubic-bezier(0.4,0,0.2,1),box-shadow 0.32s cubic-bezier(0.4,0,0.2,1);animation:fadeUp 0.5s ease both;position:relative}
.tcard:hover{transform:translateY(-8px) scale(1.012);box-shadow:var(--sh3)}
.tcard-img-wrap{position:relative;aspect-ratio:16/9;overflow:hidden;background:var(--pk4)}
.tcard-img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1)}
.tcard:hover .tcard-img{transform:scale(1.09)}
.tcard-vid-thumb{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1);pointer-events:none}
.tcard:hover .tcard-vid-thumb{transform:scale(1.09)}
.tcard-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,10,18,0.55) 0%,transparent 55%);opacity:0;transition:opacity 0.3s;pointer-events:none}
.tcard:hover .tcard-ov{opacity:1}
.play-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:1}
.play-btn{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 22px rgba(0,0,0,0.28)}
.play-arrow{width:0;height:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:20px solid var(--pk);margin-left:4px}
.vid-badge{position:absolute;bottom:10px;left:12px;background:rgba(0,0,0,0.62);color:#fff;font-size:0.64rem;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:0.6px}
.cat-badge{position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.92);color:var(--pk2);font-size:0.7rem;font-weight:700;padding:4px 12px;border-radius:var(--r3);text-transform:uppercase;letter-spacing:0.6px;border:1px solid rgba(232,24,109,0.12)}
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
.acb{background:rgba(255,255,255,0.9);border:none;border-radius:8px;padding:5px 7px;cursor:pointer;font-size:13px;transition:var(--tr)}
.acb:hover{transform:scale(1.12)}
.vpm-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:#000;z-index:9000;animation:fadeIn 0.15s ease;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
.vpm-video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000;display:block;outline:none;opacity:0;transition:opacity 0.3s ease}
.vpm-video.ready{opacity:1}
.vpm-loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:14px;pointer-events:none;transition:opacity 0.25s ease;z-index:2}
.vpm-loading.gone{opacity:0;pointer-events:none}
.vpm-spinner{width:48px;height:48px;border:3px solid rgba(255,255,255,0.15);border-top-color:var(--pk);border-radius:50%;animation:spin 0.85s linear infinite}
.vpm-load-text{font-size:0.85rem;color:rgba(255,255,255,0.55);font-family:'DM Sans',sans-serif;text-align:center;line-height:1.5;max-width:220px}
.vpm-close{position:absolute;top:16px;right:16px;z-index:10;width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,0.7);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.vpm-close:active{background:var(--pk)}
.vpm-error{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:14px;z-index:3;text-align:center}
.vpm-err-text{font-size:0.85rem;color:rgba(255,255,255,0.6);font-family:'DM Sans',sans-serif}
.vpm-btn{padding:11px 26px;border-radius:var(--r3);border:none;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;touch-action:manipulation}
.vpm-btn.primary{background:var(--pk);color:#fff}
.vpm-btn.ghost{background:transparent;color:rgba(255,255,255,0.7);border:1.5px solid rgba(255,255,255,0.25);margin-top:4px}
.vpm-title{position:absolute;bottom:0;left:0;right:0;padding:20px 20px 16px;background:linear-gradient(to top,rgba(0,0,0,0.9) 0%,transparent 100%);color:#fff;font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;pointer-events:none;z-index:2;transition:opacity 0.3s ease}
.vpm-title.gone{opacity:0}
.vcd-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:8000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.18s ease}
.vcd-box{background:#fff;border-radius:22px 22px 0 0;padding:1.6rem 1.6rem 2.4rem;width:100%;max-width:480px;animation:fadeUp 0.25s ease;position:relative}
.vcd-handle{width:40px;height:4px;border-radius:4px;background:rgba(0,0,0,0.12);margin:0 auto 1.2rem}
.vcd-close{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:50%;background:var(--pk4);border:none;cursor:pointer;color:var(--pk);font-size:13px;display:flex;align-items:center;justify-content:center}
.vcd-thumb-wrap{width:100%;height:110px;border-radius:14px;background:linear-gradient(135deg,#2d0818,#1a0a12,#3a1525);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;margin-bottom:1rem}
.vcd-play-circle{width:48px;height:48px;border-radius:50%;background:rgba(232,24,109,0.9);display:flex;align-items:center;justify-content:center}
.vcd-play-tri{width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:17px solid #fff;margin-left:4px}
.vcd-label{font-size:0.68rem;color:rgba(255,255,255,0.55);font-weight:600;letter-spacing:0.8px;text-transform:uppercase}
.vcd-title{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:700;color:var(--txt);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vcd-subtitle{font-size:0.78rem;color:var(--txt3);margin-bottom:1rem}
.vcd-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.vcd-btn{padding:14px 8px;border-radius:14px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:700;display:flex;flex-direction:column;align-items:center;gap:6px;min-height:72px;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.vcd-btn-icon{font-size:1.4rem}
.vcd-btn.preview{background:var(--pk4);border:1.5px solid var(--pk3);color:var(--pk2)}
.vcd-btn.fullscreen{background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff}
.overlay{position:fixed;inset:0;background:rgba(10,0,18,0.7);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn 0.2s ease}
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
.toast-wrap{position:fixed;bottom:2rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{background:linear-gradient(135deg,#1a0a12,#3d0020);color:#fff;padding:12px 18px;border-radius:var(--r2);font-size:0.82rem;box-shadow:0 8px 28px rgba(0,0,0,0.28);animation:slideDown 0.3s ease;border-left:3px solid var(--pk);max-width:260px}
.footer{background:linear-gradient(135deg,#1a0a12,#3d0020);padding:3rem 2rem;text-align:center;color:rgba(255,255,255,0.5);font-size:0.82rem;margin-top:2rem}
.footer-brand{font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--pk3);margin-bottom:0.5rem}
.footer-brand span{color:var(--gd2)}
.gold-div{width:60px;height:2px;background:linear-gradient(to right,transparent,var(--gd2),transparent);margin:0 auto 1.2rem}
.flinks{display:flex;justify-content:center;gap:2rem;margin:1.2rem 0;flex-wrap:wrap}
.flink{color:rgba(255,255,255,0.4);transition:color 0.2s;text-decoration:none;cursor:pointer;font-size:0.82rem}
.flink:hover{color:var(--pk3)}
.loading-overlay{display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:1rem}
.spinner{width:38px;height:38px;border:3px solid var(--pk3);border-top-color:var(--pk);border-radius:50%;animation:spin 0.7s linear infinite}

/* ── CONTACT SECTION ── */
.contact-section{background:linear-gradient(160deg,#fff7fb 0%,#fce8f3 50%,#fdf3dc 100%);padding:4rem 2rem;border-top:1px solid rgba(232,24,109,0.08)}
.contact-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.4fr;gap:3.5rem;align-items:start}
.contact-tag{display:inline-block;font-size:0.75rem;font-weight:700;color:var(--gd);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:1rem}
.contact-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;color:var(--txt);line-height:1.2;margin-bottom:0.8rem}
.contact-title-em{color:var(--pk);font-style:italic}
.contact-gold-line{width:48px;height:3px;background:linear-gradient(to right,var(--gd),var(--gd2));margin-bottom:1.2rem;border-radius:2px}
.contact-desc{font-size:0.95rem;color:var(--txt3);line-height:1.7;margin-bottom:1.8rem;max-width:340px}
.contact-info-list{display:flex;flex-direction:column;gap:1.1rem;margin-bottom:2rem}
.contact-info-item{display:flex;align-items:flex-start;gap:14px}
.contact-info-icon{width:38px;height:38px;border-radius:50%;background:rgba(232,24,109,0.08);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;margin-top:2px}
.contact-info-label{font-size:0.68rem;font-weight:700;color:var(--txt3);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:2px}
.contact-info-val{font-size:0.88rem;font-weight:500;color:var(--txt);text-decoration:none;display:block}
.contact-info-val:hover{color:var(--pk)}
.brochure-btn{display:flex;align-items:center;gap:9px;padding:12px 22px;border-radius:var(--r3);background:linear-gradient(135deg,var(--gd),var(--gd2));color:#fff;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:700;box-shadow:0 4px 14px rgba(201,149,42,0.3);transition:var(--tr)}
.brochure-btn:hover{box-shadow:0 6px 22px rgba(201,149,42,0.5);transform:translateY(-2px)}
.contact-right{background:#fff;border-radius:var(--r);padding:2rem;box-shadow:var(--sh2);border:1px solid rgba(232,24,109,0.07)}
.contact-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cfg{margin-bottom:1rem}
.cfl{display:block;font-size:0.72rem;font-weight:700;color:var(--txt2);margin-bottom:6px;letter-spacing:0.5px}
.cfi{width:100%;padding:10px 14px;border:1.5px solid rgba(232,24,109,0.15);border-radius:var(--r2);font-family:'DM Sans',sans-serif;font-size:0.88rem;color:var(--txt);outline:none;transition:border-color 0.2s;background:#fff;box-sizing:border-box}
.cfi:focus{border-color:var(--pk);box-shadow:0 0 0 3px rgba(232,24,109,0.07)}
.cftx{resize:vertical;min-height:90px;font-family:'DM Sans',sans-serif}
.contact-send-btn{width:100%;padding:13px;border:none;border-radius:var(--r2);background:linear-gradient(135deg,var(--pk),var(--pk2));color:#fff;font-size:0.92rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:var(--tr);box-shadow:0 4px 16px rgba(232,24,109,0.28);letter-spacing:0.5px;margin-top:4px}
.contact-send-btn:hover{box-shadow:0 8px 28px rgba(232,24,109,0.42);transform:translateY(-1px)}

/* ── RESPONSIVE BREAKPOINTS ── */
@media(max-width:768px){.tgrid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.play-btn{width:62px;height:62px}.contact-inner{grid-template-columns:1fr}.contact-form-row{grid-template-columns:1fr}}
@media(max-width:480px){.tgrid{grid-template-columns:1fr}}
@media(max-width:680px){
  .hdr-in{padding:0 1rem}.hero{padding:3.5rem 1rem 3rem}
  .hero-stats{gap:1.5rem}.sep{display:none}
  .fbar{padding:0.7rem 1rem}.main{padding:2rem 1rem 3rem}
  .adm{padding:1rem}.adm-hdr{padding:1.2rem}.adm-tabs{flex-direction:column}
  .contact-section{padding:2.5rem 1rem}
}
`;

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
//  VIDEO CHOICE BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════════════════════
function VideoChoiceDialog({ title, onClose, onPreview, onOpenInBrowser }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="vcd-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vcd-box">
        <div className="vcd-handle" />
        <button className="vcd-close" onClick={onClose}>✕</button>
        <div className="vcd-thumb-wrap">
          <div className="vcd-play-circle"><div className="vcd-play-tri" /></div>
          <div className="vcd-label">Video Invitation</div>
        </div>
        <div className="vcd-title">{title}</div>
        <div className="vcd-subtitle">How would you like to watch?</div>
        <div className="vcd-btns">
          <button className="vcd-btn preview" onClick={onPreview}>
            <span className="vcd-btn-icon">▶️</span>
            Play Here
          </button>
          <button className="vcd-btn fullscreen" onClick={onOpenInBrowser}>
            <span className="vcd-btn-icon">🌐</span>
            Open in Browser
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VIDEO PREVIEW MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function VideoPreviewModal({ url, title, onClose }) {
  const videoRef            = useRef(null);
  const [status, setStatus] = useState("loading");
  const didMarkReady        = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const markReady = useCallback(() => {
    if (didMarkReady.current) return;
    didMarkReady.current = true;
    setStatus("ready");
    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      vid.play().catch(() => { console.log("Autoplay blocked"); });
    }
  }, []);

  const handleClose = () => {
    const vid = videoRef.current;
    if (vid) { vid.pause(); vid.src = ""; vid.load(); }
    onClose();
  };

  const handleRetry = () => {
    didMarkReady.current = false;
    setStatus("loading");
    const vid = videoRef.current;
    if (vid) { vid.load(); }
  };

  return (
    <div className="vpm-overlay">
      <button className="vpm-close" onClick={handleClose} aria-label="Close video">✕</button>
      <video
        ref={videoRef}
        className={`vpm-video${status === "ready" ? " ready" : ""}`}
        src={url} controls playsInline muted autoPlay preload="metadata"
        onCanPlay={markReady} onLoadedData={markReady} onPlaying={markReady}
        onError={() => setStatus("error")}
        x5-playsinline="true" webkit-playsinline="true"
      />
      {status === "loading" && (
        <div className="vpm-loading">
          <div className="vpm-spinner" />
          <div className="vpm-load-text">Loading video…</div>
        </div>
      )}
      {status === "error" && (
        <div className="vpm-error">
          <div style={{ fontSize: "2.5rem" }}>⚠️</div>
          <div className="vpm-err-text">Couldn't load this video</div>
          <button className="vpm-btn primary" onClick={handleRetry}>Try Again</button>
          <button className="vpm-btn ghost" onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>Open in Browser</button>
        </div>
      )}
      {title && <div className={`vpm-title${status !== "ready" ? " gone" : ""}`}>▶ {title}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE CARD
// ═══════════════════════════════════════════════════════════════════════════════
function TCard({ tpl, isAdmin, onEdit, onDelete, onToggle, delay, onEmailClick }) {
  const [videoMode, setVideoMode] = useState(null);
  const mobile = isMobile();
  const waMsg  = encodeURIComponent(`Hi, I'm interested in this invitation template: ${tpl.title}`);
  const isVid  = isVideoUrl(tpl.image);

  const handleCardClick = () => { if (isVid) setVideoMode(mobile ? "preview" : "choice"); };

  return (
    <>
      <div className="tcard" style={{ animationDelay: `${delay}ms`, opacity: !tpl.is_active && isAdmin ? 0.58 : 1 }}>
        <div className="tcard-img-wrap" onClick={handleCardClick} style={{ cursor: isVid ? "pointer" : "default" }}>
          {isVid ? (
            <>
              <video className="tcard-vid-thumb" src={tpl.image} muted preload="metadata" playsInline
                onLoadedMetadata={(e) => { try { e.target.currentTime = 0.5; } catch {} }} />
              <div className="tcard-ov" />
              <div className="play-overlay"><div className="play-btn"><div className="play-arrow" /></div></div>
              <span className="vid-badge">▶ VIDEO</span>
            </>
          ) : (
            <>
              <img className="tcard-img" src={tpl.image} alt={tpl.title}
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=420&fit=crop"; }} />
              <div className="tcard-ov" />
            </>
          )}
          <span className="cat-badge">
            {tpl.category === "wedding" ? "💍 Wedding" : tpl.category === "housewarming" ? "🏡 Housewarming" : "🎂 Birthday"}
          </span>
          {isAdmin && (
            <div className="adm-ctrl">
              <button className="acb" title={tpl.is_active ? "Deactivate" : "Activate"}
                onClick={(e) => { e.stopPropagation(); onToggle(tpl.id, tpl.is_active); }}>
                {tpl.is_active ? "👁️" : "🙈"}
              </button>
              <button className="acb" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(tpl); }}>✏️</button>
              <button className="acb" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(tpl.id); }}>🗑️</button>
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

      {videoMode === "choice" && (
        <VideoChoiceDialog title={tpl.title} onClose={() => setVideoMode(null)}
          onPreview={() => setVideoMode("preview")}
          onOpenInBrowser={() => { setVideoMode(null); window.open(tpl.image, "_blank", "noopener,noreferrer"); }} />
      )}
      {videoMode === "preview" && (
        <VideoPreviewModal url={tpl.image} title={tpl.title} onClose={() => setVideoMode(null)} />
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("Please enter a valid email.");
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
            <input className="fi" placeholder="e.g. Royal Lotus Wedding" value={f.title} onChange={(e) => set("title", e.target.value)} />
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
            <input className="fi" type="number" placeholder="999" value={f.price} min="1" onChange={(e) => set("price", e.target.value)} />
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
            <input type="checkbox" id="act" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)}
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
        {[["Total", total, "var(--pk)"], ["Active", active, "#27ae60"], ["Hidden", total - active, "var(--pk)"],
          ["Wedding", bycat("wedding"), "var(--pk)"], ["Housewarming", bycat("housewarming"), "var(--pk)"],
          ["Birthday", bycat("birthday"), "var(--pk)"], ["Users", users.length, "var(--pk)"]
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
                      <div style={{ width: 52, height: 38, borderRadius: 8, background: "linear-gradient(135deg,#1a0a12,#3d1020)", border: "1px solid var(--pk3)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>▶</div>
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

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTACT SECTION  (matches the "Let's Create Together" screenshot)
// ═══════════════════════════════════════════════════════════════════════════════
function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", date: "", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSend = () => {
    const msg = encodeURIComponent(
      `Hi WORKIX! I'd like to enquire:\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nService: ${form.service}\nEvent Date: ${form.date}\n\nMessage: ${form.message}`
    );
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank", "noopener,noreferrer");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section className="contact-section">
      <div className="contact-inner">
        {/* ── LEFT PANEL ── */}
        <div>
          <div className="contact-tag">✦ GET IN TOUCH</div>
          <h2 className="contact-title">
            Let's Create<br />
            <span className="contact-title-em">Together</span>
          </h2>
          <div className="contact-gold-line" />
          <p className="contact-desc">
            Have a special occasion coming up? Share your details and we'll craft something truly unforgettable just for you.
          </p>
          <div className="contact-info-list">
            <div className="contact-info-item">
              <div className="contact-info-icon">✉</div>
              <div>
                <div className="contact-info-label">EMAIL US</div>
                <a href={`mailto:${MAIL}`} className="contact-info-val">{MAIL}</a>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">💬</div>
              <div>
                <div className="contact-info-label">WHATSAPP</div>
                <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer" className="contact-info-val">Chat With Us</a>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">⏱</div>
              <div>
                <div className="contact-info-label">RESPONSE TIME</div>
                <span className="contact-info-val">Within 24 Hours</span>
              </div>
            </div>
          </div>
          {/* ── BROCHURE DOWNLOAD BUTTON ── */}
          <button className="brochure-btn" onClick={downloadBrochure}>
            <span style={{ fontSize: "1.1rem" }}>📄</span>
            Download Brochure
            <span style={{ fontSize: "0.72rem", opacity: 0.75 }}>.docx</span>
          </button>
        </div>

        {/* ── RIGHT PANEL: FORM ── */}
        <div className="contact-right">
          <div className="contact-form-row">
            <div className="cfg">
              <label className="cfl">YOUR NAME</label>
              <input className="cfi" placeholder="Priya Sharma" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="cfg">
              <label className="cfl">PHONE / WHATSAPP</label>
              <input className="cfi" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="cfg">
            <label className="cfl">EMAIL ADDRESS</label>
            <input className="cfi" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div className="cfg">
            <label className="cfl">SERVICE REQUIRED</label>
            <select className="cfi" value={form.service} onChange={e => set("service", e.target.value)}>
              <option value="">Select a service...</option>
              <option value="Wedding Caricature Video">Wedding Caricature Video</option>
              <option value="Wedding Invitation Card">Wedding Invitation Card</option>
              <option value="Birthday Caricature Video">Birthday Caricature Video</option>
              <option value="Baby Shower Caricature">Baby Shower Caricature</option>
              <option value="Housewarming Invitation">Housewarming Invitation</option>
            </select>
          </div>
          <div className="cfg">
            <label className="cfl">EVENT DATE</label>
            <input className="cfi" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div className="cfg">
            <label className="cfl">YOUR MESSAGE</label>
            <textarea className="cfi cftx" placeholder="Tell us about your event — theme, colors, special details..."
              value={form.message} onChange={e => set("message", e.target.value)} rows={4} />
          </div>
          <button className="contact-send-btn" onClick={handleSend}>
            {sent ? "✅ Opening WhatsApp..." : "✦ SEND MY REQUEST"}
          </button>
        </div>
      </div>
    </section>
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

      {/* ── CONTACT SECTION ── */}
      <ContactSection />

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
          <span className="flink" style={{ cursor: "pointer" }} onClick={downloadBrochure}>📄 Brochure</span>
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
