(() => {
  'use strict';
  const videos = {"kahnec-studio-showreel": {"title": "Kahnec studio showreel", "category": "Studio portfolio", "duration": "0:43"}, "national-v9": {"title": "National Value Pack", "category": "Brand campaign", "duration": "0:32", "group": "brand"}, "commerce-short": {"title": "Shop closed. Still selling.", "category": "Commerce campaign", "duration": "0:30", "group": "brand"}, "cyber": {"title": "Enersave · Cyber Monday", "category": "Promotional video", "duration": "0:20", "group": "brand"}, "plant-a": {"title": "Arbor Day · Plant Fair", "category": "Social animation · Film 01", "duration": "0:36", "group": "animation", "portrait": true}, "plant-b": {"title": "Arbor Day · Plant Fair", "category": "Social animation · Film 02", "duration": "0:39", "group": "animation", "portrait": true}, "gift": {"title": "Enersave · Gift Pays Back", "category": "Seasonal animation", "duration": "0:30", "group": "animation"}, "yello": {"title": "Yello Commerce", "category": "Product film", "duration": "1:00", "group": "brand"}, "enersave": {"title": "Enersave · Two Dads", "category": "Animated explainer", "duration": "0:30", "group": "animation"}, "signal": {"title": "Signal Flo", "category": "Brand motion", "duration": "0:55", "group": "animation", "portrait": true}, "antigua": {"title": "Life in Antigua", "category": "Travel film", "duration": "1:02", "group": "stories", "portrait": true}, "hummingbird": {"title": "Hummingbird", "category": "Nature storytelling", "duration": "1:29", "group": "stories", "portrait": true}};
  const dialog=document.querySelector('#video-dialog'),slot=document.querySelector('#player-slot');
  let trigger=null;
  document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
    trigger=button;
    const id=button.dataset.video,v=videos[id];
    document.querySelector('#video-title').textContent=v.title;
    document.querySelector('#video-error').hidden=true;
    const player=document.createElement('video');
    player.controls=true;player.playsInline=true;player.preload='none';
    player.poster=`assets/video-review/${id}-800.webp`;
    player.width=v.portrait?540:1280;player.height=v.portrait?960:720;
    document.querySelector('#video-category').textContent=v.category;
    player.src=`assets/video-review/${id}.mp4`;
    player.setAttribute('aria-label',v.title);
    player.addEventListener('error',()=>document.querySelector('#video-error').hidden=false);
    slot.replaceChildren(player);dialog.showModal();
    document.body.style.overflow='hidden';
    // Playback begins only from this explicit Play/Watch action.
    player.play().catch(()=>{/* Native controls remain available if playback is blocked. */});
  }));

  if(!('closedBy' in HTMLDialogElement.prototype)) dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{const player=slot.querySelector('video');if(player){player.pause();player.removeAttribute('src');player.load();}slot.replaceChildren();document.body.style.overflow='';trigger?.focus();});

  // Gallery. Movement is layered through CSS variables so no layer overwrites another:
  //   --dx/--dy  drag offset            (stage)   } both feed each card's `translate`,
  //   --px/--py  pointer response       (stage)   } scaled by the card's own --depth
  //   --tx/--ty  tilt of the hovered picture      -> the picture's `transform`
  // The entrance animates each card's `transform`; hover lift uses `rotate`, `translate` and `scale` on the picture.
  const work=document.querySelector('.work'),stage=document.querySelector('#stage'),gallery=document.querySelector('#gallery-view'),list=document.querySelector('#list-view');
  const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)'),narrow=matchMedia('(max-width:760px)'),finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const canMove=()=>!reduceMotion.matches&&!narrow.matches&&!work.classList.contains('list');
  // A drag eases towards its limit rather than stopping dead: bounded, with some give.
  const rubber=(value,limit)=>limit*Math.tanh(value/limit);
  let drag=null,moved=false,settleTimer=0,frame=0,pointer=null,tilted=null,stageVisible=true;

  function setDrag(x,y){stage.style.setProperty('--dx',x.toFixed(2)+'px');stage.style.setProperty('--dy',y.toFixed(2)+'px');}
  function clearTilt(){if(!tilted)return;tilted.style.removeProperty('--tx');tilted.style.removeProperty('--ty');tilted=null;}
  function clearPointer(){pointer=null;stage.style.setProperty('--px','0px');stage.style.setProperty('--py','0px');clearTilt();}
  function reset(){clearTimeout(settleTimer);stage.classList.remove('dragging','settling');drag=null;setDrag(0,0);clearPointer();}
  function setView(view){work.classList.toggle('list',view==='list');work.classList.toggle('gallery',view==='gallery');gallery.setAttribute('aria-pressed',view==='gallery');list.setAttribute('aria-pressed',view==='list');reset();}
  gallery.addEventListener('click',()=>setView('gallery'));list.addEventListener('click',()=>setView('list'));

  // Pointer response: the table shifts slightly against the pointer, and the picture under it tilts towards it.
  function respond(){
    frame=0;
    if(!pointer||drag)return;
    const area=stage.getBoundingClientRect();
    const nx=Math.max(-1,Math.min(1,(pointer.x-area.left)/area.width*2-1)),ny=Math.max(-1,Math.min(1,(pointer.y-area.top)/area.height*2-1));
    stage.style.setProperty('--px',(-nx*7).toFixed(2)+'px');stage.style.setProperty('--py',(-ny*5).toFixed(2)+'px');
    const picture=pointer.target instanceof Element?pointer.target.closest('.project')?.querySelector('.picture'):null;
    if(tilted&&tilted!==picture)clearTilt();
    if(!picture)return;
    const box=picture.getBoundingClientRect(),u=(pointer.x-box.left)/box.width-.5,v=(pointer.y-box.top)/box.height-.5;
    // Titles sit outside the picture: only tilt while the pointer is on the image itself.
    if(Math.abs(u)>.5||Math.abs(v)>.5){clearTilt();return;}
    picture.style.setProperty('--tx',(-v*5).toFixed(2)+'deg');picture.style.setProperty('--ty',(u*6).toFixed(2)+'deg');
    tilted=picture;
  }

  stage.addEventListener('dragstart',e=>e.preventDefault());
  stage.addEventListener('pointerdown',e=>{moved=false;if(e.pointerType==='touch'||e.button!==0||!canMove())return;drag={x:e.clientX,y:e.clientY};});
  stage.addEventListener('pointermove',e=>{
    if(drag){
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!moved){
        if(Math.abs(dx)+Math.abs(dy)<=6)return;
        moved=true;stage.setPointerCapture(e.pointerId);clearTimeout(settleTimer);stage.classList.remove('settling');stage.classList.add('dragging');clearPointer();
      }
      setDrag(rubber(dx*.3,30),rubber(dy*.3,22));
      return;
    }
    // Fine pointers only, and only while the gallery is on screen.
    if(e.pointerType!=='mouse'||!finePointer.matches||!stageVisible||!canMove())return;
    pointer={x:e.clientX,y:e.clientY,target:e.target};
    if(!frame)frame=requestAnimationFrame(respond);
  });
  stage.addEventListener('pointerleave',()=>{if(!drag)clearPointer();});
  // Release: the work springs back to where it was laid out.
  function stop(){
    if(!drag)return;
    drag=null;
    if(!stage.classList.contains('dragging'))return;
    stage.classList.remove('dragging');stage.classList.add('settling');setDrag(0,0);
    clearTimeout(settleTimer);settleTimer=setTimeout(()=>stage.classList.remove('settling'),950);
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>stage.addEventListener(type,stop));
  // A drag never opens a project.
  stage.addEventListener('click',e=>{if(moved&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();moved=false;}},true);
  // Nothing responds while the gallery is off screen, the tab is hidden, or the layout or motion preference changes.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      stageVisible = entry.isIntersecting;
      stage.toggleAttribute('data-offscreen', !stageVisible);
      if (!stageVisible) clearPointer();
    }).observe(stage);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  reduceMotion.addEventListener('change',reset);narrow.addEventListener('change',reset);

  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b===button));
    let count=0;
    document.querySelectorAll('.film-item').forEach(item=>{
      item.hidden=filter!=='all'&&item.dataset.category!==filter;
      if(item.hidden)return;
      // The filtered set arrives together, in order.
      if(!reduceMotion.matches&&item.animate)item.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:320,delay:Math.min(count,7)*30,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
      count++;
    });
    document.querySelector('#film-count').textContent=count+' films';
  }));
})();
