import { v4 as generateId } from 'uuid'
import { useCallback, useEffect } from "react"
import SuperVizRoom, { Comments } from '@superviz/sdk'
import * as THREE from 'three'
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Presence3D, ThreeJsPin } from '@superviz/threejs-plugin';

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string

const ROOM_ID = 'threejs-tutorial'
const PLAYER_ID = generateId()

export default function App() {
  useEffect(() => {
    initializeThreeJs()
  }, [])

  const initializeSuperViz = useCallback(async (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) => { 
    const superviz = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: { 
        id: PLAYER_ID,
        name: 'player-name',
      },
      group: { 
        id: 'threejs-tutorial',
        name: 'threejs-tutorial',
      }
    })

    const presence = new Presence3D(scene, camera, camera)
    const pinAdapter = new ThreeJsPin(scene, renderer, camera)
    const comments = new Comments(pinAdapter, {
      buttonLocation: 'top-right',
    })

    superviz.addComponent(presence)
    superviz.addComponent(comments)
  }, [])

  const initializeThreeJs = useCallback(async () => {
    const canvas = document.getElementById('showcase') as HTMLCanvasElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height)

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb6b7b8);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 300);
    camera.position.set(2, 0, 2);
  
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;
  
    const loader = new GLTFLoader();
    loader.load(
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb",
      (model: GLTF) => { 
        scene.add(model.scene)
        initializeSuperViz(scene, camera, renderer)
      },
      undefined,
      (e: unknown) => {
        console.error(e)
      }
    );
  
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
  
      renderer.render(scene, camera);
    };
  
    animate();
  }, [initializeSuperViz])



  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Three.JS</h1>
      </header>
      <main className='w-full h-full flex items-center justify-center relative'>
        <canvas id='showcase' className='w-full h-full' />
      </main>
    </div>
  )
}