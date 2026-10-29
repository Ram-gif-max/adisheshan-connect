const SUPABASE_URL = "https://sqctdbdoyducekpnqzmc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mK1pDfNCrtgxTyTsVF4hHg_siM97opY";
const TABLE = "materials";
const DB_FIELDS = ["material_name", "category", "location", "quantity", "condition", "status", "description"];
const demoMaterials = [
 {id:"demo-1",material_name:"Electric Motor 5 HP",category:"Electrical",quantity:2,location:"Mysore Terminal",condition:"Serviceable",status:"Available",description:"DEMO RECORD — illustrative surplus motor."},
 {id:"demo-2",material_name:"Centrifugal Water Pump",category:"Mechanical",quantity:1,location:"Bangalore Terminal",condition:"For Inspection",status:"Available",description:"DEMO RECORD — illustrative pump listing."},
 {id:"demo-3",material_name:"Office Chairs",category:"Office Equipment",quantity:12,location:"Lucknow Divisional Office",condition:"Serviceable",status:"Available",description:"DEMO RECORD — illustrative office furniture."}
];
let materials = [], usingDemo = false, currentRecordId = null, saveTimer = null, saveInProgress = false, pendingSave = false;
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const iconFor = category => ({Electrical:"ϟ",Mechanical:"⚙",Civil:"▥","Office Equipment":"▤","IT Equipment":"▣",Safety:"◇"}[category] || "▤");
const headers = () => ({ apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`, "Content-Type":"application/json", Prefer:"return=representation" });
function mapRow(r){ return {id:r.id, name:r.material_name || "Unnamed material", code:r.id ? `MAT-${r.id}` : "", category:r.category || "", quantity:r.quantity == null ? "" : Number(r.quantity), location:r.location || "", condition:r.condition || "", status:r.status || "", description:r.description || ""}; }
async function loadMaterials(){
 try{
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*&order=id.desc`,{headers:headers()});
  if(!response.ok) throw new Error(await response.text());
  const rows=await response.json(); materials=rows.map(mapRow); usingDemo=false; setConnection("connected","Connected to central Supabase directory"); return true;
 }catch(err){ console.error("Supabase load failed",err); materials=demoMaterials.map(mapRow); usingDemo=true; setConnection("error","Demo listings · database unavailable"); return false; }
}
function setConnection(state,label){ const el=$("connectionStatus"); if(!el)return; el.className="data-status "+state; el.innerHTML=`<span class="status-dot"></span><span>${escapeHtml(label)}</span>`; }
function populateFilters(){
 const mappings=[["locationFilter","location","All locations"],["categoryFilter","category","All categories"],["statusFilter","status","All statuses"]];
 mappings.forEach(([id,key,placeholder])=>{ const select=$(id), previous=select.value; select.innerHTML=""; select.add(new Option(placeholder,"")); [...new Set(materials.map(m=>String(m[key] ?? "").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b)).forEach(v=>select.add(new Option(v,v))); if([...select.options].some(o=>o.value===previous))select.value=previous; });
}
function renderStats(){ $("totalMaterials").textContent=materials.length; $("availableMaterials").textContent=materials.filter(m=>String(m.status).toLowerCase()==="available").length; $("totalLocations").textContent=new Set(materials.map(m=>m.location).filter(Boolean)).size; }
function renderMaterials(){
 const q=$("searchInput").value.trim().toLowerCase(),loc=$("locationFilter").value,cat=$("categoryFilter").value,status=$("statusFilter").value;
 const filtered=materials.filter(m=>(!q||[m.name,m.code,m.category,m.location,m.description,m.condition,m.status].join(" ").toLowerCase().includes(q))&&(!loc||m.location===loc)&&(!cat||m.category===cat)&&(!status||m.status===status));
 $("resultCount").textContent=`${filtered.length} material${filtered.length===1?"":"s"}`; $("loadingState").classList.add("hidden"); $("emptyState").classList.toggle("hidden",filtered.length!==0);
 $("materialGrid").innerHTML=filtered.map(m=>`<article class="material-card"><div class="card-top"><div class="material-symbol">${iconFor(m.category)}</div><span class="status ${escapeHtml(String(m.status).toLowerCase().replace(/[^a-z]/g,""))}">${escapeHtml(m.status||"Status not set")}</span></div><h3>${escapeHtml(m.name)}</h3><div class="material-code">${escapeHtml(m.code)}</div><div class="material-meta"><div><div class="meta-label">Quantity</div><div class="meta-value">${escapeHtml(m.quantity === "" ? "—" : m.quantity)}</div></div><div><div class="meta-label">Location</div><div class="meta-value">${escapeHtml(m.location||"Not set")}</div></div></div><div class="card-bottom"><span class="category">${escapeHtml(m.category||"Category not set")} · ${escapeHtml(m.condition||"Condition not set")}</span><button class="text-button" data-details="${escapeHtml(m.id)}">View details →</button></div></article>`).join("");
 $("materialGrid").querySelectorAll("[data-details]").forEach(b=>b.addEventListener("click",()=>showDetails(b.dataset.details)));
}
function showDetails(id){ const m=materials.find(x=>String(x.id)===String(id)); if(!m)return; $("detailContent").innerHTML=`<h2 class="detail-title" id="detailTitle">${escapeHtml(m.name)}</h2><p class="material-code">Record ID: ${escapeHtml(m.id)} · ${escapeHtml(m.category)}</p><div class="detail-grid"><div class="detail-cell"><span>Quantity</span><strong>${escapeHtml(m.quantity===""?"Not entered":m.quantity)}</strong></div><div class="detail-cell"><span>Location</span><strong>${escapeHtml(m.location||"Not entered")}</strong></div><div class="detail-cell"><span>Condition</span><strong>${escapeHtml(m.condition||"Not entered")}</strong></div><div class="detail-cell"><span>Status</span><strong>${escapeHtml(m.status||"Not entered")}</strong></div></div><p class="detail-description">${escapeHtml(m.description||"No description entered.")}</p>`; $("detailModal").classList.remove("hidden"); }
function setAutosave(message,state=""){ const el=$("autosaveStatus"); if(el){el.textContent=message;el.className=`autosave-status ${state}`;} }
function openAdd(){ $("addForm").reset(); currentRecordId=null; clearTimeout(saveTimer); setAutosave("Not saved yet"); $("addMessage").classList.add("hidden"); $("addModal").classList.remove("hidden"); }
function closeModal(id){ $(id).classList.add("hidden"); }
function resetFilters(){ $("searchInput").value=""; $("locationFilter").value=""; $("categoryFilter").value=""; $("statusFilter").value=""; renderMaterials(); }
function formPayload(){ const raw={material_name:$("addName").value.trim(),category:$("addCategory").value.trim()||null,location:$("addLocation").value.trim()||null,quantity:$("addQuantity").value.trim()===""?null:Number($("addQuantity").value),condition:$("addCondition").value.trim()||null,status:$("addStatus").value.trim()||null,description:$("addDescription").value.trim()||null}; if(raw.quantity!==null&&!Number.isFinite(raw.quantity)) throw new Error("Quantity must be a valid number."); return raw; }
async function saveRecord(){
 if(saveInProgress){pendingSave=true;return;}
 if(usingDemo){setAutosave("Not saved: database is unavailable","error");return;}
 let payload; try{payload=formPayload();}catch(e){setAutosave(e.message,"error");return;}
 // Wait for material_name before creating a row, so an accidental blank record is not created.
 if(!currentRecordId && !payload.material_name){setAutosave("Enter material name to create the database record");return;}
 setAutosave("Saving to database…","saving"); saveInProgress=true;
 try{
  let response;
  if(!currentRecordId){
   response=await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`,{method:"POST",headers:headers(),body:JSON.stringify(payload)});
   if(!response.ok)throw new Error(await response.text());
   const rows=await response.json(); if(!rows.length||rows[0].id==null)throw new Error("Record saved but Supabase did not return an id. Ensure the table has an id column and Prefer return=representation is allowed."); currentRecordId=rows[0].id;
  } else {
   response=await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(currentRecordId)}`,{method:"PATCH",headers:headers(),body:JSON.stringify(payload)});
   if(!response.ok)throw new Error(await response.text());
  }
  const idx=materials.findIndex(m=>String(m.id)===String(currentRecordId)); const row=mapRow({id:currentRecordId,...payload}); if(idx>=0)materials[idx]=row;else materials.unshift(row);
  populateFilters(); renderMaterials(); renderStats(); setAutosave(`Saved to database · Record ID ${currentRecordId}`,"success");
 }catch(err){console.error("Auto-save failed",err);setAutosave("Save failed: "+(err.message||"check Supabase policies and table columns"),"error");}
 finally{saveInProgress=false;if(pendingSave){pendingSave=false;scheduleSave();}}
}
function scheduleSave(){ if(usingDemo){setAutosave("Database unavailable — not saved","error");return;} setAutosave(currentRecordId?"Unsaved changes…":"Waiting for material name…","saving"); clearTimeout(saveTimer); saveTimer=setTimeout(saveRecord,650); }
$("searchInput").addEventListener("input",renderMaterials); ["locationFilter","categoryFilter","statusFilter"].forEach(id=>$(id).addEventListener("change",renderMaterials)); $("resetFilters").addEventListener("click",resetFilters); $("emptyReset").addEventListener("click",resetFilters);
["openAddTop","openAddHero"].forEach(id=>$(id).addEventListener("click",openAdd)); document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close))); document.querySelectorAll(".modal-backdrop").forEach(b=>b.addEventListener("click",e=>{if(e.target===b)b.classList.add("hidden");})); document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal-backdrop").forEach(m=>m.classList.add("hidden"));});
["addName","addCategory","addLocation","addQuantity","addCondition","addStatus","addDescription"].forEach(id=>$(id).addEventListener("input",scheduleSave)); $("addForm").addEventListener("submit",e=>e.preventDefault());
(async()=>{await loadMaterials();populateFilters();renderMaterials();renderStats();})();
