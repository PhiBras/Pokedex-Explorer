const API = "https://pokeapi.co/api/v2";
const SPRITE = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const typeColors = {normal:"#a8a77a",fire:"#ee8130",water:"#6390f0",electric:"#f7d02c",grass:"#7ac74c",ice:"#96d9d6",fighting:"#c22e28",poison:"#a33ea1",ground:"#e2bf65",flying:"#a98ff3",psychic:"#f95587",bug:"#a6b91a",rock:"#b6a136",ghost:"#735797",dragon:"#6f35fc",dark:"#705746",steel:"#b7b7ce",fairy:"#d685ad"};
const typeNames = {normal:"Normal",fire:"Fogo",water:"Água",electric:"Elétrico",grass:"Planta",ice:"Gelo",fighting:"Lutador",poison:"Veneno",ground:"Terra",flying:"Voador",psychic:"Psíquico",bug:"Inseto",rock:"Pedra",ghost:"Fantasma",dragon:"Dragão",dark:"Sombrio",steel:"Aço",fairy:"Fada"};
const statNames = {hp:"HP",attack:"Ataque",defense:"Defesa","special-attack":"Atq. especial","special-defense":"Def. especial",speed:"Velocidade"};
const statusNames = {burn:"QUEIMADO",poison:"ENVENENADO",paralysis:"PARALISADO",sleep:"DORMINDO",freeze:"CONGELADO"};
const statusLabels = {burn:"Queimadura",poison:"Envenenamento",paralysis:"Paralisia",sleep:"Sono",freeze:"Congelamento"};
const statusMoveNames = new Set(["will-o-wisp","fire-blast","flamethrower","ember","toxic","poison-powder","poison-gas","sludge-bomb","thunder-wave","thunderbolt","body-slam","thunder","hypnosis","sleep-powder","spore","sing","yawn","ice-beam","blizzard","ice-punch","freeze-dry"]);
const idleByType = {
  fire:["ember","hover","ready"],water:["sway","float","breathe"],electric:["spark","ready","hover"],
  grass:["sway","breathe","hover"],ice:["float","focus"],fighting:["ready","heavy","spark"],
  poison:["float","focus"],ground:["heavy","ready"],flying:["hover","float","sway"],
  psychic:["focus","float","hover"],bug:["hover","spark"],rock:["heavy","ready"],
  ghost:["float","focus"],dragon:["heavy","hover","ember"],dark:["float","ready"],
  steel:["heavy","ready"],fairy:["hover","float","focus"]
};
const speciesIdleOverrides = {6:"ember",9:"heavy",25:"spark",94:"float",130:"heavy",133:"ready",150:"focus"};
const spriteCollabRevision = "0babe7c2aeb7c494e420fca1964af8db78015205";
const spriteCollabProfiles = {
  6:{
    actions:["Charge","Double","Faint","Hop","Hurt","Rotate","Shoot","Sleep","Strike","Swing"],
    artists:"Emboarger",license:"PMDCollab_1",licenseFile:"LICENSE.PMDCollab_1.md"
  },
  448:{
    actions:["Attack","Charge","Double","Hop","Hurt","Idle","QuickStrike","RearUp","Rotate","Rumble","Shoot","Sleep","Swing"],
    artists:"Emmuffin, Soulja",license:"CC BY-NC 4.0",licenseFile:"LICENSE.CC_BY-NC_4.md"
  },
  658:{
    actions:["Attack","Charge","Double","Hop","Hurt","Idle","QuickStrike","RearUp","Rotate","Shoot","Sleep","Swing"],
    artists:"JHONY_REX, ◥θ┴θ◤",license:"CC BY-NC 4.0",licenseFile:"LICENSE.CC_BY-NC_4.md"
  }
};
const spriteAnimationDataCache = new Map();
const spriteAnimationImageCache = new Map();
const idleVariants = ["breathe","sway","hover","ready","float","focus"];
const typeChart = {
  normal:{rock:.5,ghost:0,steel:.5},fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},
  water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},
  grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},
  ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},
  fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},
  poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},
  ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},
  flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},
  psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},
  bug:{fire:.5,grass:2,fighting:.5,poison:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},
  rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},
  ghost:{normal:0,psychic:2,ghost:2,dark:.5},
  dragon:{dragon:2,steel:.5,fairy:0},dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},
  steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},
  fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5}
};
const state = {
  all:[],visible:[],page:0,pageSize:20,filter:"",query:"",sort:"id",cache:new Map(),moveCache:new Map(),typeCache:new Map(),dexRequest:0,detailRequest:0,
  battle:{fighters:[null,null],moves:[[],[]],pp:[new Map(),new Map()],hp:[0,0],maxHp:[0,0],statuses:[null,null],turn:0,over:false,busy:false,serial:0,logs:[],bodyAnimationTokens:[0,0]}
};
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const arenaContainer = $("#battlefield");
const animator = new window.BattleAnimator(arenaContainer);

