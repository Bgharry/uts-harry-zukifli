
/* navigation & lazy init */
const buttons = document.querySelectorAll('.menu button');
const panes = document.querySelectorAll('.pane');
let initialized = {home:true,line:false,bar:false,pie:false,hist:false,scatter:false,map:false};

buttons.forEach(b => b.addEventListener('click', ()=>{
  buttons.forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  const target = b.getAttribute('data-target');
  panes.forEach(p=>p.classList.remove('active'));
  document.getElementById(target).classList.add('active');
  if(!initialized[target]){
    initialized[target]=true;
    if(target==='line') initLine();
    if(target==='bar') initBar();
    if(target==='pie') initPie();
    if(target==='hist') initHist();
    if(target==='scatter') initScatter();
    if(target==='map') initMap();
  }
}));

const yearBar = document.getElementById('yearBar');
DATA.years.forEach((y,i)=>{ const o=document.createElement('option'); o.value=i; o.text=y; yearBar.appendChild(o); });
yearBar.value = DATA.years.length-1;

/* helpers */
function totalsPerYearArray(){ return DATA.years.map((y, idx)=>{ let s=0; for(const p of Object.keys(DATA.platforms)) s+=DATA.platforms[p][idx]; return s; }); }
function makeBins(data, binCount=6){ const min=Math.min(...data), max=Math.max(...data); const step=(max-min)/binCount; const bins=Array(binCount).fill(0); const labels=[]; for(let i=0;i<binCount;i++) labels.push(Math.round(min + i*step) + '-' + Math.round(min + (i+1)*step)); data.forEach(v=>{ const idx = Math.min(binCount-1, Math.floor((v-min)/step)); bins[idx]++; }); return {labels:labels, counts:bins}; }

/* init functions */
function initLine(){
  const ctx=document.getElementById('lineChart').getContext('2d');
  const totals = DATA.years.map((y,idx)=>{
    let sum=0; for(const p of Object.keys(DATA.platforms)) sum+=DATA.platforms[p][idx]; return sum;
  });
  new Chart(ctx,{type:'line',data:{labels:DATA.years,datasets:[{label:'Total Pengguna (juta)',data:totals,borderColor:'#0b63c6',backgroundColor:'rgba(11,99,198,0.08)',fill:true,tension:0.3}]},options:{responsive:true,plugins:{title:{display:true,text:'Pertumbuhan Total Pengguna (2019–2024)'}}}});
}

let barChart,pieChart,histChart,scatterChart;
function initBar(){ const d=dataForYear(DATA.years.length-1); const ctx=document.getElementById('barChart').getContext('2d'); barChart=new Chart(ctx,{type:'bar',data:{labels:d.labels,datasets:[{label:'Juta Pengguna',data:d.values,backgroundColor:['#0b63c6','#2b9d44','#f1a51b','#e04b3c','#6a5acd','#0b63c6','#2b9d44','#f1a51b','#e04b3c']}]},options:{responsive:true,plugins:{title:{display:true,text:'Jumlah Pengguna per Negara (2024)'}}}}); yearBar.addEventListener('change',()=>{ updateBarAndPie(parseInt(yearBar.value)); }); }
function initPie(){ const d=dataForYear(DATA.years.length-1); const ctx=document.getElementById('pieChart').getContext('2d'); pieChart=new Chart(ctx,{type:'pie',data:{labels:d.labels,datasets:[{data:d.values,backgroundColor:['#0b63c6','#2b9d44','#f1a51b','#e04b3c','#6a5acd','#0b63c6','#2b9d44','#f1a51b','#e04b3c']}]},options:{responsive:true,plugins:{title:{display:true,text:'Proporsi Pengguna per Negara (2024)'}}}}); }
function initHist(){ const totals=DATA.years.map((y,idx)=>{ let sum=0; for(const p of Object.keys(DATA.platforms)) sum+=DATA.platforms[p][idx]; return sum; }); const h=makeBins(totals,6); const ctx=document.getElementById('histChart').getContext('2d'); histChart=new Chart(ctx,{type:'bar',data:{labels:h.labels,datasets:[{label:'Frekuensi',data:h.counts,backgroundColor:'#0b63c6'}]},options:{responsive:true,plugins:{title:{display:true,text:'Histogram: Distribusi Total Pengguna (2019–2024)'}}}}); }
function initScatter(){ const data=Object.keys(DATA.asia).map((c)=>{ const users=DATA.asia[c][DATA.asia[c].length-1]; return {x:DATA.gdp_per_capita[c]||0,y:users,label:c}; }); const ctx=document.getElementById('scatterChart').getContext('2d'); scatterChart=new Chart(ctx,{type:'scatter',data:{datasets:[{label:'Negara',data:data,backgroundColor:'#2b9d44'}]},options:{responsive:true,plugins:{title:{display:true,text:'Scatter: GDP per Kapita vs Jumlah Pengguna (2024)'}},scales:{x:{title:{display:true,text:'GDP per Kapita (USD)'}},y:{title:{display:true,text:'Jumlah Pengguna (juta)'}}}}); }

function initMap(){ google.charts.load('current',{'packages':['geochart']}); google.charts.setOnLoadCallback(()=>{ const data=google.visualization.arrayToDataTable(prepareAsiaData(DATA.years.length-1)); const options={region:'002',displayMode:'regions',colorAxis:{colors:['#e6f7ff','#a9d9ff','#0b63c6']},resolution:'countries',backgroundColor:'#ffffff00',datalessRegionColor:'#f3f6fb'}; const chart=new google.visualization.GeoChart(document.getElementById('asia_map')); chart.draw(data,options); }); }

/* helpers */
function dataForYear(idx){ const keys=Object.keys(DATA.asia); return {labels:keys, values:keys.map(k=>DATA.asia[k][idx])}; }
function prepareAsiaData(yearIdx){ const rows=[['Country','Users (juta)']]; for(const country of Object.keys(DATA.asia)){ rows.push([country, DATA.asia[country][yearIdx]]); } return rows; }
function updateBarAndPie(idx){ const d=dataForYear(idx); if(barChart){ barChart.data.labels=d.labels; barChart.data.datasets[0].data=d.values; barChart.update(); } if(pieChart){ pieChart.data.labels=d.labels; pieChart.data.datasets[0].data=d.values; pieChart.update(); } }

document.addEventListener('DOMContentLoaded', ()=>{ document.querySelector('.menu button.active').click(); });
