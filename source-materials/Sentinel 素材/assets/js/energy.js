export class EnergyField {
  constructor(canvas,{mobile=false,reduced=false}={}){this.canvas=canvas;this.mobile=mobile;this.reduced=reduced;this.running=false;this.frame=0;this.mode=0;this.phase=0;this.pointer=[0,0];this.start=performance.now();}
  async init(){
    if(this.reduced)return false;
    const gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return false;this.gl=gl;
    try{
      const sources=await Promise.all(['assets/shaders/energy.vert','assets/shaders/energy.frag'].map(async url=>{const response=await fetch(url);if(!response.ok)throw Error('Shader unavailable');return response.text()}));
      const shaders=sources.map((source,i)=>{const shader=gl.createShader(i?gl.FRAGMENT_SHADER:gl.VERTEX_SHADER);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;});
      const program=gl.createProgram();shaders.forEach(s=>gl.attachShader(program,s));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);this.program=program;shaders.forEach(s=>gl.deleteShader(s));
      const n=this.mobile?950:4200;this.count=n;const points=new Float32Array(n*4),ga=Math.PI*(3-Math.sqrt(5));
      for(let i=0;i<n;i++){const y=1-i/(n-1)*2,r=Math.sqrt(1-y*y),a=i*ga;const wave=1+.035*Math.sin(a*4)+.04*Math.sin(y*25);points.set([Math.cos(a)*r*1.85*wave,y*1.85*wave,Math.sin(a)*r*1.85*wave,Math.random()],i*4)}
      this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);
      const pos=gl.getAttribLocation(program,'position'),seed=gl.getAttribLocation(program,'seed');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(seed);gl.vertexAttribPointer(seed,1,gl.FLOAT,false,16,12);
      this.uniforms=Object.fromEntries(['time','mode','phase','resolution','pointer'].map(key=>[key,gl.getUniformLocation(program,key)]));gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
      this.resize=()=>{const ratio=Math.min(devicePixelRatio,this.mobile?1:1.5);this.canvas.width=Math.round(innerWidth*ratio);this.canvas.height=Math.round(innerHeight*ratio);gl.viewport(0,0,this.canvas.width,this.canvas.height);};this.resize();window.addEventListener('resize',this.resize);
      this.onPointer=e=>{this.pointer=[e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2]};if(!this.mobile)window.addEventListener('pointermove',this.onPointer,{passive:true});
      return true;
    }catch(error){document.documentElement.dataset.particleError=error.message;gl.getExtension('WEBGL_lose_context')?.loseContext();this.gl=null;return false;}
  }
  set(mode='sphere',phase=0,opacity=1){this.mode={sphere:0,burst:1,converge:2}[mode]||0;this.phase=phase;this.canvas.style.opacity=String(opacity);}
  show(inContent=false){if(!this.gl||this.reduced)return;if(inContent)this.canvas.classList.remove('ambient');this.canvas.classList.toggle('in-content',inContent);if(this.running)return;this.running=true;this.canvas.style.opacity='1';this.tick();}
  tick=()=>{if(!this.running)return;const gl=this.gl,u=this.uniforms;gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(u.time,(performance.now()-this.start)/1000);gl.uniform1f(u.mode,this.mode);gl.uniform1f(u.phase,this.phase);gl.uniform2f(u.resolution,this.canvas.width,this.canvas.height);gl.uniform2f(u.pointer,...this.pointer);gl.drawArrays(gl.POINTS,0,this.count);this.frame=requestAnimationFrame(this.tick);};
  hide(){this.running=false;cancelAnimationFrame(this.frame);this.canvas.style.opacity='0';}
  destroy(){this.hide();window.removeEventListener('resize',this.resize);window.removeEventListener('pointermove',this.onPointer);if(this.gl){this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);this.gl.getExtension('WEBGL_lose_context')?.loseContext();}}
}