async function api(path){
  const response=await fetch(`${API}${path}`);
  if(!response.ok)throw new Error(`PokéAPI respondeu com HTTP ${response.status}.`);
  return response.json();
}
const title = value => value.split("-").map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(" ");
const badge = type => `<span class="type-badge" style="background:${typeColors[type]||"#667085"}">${typeNames[type]||title(type)}</span>`;
const imageOf = pokemon => pokemon.sprites?.other?.["official-artwork"]?.front_default||pokemon.sprites?.front_default||SPRITE(pokemon.id);
const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
const suffixFor = index => index===0?"One":"Two";
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const animationWait = ms => wait(reducedMotion()?35:ms);
function motionProfileFor(pokemon){
  if(speciesIdleOverrides[pokemon.id])return speciesIdleOverrides[pokemon.id];
  const variants=idleByType[pokemon.types[0]?.type.name];
  return variants?variants[pokemon.id%variants.length]:idleVariants[pokemon.id%idleVariants.length];
}
function battleSpriteFor(pokemon,index){
  if(reducedMotion())return {src:imageOf(pokemon),animated:false};
  const animated=pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated;
  const sprite=index===0?animated?.back_default:animated?.front_default;
  const alternate=index===0?animated?.front_default:animated?.back_default;
  if(sprite)return {src:sprite,animated:true};
  if(alternate)return {src:alternate,animated:true};
  return {src:imageOf(pokemon),animated:false};
}
function spriteCollabDirectory(pokemonId){
  return `https://github.com/PMDCollab/SpriteCollab/tree/${spriteCollabRevision}/sprite/${String(pokemonId).padStart(4,"0")}`;
}
function spriteCollabRawFile(pokemonId,fileName){
  return `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/${spriteCollabRevision}/sprite/${String(pokemonId).padStart(4,"0")}/${fileName}`;
}
function renderSpriteCredit(index,pokemon,message=""){
  const element=$("#spriteCredit"+suffixFor(index)),profile=spriteCollabProfiles[pokemon.id];
  element.replaceChildren();
  if(profile){
    const source=document.createElement("a");source.href=spriteCollabDirectory(pokemon.id);source.target="_blank";source.rel="noreferrer";source.textContent=`SpriteCollab · ${profile.artists}`;
    const license=document.createElement("a");license.href=`https://github.com/PMDCollab/SpriteCollab/blob/${spriteCollabRevision}/license_history/${profile.licenseFile}`;license.target="_blank";license.rel="noreferrer";license.textContent=profile.license;
    element.append(source,document.createTextNode(" · "),license);
  }else element.textContent="Sprites de ação licenciados indisponíveis para esta espécie.";
  if(message)element.append(document.createTextNode(` · ${message}`));
}
async function loadSpriteAnimationData(pokemonId){
  if(!spriteAnimationDataCache.has(pokemonId)){
    const request=fetch(spriteCollabRawFile(pokemonId,"AnimData.xml")).then(async response=>{
      if(!response.ok)throw new Error(`SpriteCollab AnimData.xml respondeu com HTTP ${response.status}.`);
      const xml=new DOMParser().parseFromString(await response.text(),"application/xml");
      if(xml.querySelector("parsererror"))throw new Error("O AnimData.xml de SpriteCollab é inválido.");
      const animations=new Map();
      xml.querySelectorAll("Anims > Anim").forEach(element=>{
        const read=name=>element.querySelector(name)?.textContent?.trim()||"";
        const value={name:read("Name"),copyOf:read("CopyOf"),frameWidth:Number(read("FrameWidth")),frameHeight:Number(read("FrameHeight")),rushFrame:read("RushFrame")===""?null:Number(read("RushFrame")),hitFrame:read("HitFrame")===""?null:Number(read("HitFrame")),returnFrame:read("ReturnFrame")===""?null:Number(read("ReturnFrame")),durations:[...element.querySelectorAll("Durations > Duration")].map(duration=>Number(duration.textContent))};
        if(value.name)animations.set(value.name,value);
      });
      if(!animations.size)throw new Error("O AnimData.xml não contém animações.");
      return animations;
    });
    spriteAnimationDataCache.set(pokemonId,request);
  }
  try{return await spriteAnimationDataCache.get(pokemonId)}
  catch(error){spriteAnimationDataCache.delete(pokemonId);throw error}
}
function resolveSpriteAnimation(animations,name,visited=new Set()){
  if(!name||visited.has(name))return null;
  visited.add(name);
  const animation=animations.get(name);
  if(!animation)return null;
  if(animation.copyOf)return resolveSpriteAnimation(animations,animation.copyOf,visited);
  if(!animation.frameWidth||!animation.frameHeight||!animation.durations.length)return null;
  return animation;
}
async function loadSpriteAnimationImage(pokemonId,actionName){
  const url=spriteCollabRawFile(pokemonId,`${actionName}-Anim.png`);
  if(!spriteAnimationImageCache.has(url)){
    const request=new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error(`Não foi possível carregar ${actionName}-Anim.png do SpriteCollab.`));
      image.src=url;
    });
    spriteAnimationImageCache.set(url,request);
  }
  try{return await spriteAnimationImageCache.get(url)}
  catch(error){spriteAnimationImageCache.delete(url);throw error}
}
function spriteCanvasFor(index){
  return $("#bodyCanvas"+suffixFor(index));
}
function restoreBattleSprite(index){
  state.battle.bodyAnimationTokens[index]++;
  const canvas=spriteCanvasFor(index);
  canvas.hidden=true;canvas.dataset.action="";canvas.dataset.frame="";
  $("#sprite"+suffixFor(index)).hidden=false;
}
async function playSpriteCollabAnimation(index,actionName,{loop=false,serial=state.battle.serial,onFrame=null}={}){
  const pokemon=state.battle.fighters[index],profile=spriteCollabProfiles[pokemon?.id];
  if(!profile||!profile.actions.includes(actionName)||reducedMotion()||(actionName==="Idle"&&state.battle.over))return false;
  let animations,animation,image;
  try{
    animations=await loadSpriteAnimationData(pokemon.id);
    animation=resolveSpriteAnimation(animations,actionName);
    if(!animation)return false;
    image=await loadSpriteAnimationImage(pokemon.id,animation.name);
  }catch(error){
    if(serial===state.battle.serial){
      console.error(`Falha ao carregar a animação ${actionName} de ${pokemon.name}:`,error);
      renderSpriteCredit(index,pokemon,"animação indisponível; usando fallback");
    }
    return false;
  }
  if(serial!==state.battle.serial||(actionName==="Idle"&&state.battle.over))return false;
  const direction=index===0?2:6,columns=Math.floor(image.naturalWidth/animation.frameWidth),rows=Math.floor(image.naturalHeight/animation.frameHeight);
  if(columns<animation.durations.length||direction>=rows){
    const error=new Error(`A spritesheet ${animation.name}-Anim.png não corresponde aos frames do AnimData.xml.`);
    console.error(error);renderSpriteCredit(index,pokemon,"frames incompatíveis; usando fallback");return false;
  }
  const canvas=spriteCanvasFor(index),context=canvas.getContext("2d"),fallback=$("#sprite"+suffixFor(index));
  const token=++state.battle.bodyAnimationTokens[index];
  canvas.width=animation.frameWidth;canvas.height=animation.frameHeight;canvas.hidden=false;fallback.hidden=true;
  canvas.dataset.action=animation.name;canvas.dataset.frame="0";
  context.imageSmoothingEnabled=false;
  const isCurrent=()=>serial===state.battle.serial&&token===state.battle.bodyAnimationTokens[index]&&!(actionName==="Idle"&&state.battle.over);
  do{
    for(let frame=0;frame<animation.durations.length;frame++){
      if(!isCurrent())return false;
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(image,frame*animation.frameWidth,direction*animation.frameHeight,animation.frameWidth,animation.frameHeight,0,0,animation.frameWidth,animation.frameHeight);
      canvas.dataset.frame=String(frame);
      if(onFrame)onFrame({frame,animation});
      if(!loop&&frame===animation.durations.length-1)break;
      await animationWait(Math.max(16,animation.durations[frame]*(1000/30)));
    }
  }while(loop&&isCurrent());
  return isCurrent();
}
async function startSpriteCollabIdle(index,serial){
  const pokemon=state.battle.fighters[index],profile=spriteCollabProfiles[pokemon?.id];
  if(profile?.actions.includes("Idle"))await playSpriteCollabAnimation(index,"Idle",{loop:true,serial});
}

