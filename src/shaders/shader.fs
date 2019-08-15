varying vec2 vUv;
varying float noise;
uniform sampler2D tGrid;

void main() {

    // vec3 color = vec3( vUv * ( 1. - 2. * noise ), 0.0 );
    vec4 color = texture2D( tGrid, vUv );
    gl_FragColor = vec4( color.rgb, 1.0 );

}