attribute vec3 position;
attribute float seed;
uniform float time;
uniform float mode;
uniform float phase;
uniform vec2 resolution;
uniform vec2 pointer;
varying float light;
void main(){
  vec3 p=position;
  float pulse=sin(time*1.4+seed*19.0)*.035;
  p*=1.0+pulse;
  float angle=time*.12;
  p.xz=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p.xz;
  float dispersion=mode==1.0?phase*phase*3.5:(mode==2.0?(1.0-phase)*3.0:0.0);
  p*=1.0+dispersion;
  p+=sin(vec3(seed*33.0,seed*17.0,seed*41.0)+time)*.035;
  vec2 nearPointer=p.xy-pointer*2.2;
  p.xy+=normalize(nearPointer+.001)*.12*exp(-dot(nearPointer,nearPointer)*2.0);
  float depth=5.0-p.z;
  vec2 screen=p.xy/depth*2.1;
  screen.x*=resolution.y/resolution.x;
  gl_Position=vec4(screen,0.0,1.0);
  gl_PointSize=(2.3+seed*2.4)*(resolution.y/800.0)*(4.0/depth);
  light=(.4+.6*sin(seed*63.0+time*.7)*sin(seed*63.0+time*.7))*(1.0-(mode==1.0?phase*.8:0.0));
}
