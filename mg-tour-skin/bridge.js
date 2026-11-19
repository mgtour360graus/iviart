(function(){
 'use strict';
 function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
 function setupEntrance(script){
  function instance(cls,props){var o=script.createInstance(cls);Object.keys(props).forEach(function(k){o.set(k,props[k])});return o}
  ['iviart_maringa_node2_camera','iviart_curitiba_node34_camera'].forEach(function(id){
   var camera=script[id],pos=camera.get('initialPosition'),yaw=pos.get('yaw')||0;
   camera.set('initialSequence',null);camera.set('automaticRotationSpeed',0);
   if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.set('displayOriginPosition',instance('RotationalCameraDisplayPosition',{pitch:pos.get('pitch')||0,yaw:yaw,hfov:pos.get('hfov')||120,stereographicFactor:0}));camera.set('displayMovements',[]);return;}
   camera.set('displayOriginPosition',instance('RotationalCameraDisplayPosition',{pitch:-90,yaw:yaw-180,hfov:165,stereographicFactor:1}));
   camera.set('displayMovements',[
    instance('TargetRotationalCameraDisplayMovement',{duration:6000,targetPitch:-90,targetYaw:yaw,targetHfov:165,targetStereographicFactor:1}),
    instance('TargetRotationalCameraDisplayMovement',{duration:6000,easing:'cubic_in_out',targetPitch:pos.get('pitch')||0,targetYaw:yaw,targetHfov:pos.get('hfov')||120,targetStereographicFactor:0})
   ]);
  });
 }
 async function mount(){
  if(document.getElementById('iviart-skin'))return;
  var response=await fetch('mg-tour-skin/markup.html');if(!response.ok)throw Error('Layout indisponível');
  var host=document.createElement('div');host.id='iviart-skin';host.innerHTML=await response.text();document.body.appendChild(host);
  await load('mg-tour-skin/config.js');
  var script=window.IVIART_NATIVE, list=script.mainPlayList;setupEntrance(script);
  if(!list)throw Error('Playlist nativa indisponível');
  var items=list.get('items')||[], bindings={},panoramas={maringa:[],curitiba:[]};
  items.forEach(function(item,index){var media=item.get('media');if(!media)return;var id=media.get('id');if(!/^iviart_/.test(id))return;var match=id.match(/^iviart_(maringa|curitiba)_(node\d+)$/);if(!match)return;bindings[match[1]+'_'+match[2]]=index;panoramas[match[1]].push({id:match[2],title:match[2]==='node2'&&match[1]==='maringa'||match[2]==='node34'&&match[1]==='curitiba'?'Fachada': 'Ambiente '+(panoramas[match[1]].length+1),thumb:media.get('thumbnailUrl')});});
  window.IVIART_PANORAMAS=panoramas;
  list.set('selectedIndex',-1);script.MainViewerPanoramaPlayer.set('panorama',null);
  function navigate(id){var index=bindings[id];if(typeof index!=='number')throw Error('Ambiente não encontrado: '+id);script.setPlayListSelectedIndex(list,index);window.IVIART_CURRENT_SCENE=id;}
  window.IVIART_ENGINE={navigate:navigate,selectUnit:function(id){list.set('selectedIndex',-1);script.MainViewerPanoramaPlayer.set('panorama',null);navigate(id==='curitiba'?'curitiba_node34':'maringa_node2')},getState:function(){var index=list.get('selectedIndex');var item=items[index];return {index:index,id:item&&item.get('media')&&item.get('media').get('id'),bindings:bindings}}};
  await load('mg-tour-skin/app.js');
  window.IVIART_READY=true;
 }
 var rootDetected=0;var tries=0,timer=setInterval(function(){if(!window.IVIART_NATIVE&&window.tour&&tour._isInitialized&&tour._getRootPlayer)window.IVIART_NATIVE=tour._getRootPlayer();if(window.IVIART_NATIVE&&!rootDetected)rootDetected=Date.now();if(window.IVIART_NATIVE&&Date.now()-rootDetected>600&&document.readyState!=='loading'&&!/Ativar\s+áudio\?/.test(document.body.innerText)){clearInterval(timer);mount().catch(function(e){console.error('IVIART integração:',e);window.IVIART_ERROR=e.message;})}else if(++tries>240){clearInterval(timer);console.error('IVIART: player não inicializou')}},250);
})();
