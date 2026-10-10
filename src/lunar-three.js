// Export only the primitives used by the entrance so the remaining Three.js modules
// can be removed from the dynamically loaded chunk.
export {
  WebGLRenderer, SRGBColorSpace, ACESFilmicToneMapping, Scene,
  PerspectiveCamera, SphereGeometry, MeshStandardMaterial, Mesh,
  DirectionalLight, AmbientLight, BufferGeometry, Float32BufferAttribute,
  ShaderMaterial, Points, TextureLoader, Vector3,
  BoxGeometry, CylinderGeometry, TorusGeometry, PlaneGeometry,
  Color, Fog, PointLight, PointsMaterial, PCFSoftShadowMap,
} from 'three';
