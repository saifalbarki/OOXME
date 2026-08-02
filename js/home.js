const dotCanvas=document.querySelector('.dot-field');
const homeReveal=document.querySelector('.home-reveal');

if(homeReveal){requestAnimationFrame(()=>homeReveal.classList.add('is-visible'))}

if(dotCanvas){
  const context=dotCanvas.getContext('2d');
  const motionReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width=0;
  let height=0;
  let scale=1;
  let spacing=22;
  let radius=115;
  let orb={x:0,y:0,targetX:0,targetY:0};

  function chooseTarget(){
    const edge=radius*.55;
    orb.targetX=edge+Math.random()*Math.max(1,width-edge*2);
    orb.targetY=edge+Math.random()*Math.max(1,height-edge*2);
  }

  function resize(){
    const bounds=dotCanvas.getBoundingClientRect();
    scale=Math.min(window.devicePixelRatio||1,2);
    width=Math.round(bounds.width);
    height=Math.round(bounds.height);
    dotCanvas.width=Math.round(width*scale);
    dotCanvas.height=Math.round(height*scale);
    context.setTransform(scale,0,0,scale,0,0);
    spacing=width<680?20:28;
    radius=width<680?92:150;
    orb.x=width*.5;
    orb.y=height*.42;
    chooseTarget();
  }

  function draw(){
    context.clearRect(0,0,width,height);
    for(let y=spacing*.5;y<height;y+=spacing){
      for(let x=spacing*.5;x<width;x+=spacing){
        const distance=Math.hypot(x-orb.x,y-orb.y);
        if(distance>=radius)continue;
        const fade=1-distance/radius;
        context.globalAlpha=Math.pow(fade,1.85);
        context.fillStyle='#0d0d0d';
        context.beginPath();
        context.arc(x,y,width<680?1.05:1.25,0,Math.PI*2);
        context.fill();
      }
    }
    context.globalAlpha=1;
  }

  function animate(){
    orb.x+=(orb.targetX-orb.x)*.006;
    orb.y+=(orb.targetY-orb.y)*.006;
    if(Math.hypot(orb.targetX-orb.x,orb.targetY-orb.y)<1.5)chooseTarget();
    draw();
    if(!motionReduced)requestAnimationFrame(animate);
  }

  resize();
  draw();
  if(!motionReduced)animate();
  window.addEventListener('resize',resize,{passive:true});
}
