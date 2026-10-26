/* Native cinematic previews – only directly playable, licensed MP4 video. */
(() => {
'use strict';
let current=null, hoverTimer=null;
function stop(){
 clearTimeout(hoverTimer);
 if(!current)return;
 const {video,layer}=current;
 if(video){video.pause();video.removeAttribute('src');video.load()}
 layer.remove();current=null;
}
const urls=item=>[item.previewVideo,item.previewBackup].filter(Boolean);
function bind(video,item,layer,status){
 const options=urls(item);let index=0,started=false,watchdog;
 const report=(msg)=>{if(status)status.textContent=msg;layer.classList.add('sp-cinema-motion')};
 const retry=()=>{
  clearTimeout(watchdog);
  if(!layer.isConnected)return;
  if(index+1<options.length){
   video.src=options[++index];video.load();video.play().catch(()=>report('Bitte Play drücken'));
  }else report('Video nicht erreichbar – Trailer-Link verwenden');
 };
 video.addEventListener('playing',()=>{started=true;clearTimeout(watchdog);layer.classList.add('sp-cinema-playing');layer.classList.remove('sp-cinema-motion')});
 video.addEventListener('error',retry);
 video.src=options[0];video.load();
 watchdog=setTimeout(()=>{if(!started && video.readyState<2)retry()},8500);
 video.play().catch(()=>report('Bitte Play drücken'));
}
function preview(item,target,mode='detail'){
 stop();if(!item||!target)return;
 const layer=document.createElement('div');
 layer.className='sp-cinema sp-cinema-'+mode;
 const image=document.createElement('img');image.className='sp-cinema-image';image.alt='';image.src=item.backdrop||item.poster;
 const shade=document.createElement('div');shade.className='sp-cinema-shade';
 const status=document.createElement('span');status.className='sp-cinema-status';
 status.textContent=item.previewVideo?'VIDEO-VORSCHAU':'BILDVORSCHAU';
 layer.append(image,shade,status);target.append(layer);
 current={layer,video:null,mode,item};
 if(!item.previewVideo){layer.classList.add('sp-cinema-motion');return}
 const video=document.createElement('video');video.className='sp-cinema-video';
 video.muted=true;video.defaultMuted=true;video.setAttribute('muted','');
 video.autoplay=true;video.loop=true;video.playsInline=true;video.setAttribute('playsinline','');video.preload='auto';
 video.poster=item.backdrop||item.poster;layer.insertBefore(video,shade);current.video=video;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData){
  layer.classList.add('sp-cinema-motion');status.textContent='Zum Starten auf Play drücken';return;
 }
 bind(video,item,layer,status);
}
const hero=item=>preview(item,document.querySelector('#heroBackground'),'hero');
const open=item=>preview(item,document.querySelector('#detailContent .detail-backdrop'),'detail');
function playCurrent(){
 if(!current?.item.previewVideo)return;
 const {layer,item}=current;let {video}=current;
 if(!video){
  video=document.createElement('video');video.className='sp-cinema-video';video.muted=true;video.playsInline=true;video.loop=true;video.setAttribute('playsinline','');video.controls=true;
  layer.insertBefore(video,layer.querySelector('.sp-cinema-shade'));current.video=video;
  bind(video,item,layer,layer.querySelector('.sp-cinema-status'));
 }else{video.controls=true;video.play().catch(()=>{layer.querySelector('.sp-cinema-status').textContent='Bitte Play im Player drücken'})}
}
function player(item,area){
 stop();area.replaceChildren();
 const video=document.createElement('video');video.className='sp-player-video';
 video.controls=true;video.autoplay=true;video.playsInline=true;video.setAttribute('playsinline','');video.preload='auto';video.poster=item.backdrop||item.poster;
 const message=document.createElement('p');message.className='sp-player-error';message.hidden=true;
 message.textContent='Video kann nicht geladen werden. Videoquelle unter dem Player öffnen.';
 let backup=false;
 video.addEventListener('error',()=>{if(!backup&&item.previewBackup){backup=true;video.src=item.previewBackup;video.load();video.play().catch(()=>{})}else message.hidden=false});
 area.append(video,message);video.src=item.previewVideo;video.load();video.play().catch(()=>{});return video;
}
document.addEventListener('pointerover',e=>{
 if(e.pointerType==='touch')return;
 const card=e.target.closest('.poster-card[data-open]');
 if(!card||card.contains(e.relatedTarget))return;
 clearTimeout(hoverTimer);
 hoverTimer=setTimeout(()=>{
  if(!card.isConnected||!card.matches(':hover')||document.querySelector('dialog[open]'))return;
  const item=window.CATALOG.find(x=>x.id===card.dataset.open);
  if(item)preview(item,card.querySelector('.poster-art'),'card');
 },450);
});
document.addEventListener('pointerout',e=>{
 const card=e.target.closest('.poster-card[data-open]');
 if(card&&!card.contains(e.relatedTarget)){
  clearTimeout(hoverTimer);
  if(current?.mode==='card'){stop();const i=Number(document.querySelector('#heroCurrent')?.textContent||'1')-1;
   const item=window.CATALOG.find(x=>x.id===window.HERO_IDS[i]);if(item&&!document.querySelector('dialog[open]'))hero(item)}
 }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
window.StreamingPlaceCinema={hero,open,close:stop,playCurrent,player,isPlaying:()=>!!current?.video&&!current.video.paused};
})();