async function getPokemon(id){
  const key=String(id);
  if(!state.cache.has(key))state.cache.set(key,api(`/pokemon/${key}`));
  try{return await state.cache.get(key)}catch(error){state.cache.delete(key);throw error}
}
async function getMove(name){
  if(!state.moveCache.has(name))state.moveCache.set(name,api(`/move/${name}`));
  try{return await state.moveCache.get(name)}catch(error){state.moveCache.delete(name);throw error}
}
function showToast(message){
  const element=$("#toast");element.textContent=message;element.classList.add("show");
  clearTimeout(showToast.timeout);showToast.timeout=setTimeout(()=>element.classList.remove("show"),2600);
}
function setPage(page){
  $$(".nav-link").forEach(button=>button.classList.toggle("active",button.dataset.page===page));
  $("#dexPage").classList.toggle("active",page==="dex");$("#arenaPage").classList.toggle("active",page==="arena");
  if(page==="arena"&&!state.battle.fighters[0])setupBattle();
}
$$(".nav-link").forEach(button=>button.addEventListener("click",()=>setPage(button.dataset.page)));

async function initDex(){
  try{
    const data=await api("/pokemon?limit=1025&offset=0");
    state.all=data.results.map((pokemon,index)=>({name:pokemon.name,id:index+1}));
    populateTypes();populateFighters();renderDex();
  }catch(error){
    $("#pokemonGrid").innerHTML='<div class="loading-state error-state">Não foi possível carregar a Pokédex. Verifique a conexão e tente novamente.</div>';
    $("#resultCount").textContent="ERRO DE CONEXÃO";console.error("Falha ao carregar a Pokédex:",error);
  }
}
function populateTypes(){
  Object.keys(typeNames).forEach(type=>{
    const option=document.createElement("option");option.value=type;option.textContent=typeNames[type];$("#typeFilter").append(option);
  });
}
function populateFighters(){
  if(!state.all.length)return;
  const options=state.all.map(pokemon=>`<option value="${pokemon.id}">${title(pokemon.name)}</option>`).join("");
  $("#fighterOne").innerHTML=options;$("#fighterTwo").innerHTML=options;$("#fighterOne").value="6";$("#fighterTwo").value="9";
}
function filteredList(){
  let list=state.all.filter(pokemon=>!state.query||pokemon.name.includes(state.query)||String(pokemon.id)===state.query);
  if(state.sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
  else if(state.sort==="id-desc")list.sort((a,b)=>b.id-a.id);
  else list.sort((a,b)=>a.id-b.id);
  return list;
}
async function renderDex(){
  const request=++state.dexRequest,grid=$("#pokemonGrid");
  grid.innerHTML='<div class="loading-state"><span class="loader"></span> Carregando Pokémon...</div>';
  let list=filteredList();
  if(state.filter){
    try{
      if(!state.typeCache.has(state.filter))state.typeCache.set(state.filter,api(`/type/${state.filter}`));
      const typeData=await state.typeCache.get(state.filter),names=new Set(typeData.pokemon.map(entry=>entry.pokemon.name));
      list=list.filter(pokemon=>names.has(pokemon.name));
    }catch(error){
      state.typeCache.delete(state.filter);if(request!==state.dexRequest)return;
      grid.innerHTML='<div class="loading-state error-state">Não foi possível aplicar o filtro de tipo. Tente novamente.</div>';
      $("#resultCount").textContent="ERRO NO FILTRO";console.error("Falha ao carregar o filtro de tipo:",error);return;
    }
  }
  if(request!==state.dexRequest)return;
  state.visible=list;const pages=Math.max(1,Math.ceil(list.length/state.pageSize));state.page=Math.min(state.page,pages-1);
  const start=state.page*state.pageSize,slice=list.slice(start,start+state.pageSize);
  $("#resultCount").textContent=`${list.length.toLocaleString("pt-BR")} REGISTROS ENCONTRADOS`;
  $("#pageInfo").textContent=`EXIBINDO ${list.length?start+1:0}–${Math.min(start+state.pageSize,list.length)} DE ${list.length}`;
  $("#prevPage").disabled=state.page===0;$("#nextPage").disabled=state.page>=pages-1;
  if(!slice.length){grid.innerHTML='<div class="loading-state">Nenhum Pokémon encontrado. Tente outro termo ou filtro.</div>';return}
  const details=await Promise.all(slice.map(async pokemon=>{
    try{const data=await getPokemon(pokemon.id);return {...pokemon,types:data.types.map(entry=>entry.type.name)}}
    catch(error){console.error(`Falha ao carregar ${pokemon.name}:`,error);return {...pokemon,types:[],unavailable:true}}
  }));
  if(request!==state.dexRequest)return;
  grid.innerHTML=details.map(pokemon=>`<article class="pokemon-card${pokemon.unavailable?" unavailable":""}" data-id="${pokemon.id}" style="--type-color:${typeColors[pokemon.types[0]]||"#8992a8"}" ${pokemon.unavailable?'aria-disabled="true"':""}><div class="card-top"><span class="card-number">Nº ${String(pokemon.id).padStart(3,"0")}</span><span class="card-open">↗</span></div><h3>${title(pokemon.name)}</h3><div class="type-list">${pokemon.types.map(badge).join("")}</div><img loading="lazy" src="${SPRITE(pokemon.id)}" alt="${title(pokemon.name)}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'"><span class="card-bottom">${pokemon.unavailable?"DADOS INDISPONÍVEIS":"DOSSIÊ POKÉMON"}</span></article>`).join("");
  $$(".pokemon-card:not(.unavailable)").forEach(card=>card.addEventListener("click",()=>openDetails(card.dataset.id)));
}
$("#searchInput").addEventListener("input",event=>{state.query=event.target.value.trim().toLowerCase().replace(/^#/,"");state.page=0;renderDex()});
$("#typeFilter").addEventListener("change",event=>{state.filter=event.target.value;state.page=0;renderDex()});
$("#sortFilter").addEventListener("change",event=>{state.sort=event.target.value;state.page=0;renderDex()});
$("#clearFilters").addEventListener("click",()=>{$("#searchInput").value="";$("#typeFilter").value="";$("#sortFilter").value="id";state.query="";state.filter="";state.sort="id";state.page=0;renderDex()});
$("#prevPage").addEventListener("click",()=>{state.page--;renderDex();$("#pokemonGrid").scrollIntoView({behavior:"smooth",block:"start"})});
$("#nextPage").addEventListener("click",()=>{state.page++;renderDex();$("#pokemonGrid").scrollIntoView({behavior:"smooth",block:"start"})});

async function openDetails(id){
  const modal=$("#detailModal"),content=$("#detailContent"),request=++state.detailRequest;
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");content.innerHTML='<div class="loading-state"><span class="loader"></span> Abrindo dossiê...</div>';
  try{
    const pokemon=await getPokemon(String(id));
    if(request!==state.detailRequest||!modal.classList.contains("open"))return;
    const stats=pokemon.stats.map(stat=>`<div class="stat-row"><span>${statNames[stat.stat.name]||title(stat.stat.name)}</span><b>${stat.base_stat}</b><div class="stat-track"><i style="width:${Math.min(100,stat.base_stat/180*100)}%"></i></div></div>`).join("");
    content.innerHTML=`<div class="detail-layout"><div class="detail-visual"><img src="${imageOf(pokemon)}" alt="${title(pokemon.name)}"></div><div class="detail-info"><span class="detail-id">Nº ${String(pokemon.id).padStart(3,"0")} / DOSSIÊ</span><h2>${title(pokemon.name)}</h2><div class="type-list">${pokemon.types.map(entry=>badge(entry.type.name)).join("")}</div><div class="detail-facts"><div>ALTURA<strong>${(pokemon.height/10).toFixed(1)} m</strong></div><div>PESO<strong>${(pokemon.weight/10).toFixed(1)} kg</strong></div><div>EXP. BASE<strong>${pokemon.base_experience??"—"}</strong></div></div><div class="stats-list">${stats}</div><div class="ability-list"><b>HABILIDADES:</b> ${pokemon.abilities.map(entry=>title(entry.ability.name)+(entry.is_hidden?" (oculta)":"")).join(", ")}</div></div></div>`;
  }catch(error){
    if(request!==state.detailRequest)return;
    content.innerHTML='<div class="loading-state error-state">Não foi possível carregar os detalhes. Feche e tente novamente.</div>';
    console.error("Falha ao carregar detalhes do Pokémon:",error);
  }
}
function closeModal(){state.detailRequest++;const modal=$("#detailModal");modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
$$("[data-close-modal]").forEach(element=>element.addEventListener("click",closeModal));
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeModal()});

$("#fighterOne").addEventListener("change",setupBattle);$("#fighterTwo").addEventListener("change",setupBattle);
$("#restartBattle").addEventListener("click",setupBattle);
async function setupBattle(){
  const battle=state.battle,serial=++battle.serial;animator.cancel();
  battle.busy=true;$("#moveButtons").innerHTML='<div class="loading-state"><span class="loader"></span> Preparando a batalha...</div>';
  try{
    const ids=[$("#fighterOne").value,$("#fighterTwo").value];
    if(ids[0]===ids[1]){
      battle.busy=false;
      if(battle.fighters[0]){$("#fighterOne").value=String(battle.fighters[0].id);$("#fighterTwo").value=String(battle.fighters[1].id);renderMoves()}
      else{$("#fighterOne").value="6";$("#fighterTwo").value="9"}
      showToast("Escolha dois Pokémon diferentes.");return;
    }
    const fighters=await Promise.all(ids.map(getPokemon));
    if(serial!==battle.serial)return;
    battle.fighters=fighters;battle.maxHp=fighters.map(pokemon=>Math.max(50,pokemon.stats.find(stat=>stat.stat.name==="hp").base_stat*2+50));
    battle.hp=[...battle.maxHp];battle.statuses=[null,null];battle.turn=0;battle.over=false;battle.busy=false;battle.logs=[];battle.pp=[new Map(),new Map()];
    renderFighters();addLog(`A batalha começou: <strong>${title(fighters[0].name)}</strong> vs <strong>${title(fighters[1].name)}</strong>.`);
    await Promise.all([loadFighterMoves(0,serial),loadFighterMoves(1,serial)]);
    if(serial===battle.serial)renderMoves();
  }catch(error){
    if(serial!==battle.serial)return;
    battle.busy=false;$("#moveButtons").innerHTML='<div class="loading-state error-state">Não foi possível preparar a batalha. Verifique a conexão e tente novamente.</div>';
    console.error("Falha ao preparar a batalha:",error);
  }
}
async function loadFighterMoves(index,serial){
  const pokemon=state.battle.fighters[index];
  const names=pokemon.moves.map(entry=>entry.move.name);
  const selectedNames=[...names.slice(0,18),...names.filter(name=>statusMoveNames.has(name)).slice(0,8)];
  const results=await Promise.all([...new Set(selectedNames)].map(async name=>{try{return await getMove(name)}catch(error){console.error(`Falha ao carregar o movimento ${name}:`,error);return null}}));
  if(serial!==state.battle.serial)return;
  const candidates=results.filter(move=>move&&move.pp>0&&(move.damage_class.name!=="status"||statusNames[move.meta?.ailment?.name]||move.meta?.healing));
  const unique=[...new Map(candidates.map(move=>[move.name,move])).values()];
  unique.sort((a,b)=>moveScore(b,index)-moveScore(a,index));
  const hasStatusEffect=move=>Boolean(statusNames[move.meta?.ailment?.name]);
  const ailmentMove=unique.find(move=>move.damage_class.name==="status"&&hasStatusEffect(move)&&move.meta.category?.name==="ailment")||unique.find(move=>hasStatusEffect(move)&&(move.meta.ailment_chance??0)>0);
  const selected=unique.slice(0,4);
  if(ailmentMove&&!selected.includes(ailmentMove))selected.splice(3,1,ailmentMove);
  state.battle.moves[index]=selected;
  state.battle.moves[index].forEach(move=>state.battle.pp[index].set(move.name,move.pp));
}
function moveScore(move,attacker){
  const battle=state.battle;
  if(move.meta?.healing){
    const missingHp=Math.max(0,battle.maxHp[attacker]-battle.hp[attacker]);
    const healAmount=Math.floor(battle.maxHp[attacker]*move.meta.healing/100);
    return Math.min(missingHp,healAmount)*2;
  }
  if(move.damage_class.name==="status"){
    return statusNames[move.meta?.ailment?.name]&&!battle.statuses[1-attacker]?45:0;
  }
  const accuracy=(move.accuracy??100)/100;
  const stab=battle.fighters[attacker].types.some(type=>type.type.name===move.type.name)?1.5:1;
  return (move.power||0)*accuracy*effectiveness(move.type.name,battle.fighters[1-attacker])*stab;
}
function renderFighters(){
  const battle=state.battle;animator.cancel();
  [0,1].forEach(index=>{
    const suffix=suffixFor(index),pokemon=battle.fighters[index],stage=$("#stage"+suffix),image=$("#sprite"+suffix),canvas=$("#bodyCanvas"+suffix),profile=spriteCollabProfiles[pokemon.id];
    const sprite=battleSpriteFor(pokemon,index),motion=motionProfileFor(pokemon);
    canvas.hidden=true;image.hidden=false;canvas.dataset.action="";canvas.dataset.frame="";
    $("#name"+suffix).textContent=title(pokemon.name);image.src=sprite.src;image.alt=title(pokemon.name);
    image.className=`sprite-image${sprite.animated?" is-animated-sprite":""}`;
    image.onerror=()=>{image.onerror=null;image.classList.remove("is-animated-sprite");image.src=imageOf(pokemon)};
    stage.className=`sprite-stage${profile?" has-action-sprites":` motion-${motion}`} facing-${index===0?"right":"left"}${sprite.animated?" has-animated-sprite":""}`;
    $("#types"+suffix).innerHTML=pokemon.types.map(type=>badge(type.type.name)).join("");
    renderSpriteCredit(index,pokemon);
    updateHealth(index);renderStatus(index);
    const fighter=$("#battleFighter"+suffix);
    fighter.classList.remove("acting","fainted","victorious");
    stage.classList.remove("fainted","victorious");
    const serial=battle.serial;
    void stage.offsetWidth;stage.classList.add("entering");
    stage.addEventListener("animationend",event=>{
      if(event.target===stage&&serial===state.battle.serial)stage.classList.remove("entering");
    },{once:true});
    void startSpriteCollabIdle(index,serial);
  });
}
function updateHealth(index){
  const battle=state.battle,suffix=index===0?"One":"Two",percent=Math.max(0,battle.hp[index]/battle.maxHp[index]*100);
  $("#hpText"+suffix).textContent=`${Math.max(0,Math.ceil(battle.hp[index]))} / ${battle.maxHp[index]}`;
  const bar=$("#health"+suffix);bar.style.width=percent+"%";bar.classList.toggle("low",percent<30);bar.setAttribute("aria-valuenow",String(Math.max(0,Math.ceil(battle.hp[index]))));
}
function renderStatus(index){
  const suffix=suffixFor(index),status=state.battle.statuses[index],element=$("#status"+suffix),stage=$("#stage"+suffix);
  element.textContent=status?`${statusNames[status.name]}${status.name==="sleep"?` · ${status.turns}`:""}`:"";
  element.className=`status-indicator${status?` status-${status.name}`:""}`;
  ["burn","poison","paralysis","sleep","freeze"].forEach(name=>stage.classList.remove(`condition-${name}`));
  if(status)stage.classList.add(`condition-${status.name}`);
}
async function renderMoves(){
  const battle=state.battle,container=$("#moveButtons");container.innerHTML="";
  if(battle.over){container.innerHTML='<div class="loading-state">COMBATE FINALIZADO — reinicie para jogar novamente.</div>';return}
  if(battle.busy){container.innerHTML='<div class="loading-state"><span class="loader"></span> Ação em andamento. Aguarde o fim do turno...</div>';$("#turnIndicator").textContent="AÇÃO EM ANDAMENTO";return}
  const moves=battle.moves[0];
  if(!moves.length){container.innerHTML='<div class="loading-state error-state">Nenhum movimento pôde ser carregado. Reinicie para tentar novamente.</div>';return}
  const available=moves.filter(move=>(battle.pp[0].get(move.name)||0)>0);
  if(!available.length){
    container.innerHTML='<button class="move-button" data-struggle><span><strong>Struggle</strong><small>Normal · Físico · Movimento de emergência</small></span><span class="move-power">50</span></button>';
    container.querySelector("[data-struggle]").addEventListener("click",()=>playerAction(struggleMove()));return;
  }
  container.innerHTML=moves.map((move,index)=>{
    const pp=battle.pp[0].get(move.name)||0,kind=move.damage_class.name==="physical"?"Físico":move.damage_class.name==="special"?"Especial":"Status";
    return `<button class="move-button" data-move="${index}" ${pp<=0?"disabled":""}><span><strong>${title(move.name)}</strong><small>${typeNames[move.type.name]||title(move.type.name)} · ${kind} · PP ${pp}/${move.pp}</small></span><span class="move-power">${move.power??"—"}</span></button>`;
  }).join("");
  $$(".move-button").forEach(button=>button.addEventListener("click",()=>playerAction(moves[Number(button.dataset.move)])));
  $("#turnIndicator").textContent="SUA VEZ";
}
function effectiveness(moveType,defender){
  return defender.types.reduce((multiplier,type)=>multiplier*(typeChart[moveType]?.[type.type.name]??1),1);
}
function calculateDamage(move,attacker,defender){
  if(!move.power)return 0;
  const attackName=move.damage_class.name==="special"?"special-attack":"attack";
  const defenseName=move.damage_class.name==="special"?"special-defense":"defense";
  const attack=attacker.stats.find(stat=>stat.stat.name===attackName).base_stat;
  const defense=defender.stats.find(stat=>stat.stat.name===defenseName).base_stat;
  const multiplier=effectiveness(move.type.name,defender);
  const stab=attacker.types.some(type=>type.type.name===move.type.name)?1.5:1;
  const accuracy=(move.accuracy??100)/100;
  if(Math.random()>=accuracy||multiplier===0)return {damage:0,multiplier,missed:multiplier!==0};
  const variance=.85+Math.random()*.15;
  const damage=Math.max(1,Math.floor((((2*50/5+2)*move.power*attack/Math.max(1,defense))/50+2)*stab*multiplier*variance));
  return {damage,multiplier,missed:false};
}
async function playerAction(move){
  const battle=state.battle,serial=battle.serial;if(battle.busy||battle.over)return;
  battle.busy=true;renderMoves();await performAction(0,move);if(serial!==battle.serial||battle.over)return;
  $("#turnIndicator").textContent="VEZ DA IA";
  await wait(550);if(serial!==battle.serial||battle.over)return;
  const aiMove=chooseAiMove();
  if(aiMove)addLog(`A IA escolheu <strong>${title(aiMove.name)}</strong>.`);
  battle.busy=false;
  await performAction(1,aiMove);
  if(serial!==battle.serial||battle.over)return;
  battle.turn++;battle.busy=false;renderMoves();
}
function chooseAiMove(){
  const battle=state.battle,moves=battle.moves[1].filter(move=>(battle.pp[1].get(move.name)||0)>0);
  if(!moves.length)return struggleMove();
  return moves.map(move=>{
    let score=moveScore(move,1);
    if(statusNames[move.meta?.ailment?.name]&&!battle.statuses[0])score+=move.damage_class.name==="status"&&move.meta.category?.name==="ailment"?50:(move.meta.ailment_chance||0)*.25;
    return {move,score};
  }).sort((a,b)=>b.score-a.score)[0].move;
}
function struggleMove(){return {name:"struggle",power:50,accuracy:100,pp:1,type:{name:"normal"},damage_class:{name:"physical"},meta:{ailment:{name:"none"}}}}
async function performAction(attackerIndex,move){
  const battle=state.battle,serial=battle.serial,defenderIndex=1-attackerIndex,attacker=battle.fighters[attackerIndex],defender=battle.fighters[defenderIndex];
  if(!move)return;
  if(!canAct(attackerIndex))return;
  if(move.name!=="struggle")battle.pp[attackerIndex].set(move.name,Math.max(0,(battle.pp[attackerIndex].get(move.name)||1)-1));
  const status=move.meta?.ailment?.name;
  const ailmentChance=move.meta?.ailment_chance??0;
  if(move.meta?.healing){
    if(battle.hp[attackerIndex]>=battle.maxHp[attackerIndex]){
      addLog(`<strong>${title(attacker.name)}</strong> tentou ${title(move.name)}, mas já está com HP cheio.`);
    }else{
      await playBattleAnimation(attackerIndex,defenderIndex,move,()=>{
        if(serial!==state.battle.serial)return;
        const healed=Math.min(battle.maxHp[attackerIndex]-battle.hp[attackerIndex],Math.max(1,Math.floor(battle.maxHp[attackerIndex]*move.meta.healing/100)));
        battle.hp[attackerIndex]+=healed;updateHealth(attackerIndex);
        const healStatusChance=move.meta.category?.name==="heal"&&status==="sleep"?100:ailmentChance;
        const applied=status&&status!=="none"&&Math.random()*100<healStatusChance?applyStatus(attackerIndex,status):false;
        addLog(`<strong>${title(attacker.name)}</strong> usou ${title(move.name)} e recuperou <strong>${healed} HP</strong>${applied?`; também ficou ${statusLabels[status].toLowerCase()}`:""}.`);
      },true);
      if(serial!==state.battle.serial)return;
    }
  }else if(move.damage_class.name==="status"||!move.power){
    const accurate=Math.random()<(move.accuracy??100)/100;
    await playBattleAnimation(attackerIndex,defenderIndex,move,accurate?()=>{
      if(serial!==state.battle.serial)return;
      const statusChance=move.damage_class.name==="status"&&move.meta?.category?.name==="ailment"?100:ailmentChance;
      const applied=status&&status!=="none"&&Math.random()*100<statusChance?applyStatus(defenderIndex,status):false;
      addLog(applied?`<strong>${title(attacker.name)}</strong> usou ${title(move.name)}. ${title(defender.name)} sofreu ${statusLabels[status]}.`:`<strong>${title(attacker.name)}</strong> usou ${title(move.name)}, sem causar dano direto.`);
    }:null);
    if(serial!==state.battle.serial)return;
    if(!accurate)addLog(`<strong>${title(attacker.name)}</strong> usou ${title(move.name)}, mas errou o alvo.`);
  }else{
    const result=calculateDamage(move,attacker,defender);
    await playBattleAnimation(attackerIndex,defenderIndex,move,result.missed?null:()=>{
      if(serial!==state.battle.serial)return;
      battle.hp[defenderIndex]=Math.max(0,battle.hp[defenderIndex]-result.damage);updateHealth(defenderIndex);
      const effect=result.multiplier===0?" Não teve efeito!":result.multiplier>1?" Foi super efetivo!":result.multiplier<1?" Não foi muito efetivo.":"";
      addLog(`<strong>${title(attacker.name)}</strong> usou ${title(move.name)} e causou <strong>${result.damage}</strong> de dano.${effect}`);
      if(status&&status!=="none"&&Math.random()*100<ailmentChance)applyStatus(defenderIndex,status);
    });
    if(serial!==state.battle.serial)return;
    if(result.missed)addLog(`<strong>${title(attacker.name)}</strong> usou ${title(move.name)}, mas errou o alvo.`);
  }
  if(battle.hp[defenderIndex]<=0){await finishBattle(attackerIndex,defenderIndex);return}
  if(battle.hp[attackerIndex]>0)applyEndTurnStatus(attackerIndex);
  if(battle.hp[attackerIndex]<=0)await finishBattle(defenderIndex,attackerIndex);
}
function canAct(index){
  const battle=state.battle,status=battle.statuses[index],pokemon=battle.fighters[index];
  if(!status)return true;
  if(status.name==="paralysis"&&Math.random()<.25){addLog(`<strong>${title(pokemon.name)}</strong> está paralisado e não conseguiu atacar.`);return false}
  if(status.name==="sleep"){
    if(status.turns>0){status.turns--;renderStatus(index);addLog(`<strong>${title(pokemon.name)}</strong> está dormindo e perdeu a ação.`);return false}
    battle.statuses[index]=null;renderStatus(index);addLog(`<strong>${title(pokemon.name)}</strong> acordou!`);return true;
  }
  if(status.name==="freeze"){
    if(Math.random()<.2){battle.statuses[index]=null;renderStatus(index);addLog(`<strong>${title(pokemon.name)}</strong> descongelou!`);return true}
    addLog(`<strong>${title(pokemon.name)}</strong> está congelado e não conseguiu atacar.`);return false;
  }
  return true;
}
function applyStatus(index,name){
  const battle=state.battle;
  if(!statusNames[name]||battle.statuses[index])return false;
  battle.statuses[index]={name,turns:name==="sleep"?2+Math.floor(Math.random()*3):0};renderStatus(index);return true;
}
function applyEndTurnStatus(index){
  const battle=state.battle,status=battle.statuses[index];if(!status)return;
  if(status.name==="burn"||status.name==="poison"){
    const damage=Math.max(1,Math.floor(battle.maxHp[index]/8));battle.hp[index]=Math.max(0,battle.hp[index]-damage);updateHealth(index);
    addLog(`<strong>${title(battle.fighters[index].name)}</strong> sofreu ${statusLabels[status.name].toLowerCase()} e perdeu <strong>${damage} HP</strong>.`);
  }
}
async function playBattleAnimation(attackerIndex,defenderIndex,move,onHitCallback,selfTarget=false){
  const serial=state.battle.serial,targetIndex=selfTarget?attackerIndex:defenderIndex;
  const fighter=$("#battleFighter"+suffixFor(attackerIndex));
  const collision=onHitCallback?()=>{
    if(serial!==state.battle.serial)return;
    onHitCallback();
  }:null;
  if(reducedMotion()){
    collision?.();
    return;
  }
  fighter.classList.add("acting");
  try{
    if(selfTarget){
      await animationWait(260);
      if(serial===state.battle.serial)collision?.();
      return;
    }
    await animator.playAttack({
      attackerEl:$("#stage"+suffixFor(attackerIndex)),
      targetEl:$("#stage"+suffixFor(targetIndex)),
      moveType:typeNames[move.type.name]||move.type.name,
      onImpact:collision
    });
  }finally{
    fighter.classList.remove("acting");
  }
}
async function finishBattle(winnerIndex,loserIndex){
  const battle=state.battle,serial=battle.serial; battle.over=true;battle.busy=false;
  const winner=battle.fighters[winnerIndex],loser=battle.fighters[loserIndex];
  const winnerStage=$("#stage"+suffixFor(winnerIndex)),loserStage=$("#stage"+suffixFor(loserIndex));
  const fighter=$("#battleFighter"+suffixFor(loserIndex));
  const winnerProfile=spriteCollabProfiles[winner.id],loserProfile=spriteCollabProfiles[loser.id];
  const [winnerAnimated,loserAnimated]=await Promise.all([
    winnerProfile?.actions.includes("Hop")?playSpriteCollabAnimation(winnerIndex,"Hop",{serial}):false,
    loserProfile?.actions.includes("Faint")?playSpriteCollabAnimation(loserIndex,"Faint",{serial}):false
  ]);
  if(serial!==battle.serial)return;
  if(!winnerAnimated){restoreBattleSprite(winnerIndex);winnerStage.classList.add("victorious")}
  fighter.classList.add("fainted");
  if(!loserAnimated){restoreBattleSprite(loserIndex);loserStage.classList.add("fainted")}
  addLog(`<strong>${title(loser.name)}</strong> desmaiou! <strong>${title(winner.name)}</strong> venceu a batalha!`);
  $("#turnIndicator").textContent=winnerIndex===0?"VITÓRIA":"DERROTA";renderMoves();
}
function addLog(message){
  const log=$("#battleLog"),battle=state.battle;
  if(!battle.logs.length)log.innerHTML="";
  battle.logs.unshift(message);log.innerHTML=battle.logs.slice(0,14).map((entry,index)=>`<p>${index===0?'<span class="log-arrow">▸ </span>':""}${entry}</p>`).join("");
}
initDex();
