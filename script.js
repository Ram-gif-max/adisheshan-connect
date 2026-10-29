const materials = [
 {id:1,name:"Electric Motor 5 HP",code:"DEMO-1001",category:"Electrical",quantity:2,unit:"Nos.",location:"Mysore Terminal",facility:"Terminal",condition:"Serviceable",status:"Available",specs:"5 HP motor; illustrative specification",cost:25000,description:"Illustrative surplus motor. Technical inspection and compatibility checks are required before reuse.",icon:"⚙"},
 {id:2,name:"Centrifugal Water Pump",code:"DEMO-1002",category:"Mechanical",quantity:1,unit:"No.",location:"Bangalore Terminal",facility:"Terminal",condition:"For Inspection",status:"Available",specs:"Industrial water pump; illustrative specification",cost:18000,description:"Sample pump listing for demonstrating cross-location discovery and reuse requests.",icon:"◉"},
 {id:3,name:"Office Chairs",code:"DEMO-1003",category:"Office Equipment",quantity:12,unit:"Nos.",location:"Lucknow Divisional Office",facility:"Office",condition:"Serviceable",status:"Available",specs:"Standard office chair",cost:4500,description:"Sample office furniture listing. Condition and suitability should be checked before transfer.",icon:"▤"},
 {id:4,name:"LED Tube Lights",code:"DEMO-1004",category:"Electrical",quantity:25,unit:"Nos.",location:"Mysore Bottling Plant",facility:"Bottling Plant",condition:"New",status:"Available",specs:"LED tube lights; illustrative specification",cost:350,description:"Illustrative electrical item listing.",icon:"☼"},
 {id:5,name:"GI Pipes 2 Inch",code:"DEMO-1005",category:"Civil",quantity:30,unit:"Metres",location:"Bangalore Bottling Plant",facility:"Bottling Plant",condition:"Serviceable",status:"Available",specs:"2-inch galvanised iron pipes",cost:650,description:"Sample civil material listing. Confirm dimensions and condition before reuse.",icon:"▥"},
 {id:6,name:"Desktop Computers",code:"DEMO-1006",category:"IT Equipment",quantity:4,unit:"Nos.",location:"Lucknow Divisional Office",facility:"Office",condition:"For Inspection",status:"Available",specs:"Desktop computer; configuration to be verified",cost:28000,description:"Illustrative IT equipment. Data sanitisation and IT approval are required before any reuse.",icon:"▣"},
 {id:7,name:"Steel Storage Racks",code:"DEMO-1007",category:"Office Equipment",quantity:3,unit:"Nos.",location:"Mysore Terminal",facility:"Terminal",condition:"Serviceable",status:"Available",specs:"Metal storage rack",cost:7000,description:"Sample storage equipment listing.",icon:"▤"},
 {id:8,name:"Industrial Exhaust Fan",code:"DEMO-1008",category:"Electrical",quantity:2,unit:"Nos.",location:"Bangalore Aviation Station",facility:"Aviation",condition:"Serviceable",status:"Available",specs:"Industrial exhaust fan; specifications to be confirmed",cost:8500,description:"Illustrative aviation-facility listing. Engineering suitability must be verified.",icon:"✥"},
 {id:9,name:"Ball Bearings",code:"DEMO-1009",category:"Mechanical",quantity:20,unit:"Nos.",location:"Lucknow Terminal",facility:"Terminal",condition:"New",status:"Available",specs:"Bearing type and dimensions to be verified",cost:450,description:"Sample spares listing; verify part number and compatibility before reuse.",icon:"◎"},
 {id:10,name:"PVC Pipes 1 Inch",code:"DEMO-1010",category:"Civil",quantity:40,unit:"Metres",location:"Mysore Bottling Plant",facility:"Bottling Plant",condition:"Serviceable",status:"Available",specs:"1-inch PVC pipe",cost:90,description:"Illustrative piping material listing.",icon:"▥"},
 {id:11,name:"UPS 2 kVA",code:"DEMO-1011",category:"Electrical",quantity:2,unit:"Nos.",location:"Bangalore Divisional Office",facility:"Office",condition:"Serviceable",status:"Available",specs:"2 kVA UPS; battery health to be checked",cost:16000,description:"Sample UPS listing. Verify battery health and technical suitability.",icon:"▣"},
 {id:12,name:"Office Tables",code:"DEMO-1012",category:"Office Equipment",quantity:5,unit:"Nos.",location:"Lucknow Divisional Office",facility:"Office",condition:"Serviceable",status:"Available",specs:"Standard office table",cost:6500,description:"Illustrative office furniture listing.",icon:"▤"},
 {id:13,name:"Air Compressor",code:"DEMO-1013",category:"Mechanical",quantity:1,unit:"No.",location:"Bangalore Bottling Plant",facility:"Bottling Plant",condition:"For Inspection",status:"Available",specs:"Industrial compressor; rating to be verified",cost:45000,description:"Sample equipment listing. Inspection and technical clearance are essential.",icon:"⚙"},
 {id:14,name:"Electrical Cables",code:"DEMO-1014",category:"Electrical",quantity:100,unit:"Metres",location:"Mysore Terminal",facility:"Terminal",condition:"Serviceable",status:"Available",specs:"Cable size and rating to be confirmed",cost:120,description:"Illustrative cable listing. Confirm cable specification and condition before reuse.",icon:"ϟ"},
 {id:15,name:"Steel Filing Cabinets",code:"DEMO-1015",category:"Office Equipment",quantity:6,unit:"Nos.",location:"Lucknow Aviation Station",facility:"Aviation",condition:"Serviceable",status:"Available",specs:"Steel filing cabinet",cost:5500,description:"Sample furniture listing for the prototype.",icon:"▤"}
];
const locations = [...new Set(materials.map(m=>m.location))].sort();
const categories = [...new Set(materials.map(m=>m.category))].sort();
let requests = JSON.parse(localStorage.getItem("adisheshanDemoRequests") || "[]");
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function populateFilters(){
  locations.forEach(v=>$("locationFilter").add(new Option(v,v)));
  categories.forEach(v=>$("categoryFilter").add(new Option(v,v)));
  locations.forEach(v=>$("requestingLocation").add(new Option(v,v)));
  materials.forEach(m=>$("requestMaterial").add(new Option(`${m.name} — ${m.location}`,m.id)));
}
function renderStats(){
  $("totalMaterials").textContent=materials.length;
  $("availableMaterials").textContent=materials.filter(m=>m.status==="Available").length;
  $("totalRequests").textContent=requests.length;
  // Savings remain zero until a reuse is verified; request values are not counted as savings.
  const savings=requests.filter(r=>r.verifiedSavings).reduce((sum,r)=>sum+r.verifiedSavings,0);
  $("totalSavings").textContent=money(savings);
}
function renderMaterials(){
  const query=$("searchInput").value.trim().toLowerCase(), loc=$("locationFilter").value, cat=$("categoryFilter").value, status=$("statusFilter").value;
  const filtered=materials.filter(m=>(!query||[m.name,m.code,m.category,m.location,m.specs].join(" ").toLowerCase().includes(query))&&(!loc||m.location===loc)&&(!cat||m.category===cat)&&(!status||m.status===status));
  $("resultCount").textContent=`${filtered.length} material${filtered.length===1?"":"s"}`;
  $("emptyState").classList.toggle("hidden",filtered.length!==0);
  $("materialGrid").innerHTML=filtered.map(m=>`<article class="material-card">
    <div class="card-top"><div class="material-symbol">${m.icon}</div><span class="status ${m.status.toLowerCase()}">${escapeHtml(m.status)}</span></div>
    <h3>${escapeHtml(m.name)}</h3><div class="material-code">${escapeHtml(m.code)}</div>
    <div class="material-meta"><div><div class="meta-label">Available quantity</div><div class="meta-value">${m.quantity} ${escapeHtml(m.unit)}</div></div><div><div class="meta-label">Location</div><div class="meta-value">${escapeHtml(m.location)}</div></div></div>
    <div class="card-bottom"><span class="category">${escapeHtml(m.category)} · ${escapeHtml(m.condition)}</span><button class="text-button" data-details="${m.id}">View details →</button></div>
  </article>`).join("");
  $("materialGrid").querySelectorAll("[data-details]").forEach(btn=>btn.addEventListener("click",()=>showDetails(Number(btn.dataset.details))));
}
function showDetails(id){
  const m=materials.find(x=>x.id===id); if(!m)return;
  $("detailContent").innerHTML=`<h2 id="detailTitle">${escapeHtml(m.name)}</h2><p class="material-code">${escapeHtml(m.code)} · ${escapeHtml(m.category)}</p>
  <div class="detail-grid">
    <div class="detail-cell"><span>Quantity</span><strong>${m.quantity} ${escapeHtml(m.unit)}</strong></div>
    <div class="detail-cell"><span>Location</span><strong>${escapeHtml(m.location)}</strong></div>
    <div class="detail-cell"><span>Condition</span><strong>${escapeHtml(m.condition)}</strong></div>
    <div class="detail-cell"><span>Status</span><strong>${escapeHtml(m.status)}</strong></div>
    <div class="detail-cell"><span>Facility type</span><strong>${escapeHtml(m.facility)}</strong></div>
    <div class="detail-cell"><span>Illustrative new-unit cost</span><strong>${money(m.cost)}</strong></div>
  </div><p class="detail-description"><strong>Specifications:</strong> ${escapeHtml(m.specs)}</p><p class="detail-description">${escapeHtml(m.description)}</p>
  <button class="primary-button" id="interestFromDetail" ${m.status!=="Available"?"disabled":""}>Express interest</button>`;
  $("detailModal").classList.remove("hidden");
  $("interestFromDetail").addEventListener("click",()=>{closeModal("detailModal");$("requestMaterial").value=String(m.id);openRequest();});
}
function openRequest(){
  $("requestForm").reset(); $("requestMaterial").value=String(materials.find(m=>m.status==="Available")?.id||materials[0].id);
  $("formMessage").classList.add("hidden"); $("requestModal").classList.remove("hidden");
}
function closeModal(id){$(id).classList.add("hidden");}
$("searchInput").addEventListener("input",renderMaterials);
["locationFilter","categoryFilter","statusFilter"].forEach(id=>$(id).addEventListener("change",renderMaterials));
$("openRequestTop").addEventListener("click",openRequest);
document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>closeModal(btn.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(backdrop=>backdrop.addEventListener("click",e=>{if(e.target===backdrop)backdrop.classList.add("hidden");}));
$("requestForm").addEventListener("submit",e=>{
  e.preventDefault();
  const material=materials.find(m=>m.id===Number($("requestMaterial").value));
  const qty=Number($("requestQuantity").value);
  if(!material||qty<1||qty>material.quantity){$("formMessage").textContent="Enter a quantity between 1 and the available quantity."; $("formMessage").classList.remove("hidden");return;}
  const req={id:Date.now(),materialId:material.id,materialName:material.name,requestingLocation:$("requestingLocation").value,quantity:qty,purpose:$("requestPurpose").value.trim(),email:$("requestEmail").value.trim(),status:"Submitted",verifiedSavings:0};
  requests.push(req);localStorage.setItem("adisheshanDemoRequests",JSON.stringify(requests));renderStats();
  $("formMessage").textContent=`Demo request submitted successfully (Request #${String(req.id).slice(-6)}). It is saved only in this browser and has not been sent to a custodian.`;
  $("formMessage").classList.remove("hidden");
  $("requestForm").querySelector("button[type=submit]").disabled=true;
  setTimeout(()=>{$("requestForm").querySelector("button[type=submit]").disabled=false;closeModal("requestModal");},2400);
});
populateFilters();renderMaterials();renderStats();
