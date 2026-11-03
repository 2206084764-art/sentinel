precision mediump float;
varying float light;
void main(){
  float d=length(gl_PointCoord-.5)*2.0;
  if(d>1.0)discard;
  float alpha=pow(1.0-d,1.2)*light*1.6;
  vec3 color=mix(vec3(.667,.8,.012),vec3(.93,1.0,.75),pow(alpha,3.0));
  gl_FragColor=vec4(color,alpha);
}
