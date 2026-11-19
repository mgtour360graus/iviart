(function(){
 'use strict';
 var api=TDV.PlayerAPI, define=api.defineScript;
 var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function walk(value,fn){if(!value||typeof value!=='object')return;fn(value);Object.keys(value).forEach(function(k){if(typeof value[k]==='object')walk(value[k],fn)});}
 function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
 api.defineScript=function(script){
  var scenes=[];
  walk(script,function(o){
   if(o.class==='Panorama'&&o.id&&/^iviart_/.test(o.id))scenes.push({id:o.id,thumb:o.thumbnailUrl});
   if(o.class==='Player'){o.mediaActivationMode='button';o.mute=true;}if(o.class==='PanoramaCamera'&&/iviart_(maringa_node2|curitiba_node34)_camera$/.test(o.id)&&!reduced){
    var pos=o.initialPosition||{yaw:0,pitch:0,hfov:120};delete o.initialSequence;o.automaticRotationSpeed=0;
    o.displayOriginPosition={class:'RotationalCameraDisplayPosition',pitch:-90,yaw:pos.yaw||0,hfov:165,stereographicFactor:1};
    o.displayMovements=[{class:'TargetRotationalCameraDisplayMovement',duration:1000},{class:'TargetRotationalCameraDisplayMovement',easing:'cubic_in_out',duration:6000,targetPitch:pos.pitch||0,targetYaw:pos.yaw||0,targetHfov:pos.hfov||120,targetStereographicFactor:0}];
   }
  });
  var originalInit=script.init;
  script.init=function(){var result=originalInit.apply(this,arguments);window.IVIART_NATIVE=this;return result};
  window.IVIART_EXPORT_SCENES=scenes;
  return define.call(api,script);
 };
 async function mount(){
  if(document.getElementById('iviart-skin'))return;
  var response=await fetch('mg-tour-skin/markup.html');if(!response.ok)throw Error('Layout indisponível');
  var host=document.createElement('div');host.id='iviart-skin';host.innerHTML=await response.text();document.body.appendChild(host);
  await load('mg-tour-skin/config.js');
  var script=window.IVIART_NATIVE, list=script.mainPlayList;
  if(!list)throw Error('Playlist nativa indisponível');
  var items=list.get('items')||[], bindings={},panoramas={maringa:[],curitiba:[]};
  items.forEach(function(item,index){var media=item.get('media');if(!media)return;var id=media.get('id');if(!/^iviart_/.test(id))return;var match=id.match(/^iviart_(maringa|curitiba)_(node\d+)$/);if(!match)return;bindings[match[1]+'_'+match[2]]=index;panoramas[match[1]].push({id:match[2],title:match[2]==='node2'&&match[1]==='maringa'||match[2]==='node34'&&match[1]==='curitiba'?'Fachada': 'Ambiente '+(panoramas[match[1]].length+1),thumb:media.get('thumbnailUrl')});});
  window.IVIART_PANORAMAS=panoramas;
  list.set('selectedIndex',-1);
  function navigate(id){var index=bindings[id];if(typeof index!=='number')throw Error('Ambiente não encontrado: '+id);script.setPlayListSelectedIndex(list,index);window.IVIART_CURRENT_SCENE=id;}
  window.IVIART_ENGINE={navigate:navigate,selectUnit:function(id){navigate(id==='curitiba'?'curitiba_node34':'maringa_node2')},getState:function(){var index=list.get('selectedIndex');var item=items[index];return {index:index,id:item&&item.get('media')&&item.get('media').get('id'),bindings:bindings}}};
  await load('mg-tour-skin/app.js');
  window.IVIART_READY=true;
 }
 var tries=0,timer=setInterval(function(){if(!window.IVIART_NATIVE&&window.tour&&tour._isInitialized&&tour._getRootPlayer)window.IVIART_NATIVE=tour._getRootPlayer();if(window.IVIART_NATIVE&&document.readyState!=='loading'){clearInterval(timer);mount().catch(function(e){console.error('IVIART integração:',e);window.IVIART_ERROR=e.message;})}else if(++tries>240){clearInterval(timer);console.error