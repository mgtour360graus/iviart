(function(){'use strict';
 var root=document.documentElement;root.classList.add('iviart-opening');
 var finished=false, shield=null, promptSeen=false;
 function cover(){
  if(shield)return;shield=document.createElement('div');shield.id='iviart-opening-shield';shield.setAttribute('aria-hidden','true');document.body.appendChild(shield);
 }
 async function finish(){
  if(finished)return;finished=true;cover();observer.disconnect();clearInterval(timer);
  var host=document.getElementById('iviart-skin');
  var images=host?Array.from(host.querySelectorAll('img')).map(function(img){return img.decode?img.decode().catch(function(){}):Promise.resolve()}):[];
  await Promise.all(images.concat(document.fonts?document.fonts.ready:Promise.resolve()));
  await new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve)})});
  root.classList.remove('iviart-opening','iviart-prompt-ready');
  shield.classList.add('is-ready');
  var remove=function(){if(shield)shield.remove();window.IVIART_OPENING_FINISHED=true};
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)remove();else{shield.addEventListener('transitionend',remove,{once:true});setTimeout(remove,250)}
 }
 window.IVIART_OPENING_COMPLETE=finish;
 function visibleInPlayer(e){for(var n=e;n&&n.id!=='viewer';n=n.parentElement){if(n.style.display==='none'||n.style.visibility==='hidden'||n.style.opacity==='0')return false}return true}
 function inspect(){
  if(finished)return;if(window.IVIART_READY){finish();return}
  var label=Array.from(document.querySelectorAll('#viewer span')).find(function(e){return /^Ativar\s+áudio\?$/.test((e.textContent||'').trim())&&e.getBoundingClientRect().width>0&&visibleInPlayer(e)});
  if(!label){if(promptSeen)cover();root.classList.remove('iviart-prompt-ready');return}
  promptSeen=true;
  var card=label;
  while(card&&card!==document.body){var text=(card.textContent||'').replace(/\s/g,'');var rect=card.getBoundingClientRect();if(text==='Ativaráudio?SIMNÃO'&&rect.width>=200&&rect.width<=600&&rect.height>=100&&rect.height<=320)break;card=card.parentElement}
  if(!card||card===document.body)return;
  if(!card.dataset.iviartChoiceBound){
   card.dataset.iviartChoiceBound='true';
   for(var layer=card.parentElement;layer&&layer.id!=='viewer';layer=layer.parentElement){var bounds=layer.getBoundingClientRect();if(layer.id&&bounds.width>=innerWidth*.9&&bounds.height>=innerHeight*.9){observer.observe(layer,{attributes:true,attributeFilter:['style']});break}}
   var controls=Array.from(card.querySelectorAll('*')).filter(function(e){return e.children.length===0&&/^(SIM|NÃO)$/.test((e.textContent||'').trim())}).map(function(e){return e.closest('[id]')||e.parentElement});
   var choose=function(event){if(event.type==='keydown'&&event.key!=='Enter'&&event.key!==' ')return;if(controls.some(function(control){return control.contains(event.target)}))cover()};
   ['pointerdown','mousedown','touchstart','click','keydown'].forEach(function(type){card.addEventListener(type,choose,{capture:true,passive:true})});
  }
  if(!card.parentElement.querySelector('.iviart-audio-mask')){var mask=document.createElement('div');mask.className='iviart-audio-mask';mask.setAttribute('aria-hidden','true');card.parentElement.insertBefore(mask,card);card.classList.add('iviart-audio-card')}
  root.classList.add('iviart-prompt-ready');
 }
 var observer=new MutationObserver(inspect);observer.observe(root,{childList:true,subtree:true});var timer=setInterval(inspect,100);
})();
