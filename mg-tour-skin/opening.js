(function(){'use strict';
 var root=document.documentElement;root.classList.add('iviart-opening');
 var finished=false;
 function finish(){if(finished)return;finished=true;root.classList.remove('iviart-opening','iviart-prompt-ready');observer.disconnect();clearInterval(timer)}
 window.IVIART_OPENING_COMPLETE=finish;
 function visibleInPlayer(e){for(var n=e;n&&n.id!=='viewer';n=n.parentElement){if(n.style.display==='none'||n.style.visibility==='hidden'||n.style.opacity==='0')return false}return true}
 function inspect(){
  if(finished)return;if(window.IVIART_READY){finish();return}
  var label=Array.from(document.querySelectorAll('#viewer span')).find(function(e){return /^Ativar\s+áudio\?$/.test((e.textContent||'').trim())&&e.getBoundingClientRect().width>0&&visibleInPlayer(e)});
  if(!label){root.classList.remove('iviart-prompt-ready');return}
  var card=label;
  while(card&&card!==document.body){var text=(card.textContent||'').replace(/\s/g,'');var rect=card.getBoundingClientRect();if(text==='Ativaráudio?SIMNÃO'&&rect.width>=200&&rect.width<=600&&rect.height>=100&&rect.height<=320)break;card=card.parentElement}
  if(!card||card===document.body)return;
  if(!card.parentElement.querySelector('.iviart-audio-mask')){var mask=document.createElement('div');mask.className='iviart-audio-mask';mask.setAttribute('aria-hidden','true');card.parentElement.insertBefore(mask,card);card.classList.add('iviart-audio-card')}
  root.classList.add('iviart-prompt-ready');
 }
 var observer=new MutationObserver(inspect);observer.observe(root,{childList:true,subtree:true});var timer=setInterval(inspect,100);
})();
