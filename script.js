const SUPABASE_URL = "https://sqctdbdoyducekpnqzmc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mK1pDfNCrtgxTyTsVF4hHg_siM97opY";
const demoMaterials = [
 {id:"demo-1",name:"Electric Motor 5 HP",code:"DEMO-1001",category:"Electrical",quantity:2,unit:"Nos.",location:"Mysore Terminal",condition:"Serviceable",status:"Available",facility:"Terminal",specs:"5 HP motor; illustrative specification",description:"Illustrative surplus motor. Technical inspection and compatibility checks are required before reuse."},
 {id:"demo-2",name:"Centrifugal Water Pump",code:"DEMO-1002",category:"Mechanical",quantity:1,unit:"No.",location:"Bangalore Terminal",condition:"For Inspection",status:"Available",facility:"Terminal",specs:"Industrial water pump; illustrative specification",description:"Sample pump listing for demonstrating cross-location discovery and reuse requests."},
 {id:"demo-3",name:"Office Chairs",code:"DEMO-1003",category:"Office Equipment",quantity:12,unit:"Nos.",location:"Lucknow Divisional Office",condition:"Serviceable",status:"Available",facility:"Office",specs:"Standard office chair",description:"Sample office furniture listing. Condition and suitability should be checked before transfer."},
 {id:"demo-4",name:"LED Tube Lights",code:"DEMO-1004",category:"Electrical",quantity:25,unit:"Nos.",location:"Mysore Bottling Plant",condition:"New",status:"Available",facility:"Bottling Plant",specs:"LED tube lights; illustrative specification",description:"Illustrative electrical item listing."},
 {id:"demo-5",name:"GI Pipes 2 Inch",code:"DEMO-1005",category:"Civil",quantity:30,unit:"Metres",location:"Bangalore Bottling Plant",condition:"Serviceable",status:"Available",facility:"Bottling Plant",specs:"2-inch galvanised iron pipes",description:"Sample civil material listing. Confirm dimensions and condition before reuse."},
 {id:"demo-6",name:"Desktop Computers",code:"DEMO-1006",category:"IT Equipment",quantity:4,unit:"Nos.",location:"Lucknow Divisional Office",condition:"For Inspection",status:"Available",facility:"Office",specs:"Desktop computer; configuration to be verified",description:"Illustrative IT equipment. Data sanitisation and IT approval are required before any reuse."},
 {id:"demo-7",name:"Steel Storage Racks",code:"DEMO-1007",category:"Office Equipment",quantity:3,unit:"Nos.",location:"Mysore Terminal",condition:"Serviceable",status:"Available",facility:"Terminal",specs:"Metal storage rack",description:"Sample storage equipment listing."},
 {id:"demo-8",name:"Industrial Exhaust Fan",code:"DEMO-1008",category:"Electrical",quantity:2,unit:"Nos.",location:"Bangalore Aviation Station",condition:"Serviceable",status:"Available",facility:"Aviation",specs:"Industrial exhaust fan; specifications to be confirmed",description:"Illustrative aviation-facility listing. Engineering suitability must be verified."},
 {id:"demo-9",name:"Ball Bearings",code:"DEMO-1009",category:"Mechanical",quantity:20,unit:"Nos.",location:"Lucknow Terminal",condition:"New",status:"Available",facility:"Terminal",specs:"Bearing type and dimensions to be verified",description:"Sample spares listing; verify part number and compatibility before reuse."},
 {id:"demo-10",name:"PVC Pipes 1 Inch",code:"DEMO-1010",category:"Civil",quantity:40,unit:"Metres",location:"Mysore Bottling Plant",condition:"Serviceable",status:"Available",facility:"Bottling Plant",specs:"1-inch PVC pipe",description:"Illustrative piping material."},
 {id:"demo-11",name:"UPS 2 kVA",code:"DEMO-1011",category:"Electrical",quantity:2,unit:"Nos.",location:"Bangalore Divisional Office",condition:"Serviceable",status:"Available",facility:"Office",specs:"2 kVA UPS; battery health to be checked",description:"Sample UPS listing. Verify battery health and technical suitability."},
 {id:"demo-12",name:"Office Tables",code:"DEMO-1012",category:"Office Equipment",quantity:5,unit:"Nos.",location:"Lucknow Divisional Office",condition:"Serviceable",status:"Available",facility:"Office",specs:"Standard office table",description:"Illustrative office furniture listing."}
];
let materials = [], usingDemo = false;
let requests = JSON.parse(localStorage.getItem("adisheshanDemoRequests") || "[]");
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const iconFor = category => ({Electrical:"ϟ",Mechanical:"⚙",Civil:"▥","Office Equipment":"▤","IT Equipment":"▣",Safety:"◇"}[category] || "▤");
async function loadMaterials(){
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/materials?select=*`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`}});
    if(!response.ok) throw new Error(`Supabase returned ${response.status}`);
    const rows=await response.json();
    materials=rows.map((r,i)=>({id:r.id ?? `row-${i+1}`,name:r.material_name||"Unnamed material",code:r.material_code||`MAT-${r.id??i+1}`,category:r.category||"Uncategorised",quantity:Number(r.quantity)||0,unit:r.unit||"Nos.",location:r.location||"Location not specified",condition:r.condition||"Not specified",status:r.status||"Available",facility:r.facility||"Not specified",specs:r.specs||"",description:r.description||""}));
    usingDemo=false;setConnection("connected","Connected to central Supabase directory");return true;
  }catch(err){
    console.error("Supabase load failed",err);materials=[...demoMaterials];usingDemo=true;setConnection("error","Demo listings · database unavailable");return false;
  }
}
function setConnection(state,label){const el=$("connectionStatus");el.className="data-status "+state;el.innerHTML=`<span class="status-dot"></span><span>${escapeHtml(label)}</span>`;}
function populateFilters(){
 const loc=$("locationFilter"),cat=$("categoryFilter");
 loc.innerHTML='<option value="">All locations</option>';cat.innerHTML='<option value="">All categories</option>';
 [...new Set(materials.map(m=>m.location).filter(Boolean))].sort().forEach(v=>loc.add(new Option(v,v)));
 [...new Set(materials.map(m=>m.category).filter(Boolean))].sort().forEach(v=>cat.add(new Option(v,v)));
}
function renderStats(){
 $("totalMaterials").textContent=materials.length;
 $("availableMaterials").textContent=materials.filter(m=>String(m.status).toLowerCase()==="available").length;
 $("totalLocations").textContent=new Set(materials.map(m=>m.location).filter(Boolean)).size;
 $("totalRequests").textContent=requests.length;
}
function renderMaterials(){
 const q=$("searchInput").value.trim().toLowerCase(),loc=$("locationFilter").value,cat=$("categoryFilter").value,status=$("statusFilter").value;
 const filtered=materials.filter(m=>(!q||[m.name,m.code,m.category,m.location,m.specs,m.description].join(" ").toLowerCase().includes(q))&&(!loc||m.location===loc)&&(!cat||m.category===cat)&&(!status||m.status===status));
 $("resultCount").textContent=`${filtered.length} material${filtered.length===1?"":"s"}`;
 $("loadingState").classList.add("hidden");$("emptyState").classList.toggle("hidden",filtered.length!==0);
 $("materialGrid").innerHTML=filtered.map(m=>`<article class="material-card"><div class="card-top"><div class="material-symbol">${iconFor(m.category)}</div><span class="status ${escapeHtml(String(m.status).toLowerCase().replace(/[^a-z]/g,""))}">${escapeHtml(m.status)}</span></div><h3>${escapeHtml(m.name)}</h3><div class="material-code">${escapeHtml(m.code)}</div><div class="material-meta"><div><div class="meta-label">Available quantity</div><div class="meta-value">${Number(m.quantity)||0} ${escapeHtml(m.unit)}</div></div><div><div class="meta-label">Location</div><div class="meta-value">${escapeHtml(m.location)}</div></div></div><div class="card-bottom"><span class="category">${escapeHtml(m.category)} · ${escapeHtml(m.condition)}</span><button class="text-button" data-details="${escapeHtml(m.id)}">View details →</button></div></article>`).join("");
 $("materialGrid").querySelectorAll("[data-details]").forEach(b=>b.addEventListener("click",()=>showDetails(b.dataset.details)));
}
function showDetails(id){
 const m=materials.find(x=>String(x.id)===String(id));if(!m)return;
 $("detailContent").innerHTML=`<h2 class="detail-title" id="detailTitle">${escapeHtml(m.name)}</h2><p class="material-code">${escapeHtml(m.code)} · ${escapeHtml(m.category)}</p><div class="detail-grid"><div class="detail-cell"><span>Quantity</span><strong>${Number(m.quantity)||0} ${escapeHtml(m.unit)}</strong></div><div class="detail-cell"><span>Location</span><strong>${escapeHtml(m.location)}</strong></div><div class="detail-cell"><span>Condition</span><strong>${escapeHtml(m.condition)}</strong></div><div class="detail-cell"><span>Status</span><strong>${escapeHtml(m.status)}</strong></div><div class="detail-cell"><span>Facility</span><strong>${escapeHtml(m.facility||"Not specified")}</strong></div><div class="detail-cell"><span>Record source</span><strong>${usingDemo?"Demonstration data":"Central directory"}</strong></div></div><p class="detail-description"><strong>Specifications:</strong> ${escapeHtml(m.specs||"Not provided")}</p><p class="detail-description">${escapeHtml(m.description||"No additional description provided.")}</p><p class="modal-note">Confirm condition, compatibility, ownership and required approvals with the material custodian before reuse.</p>`;
 $("detailModal").classList.remove("hidden");
}
function openAdd(){ $("addForm").reset();$("addMessage").classList.add("hidden");$("addModal").classList.remove("hidden"); }
function closeModal(id){$(id).classList.add("hidden");}
function resetFilters(){$("searchInput").value="";$("locationFilter").value="";$("categoryFilter").value="";$("statusFilter").value="";renderMaterials();}
$("searchInput").addEventListener("input",renderMaterials);
["locationFilter","categoryFilter","statusFilter"].forEach(id=>$(id).addEventListener("change",renderMaterials));
$("resetFilters").addEventListener("click",resetFilters);$("emptyReset").addEventListener("click",resetFilters);
["openAddTop","openAddHero"].forEach(id=>$(id).addEventListener("click",openAdd));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(b=>b.addEventListener("click",e=>{if(e.target===b)b.classList.add("hidden");}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal-backdrop").forEach(m=>m.classList.add("hidden"));});
$("addForm").addEventListener("submit",e=>{
 e.preventDefault();
 const draft={id:`draft-${Date.now()}`,name:$("addName").value.trim(),code:"LOCAL-PREVIEW",category:$("addCategory").value,location:$("addLocation").value.trim(),quantity:Number($("addQuantity").value),unit:$("addUnit").value,condition:$("addCondition").value,status:"Draft preview",facility:"Not specified",specs:"",description:$("addDescription").value.trim()};
 if(!draft.name||!draft.location||!Number.isInteger(draft.quantity)||draft.quantity<1){$("addMessage").textContent="Please enter a material name, location and a whole-number quantity greater than zero.";$("addMessage").classList.remove("hidden");return;}
 $("addMessage").innerHTML=`<strong>Preview created: ${escapeHtml(draft.name)}</strong><br>This listing has not been published or saved to Supabase. To make it official, an authorised administrator must add it to the central database.`;
 $("addMessage").classList.remove("hidden");
 showToast("Preview ready — no central database record was created.");
});
function showToast(message){const t=$("toast");t.textContent=message;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),3200);}
(async()=>{await loadMaterials();populateFilters();renderMaterials();renderStats();})();
