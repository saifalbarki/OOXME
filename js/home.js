const dotCanvas=document.querySelector('.dot-field');
const homeReveal=document.querySelector('.home-reveal');

if(homeReveal){requestAnimationFrame(()=>homeReveal.classList.add('is-visible'))}

if(dotCanvas){
  const context=dotCanvas.getContext('2d');
  let width=0;
  let height=0;
  let scale=1;
  let spacing=22;
  let radius=115;
  let wave=0;
  let orb={x:0,y:0,targetX:0,targetY:0};
  let pointer={x:0,y:0,activeUntil:0};
  let wasPointerControlled=false;

  function chooseTarget(){
    const edge=radius*.55;
    orb.targetX=edge+Math.random()*Math.max(1,width-edge*2);
    orb.targetY=edge+Math.random()*Math.max(1,height-edge*2);
  }

  function resize(){
    const oldWidth=width;
    const oldHeight=height;
    const bounds=dotCanvas.getBoundingClientRect();
    scale=window.devicePixelRatio||1;
    width=Math.round(bounds.width);
    height=Math.round(bounds.height);
    dotCanvas.width=Math.round(width*scale);
    dotCanvas.height=Math.round(height*scale);
    context.setTransform(scale,0,0,scale,0,0);
    context.imageSmoothingEnabled=true;
    // A sqrt(2) reduction in spacing gives approximately twice as many dots.
    spacing=width<680?14:20;
    radius=width<680?92:150;
    if(oldWidth&&oldHeight){
      orb.x=orb.x/oldWidth*width;
      orb.y=orb.y/oldHeight*height;
      orb.targetX=orb.targetX/oldWidth*width;
      orb.targetY=orb.targetY/oldHeight*height;
    }else{
      orb.x=width*.5;
      orb.y=height*.42;
      chooseTarget();
    }
  }

  function draw(){
    context.clearRect(0,0,width,height);
    for(let y=spacing*.5;y<height;y+=spacing){
      for(let x=spacing*.5;x<width;x+=spacing){
        const distance=Math.hypot(x-orb.x,y-orb.y);
        if(distance>=radius)continue;
        const fade=1-distance/radius;
        context.globalAlpha=Math.pow(fade,1.85);
        context.fillStyle='#000000';
        context.beginPath();
        context.arc(x,y,width<680?1.25:1.5,0,Math.PI*2);
        context.fill();
      }
    }
    context.globalAlpha=1;
  }

  function animate(now){
    wave+=.054;
    const pointerControlled=now<pointer.activeUntil;
    if(pointerControlled){
      orb.x+=(pointer.x-orb.x)*.14;
      orb.y+=(pointer.y-orb.y)*.14;
    }else{
      if(wasPointerControlled)chooseTarget();
      const flowX=Math.sin(wave*.73)*.48+Math.sin(wave*.21+1.7)*.36;
      const flowY=Math.cos(wave*.57)*.48+Math.cos(wave*.31+.8)*.36;
      orb.x+=(orb.targetX-orb.x)*.036+flowX;
      orb.y+=(orb.targetY-orb.y)*.036+flowY;
      if(Math.hypot(orb.targetX-orb.x,orb.targetY-orb.y)<8)chooseTarget();
    }
    wasPointerControlled=pointerControlled;
    draw();
    requestAnimationFrame(animate);
  }

  function followPointer(event){
    const bounds=dotCanvas.getBoundingClientRect();
    pointer.x=Math.max(0,Math.min(bounds.width,event.clientX-bounds.left));
    pointer.y=Math.max(0,Math.min(bounds.height,event.clientY-bounds.top));
    pointer.activeUntil=performance.now()+700;
  }

  resize();
  draw();
  requestAnimationFrame(animate);
  dotCanvas.addEventListener('pointermove',followPointer,{passive:true});
  dotCanvas.addEventListener('pointerdown',followPointer,{passive:true});
  dotCanvas.addEventListener('pointerleave',()=>{pointer.activeUntil=0},{passive:true});
  dotCanvas.addEventListener('pointercancel',()=>{pointer.activeUntil=0},{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('orientationchange',resize,{passive:true});
  if('ResizeObserver' in window){new ResizeObserver(resize).observe(dotCanvas)}
}
