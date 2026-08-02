const dotCanvas=document.querySelector('.dot-field');
const homeReveal=document.querySelector('.home-reveal');

if(homeReveal){requestAnimationFrame(()=>homeReveal.classList.add('is-visible'))}

if(dotCanvas){
  const context=dotCanvas.getContext('2d');
  const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width=0;
  let height=0;
  let scale=1;
  let spacing=22;
  let radius=115;
  let wave=0;
  let orb={x:0,y:0,targetX:0,targetY:0};
  let pointer={x:0,y:0,activeUntil:0};
  let wasPointerControlled=false;
  let mobilePhase=Math.random()*Math.PI*2;
  let mobileWaves=[];

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
        const opacity=width<768?mobileWaveOpacity(x,y):Math.pow(fade,1.85);
        if(opacity<.01)continue;
        context.globalAlpha=opacity;
        context.fillStyle='#000000';
        context.beginPath();
        context.arc(x,y,width<680?3.75:4.5,0,Math.PI*2);
        context.fill();
      }
    }
    context.globalAlpha=1;
  }

  function createMobileWave(initial=false){
    const angle=initial?Math.PI/2:Math.random()*Math.PI*2;
    const shortest=Math.min(width,height);
    return {
      nx:Math.cos(angle),
      ny:Math.sin(angle),
      progress:0,
      speed:initial ? .0055 : .0042+Math.random()*.002,
      curvature:initial?shortest*.2:shortest*(.08+Math.random()*.15)*(Math.random()>.5?1:-1),
      amplitude:shortest*(.018+Math.random()*.035),
      frequency:1.2+Math.random()*1.8,
      phase:Math.random()*Math.PI*2,
      distortion:Math.random()*Math.PI*2,
      strength:initial?1:.74+Math.random()*.2,
      shift:0,
      initial
    };
  }

  function mobileWaveOpacity(x,y){
    let strongest=0;
    for(const current of mobileWaves){
      const px=x-width*.5;
      const py=y-height*.5;
      const tangent=px*-current.ny+py*current.nx;
      const normal=px*current.nx+py*current.ny;
      const normalSpan=Math.abs(current.nx)*width+Math.abs(current.ny)*height;
      const tangentSpan=Math.abs(current.ny)*width+Math.abs(current.nx)*height;
      const tangentRatio=Math.max(-1,Math.min(1,tangent/(tangentSpan*.5||1)));
      const arch=current.curvature*(1-tangentRatio*tangentRatio);
      const undulation=current.amplitude*Math.sin(tangentRatio*Math.PI*current.frequency+current.phase+mobilePhase*.45);
      const organic=current.amplitude*.42*Math.sin(tangentRatio*Math.PI*(current.frequency*1.73)+current.distortion-mobilePhase*.31);
      const front=-normalSpan*.5-radius*1.25+current.progress*(normalSpan+radius*2.5)+current.shift;
      const distance=normal-(front+arch+undulation+organic);
      const bandWidth=radius*.22;
      const offset=distance/bandWidth;
      strongest=Math.max(strongest,Math.exp(-.5*offset*offset)*current.strength);
    }
    return Math.min(1,strongest);
  }

  function updateMobileWaves(pointerControlled){
    mobilePhase+=prefersReducedMotion ? .006 : .026;
    if(!mobileWaves.length)mobileWaves.push(createMobileWave(true));
    for(const current of mobileWaves){
      current.progress+=current.speed*(prefersReducedMotion ? .32 : 1);
      if(pointerControlled){
        const pointerNormal=(pointer.x-width*.5)*current.nx+(pointer.y-height*.5)*current.ny;
        const normalSpan=Math.abs(current.nx)*width+Math.abs(current.ny)*height;
        const naturalFront=-normalSpan*.5-radius*1.25+current.progress*(normalSpan+radius*2.5);
        current.shift+=(pointerNormal-naturalFront-current.shift)*.08;
      }else{
        current.shift*=.94;
      }
    }
    if(mobileWaves.length<2&&mobileWaves.some((current)=>current.progress>.48))mobileWaves.push(createMobileWave(false));
    mobileWaves=mobileWaves.filter((current)=>current.progress<1.08);
  }

  function animate(now){
    wave+=prefersReducedMotion ? .008 : .054;
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
    if(width<768)updateMobileWaves(pointerControlled);
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
