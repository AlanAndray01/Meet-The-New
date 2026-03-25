'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { getDeviceConfig } from '@/utils/deviceConfig';
import { getQualityPreset } from '@/utils/qualityPresets';
import styles from './3DModel.module.css';

export default function Model3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!isLoaded || !el || typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const THREE = (window as any).THREE;
    if (!THREE) return;

    const nearDist = 0.1;
    const farDist = 10000;

    const scene = new THREE.Scene();
    
    // Get detected device tier and preset
    let preset = null;
    try {
      const config = getDeviceConfig();
      preset = getQualityPreset(config.tier);
    } catch (error) {
      console.warn('[3DModel] Device config not available, using defaults:', error);
    }

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      nearDist,
      farDist
    );
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 500;

    const pixelRatio = preset?.pixelRatio ?? (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1);
    const antialias = preset?.antialias ?? true;

    const renderer = new THREE.WebGLRenderer({ antialias: antialias });
    renderer.setClearColor("#4DD0E1");
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    el.appendChild(renderer.domElement);

    // ADD LIGHTS
    const ambientLightIntensity = preset?.ambientLightIntensity ?? 0.64;
    const directionalLightIntensity = preset?.directionalLightIntensity ?? 1.1;

    // A slightly warm ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    scene.add(ambientLight);

    // Main directional light (key light)
    const dirLight = new THREE.DirectionalLight(0xfff0f0, directionalLightIntensity);
    dirLight.position.set(200, 400, 300);
    scene.add(dirLight);

    // Fill light to add reflections from the other side
    const fillLight = new THREE.DirectionalLight(0xebeeff, 0.8);
    fillLight.position.set(-300, -100, -200);
    scene.add(fillLight);

    // Top-down hemisphere light for a soft studio look
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    // CREATE BUBBLES
    const cubeSize = 120; // preserved for typography positioning
    const bubbleSize = 60;
    const sphereSegments = (preset?.sphereSegments ?? 32) * 1.5; // Bump quality
    const geometry = new THREE.SphereBufferGeometry(bubbleSize, sphereSegments, sphereSegments);
    
    // Using MeshNormalMaterial to match the requested style for both balls and typography
    const material = new THREE.MeshNormalMaterial();
    
    const group = new THREE.Group();
    
    for (let i = 0; i < 350; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      const dist = farDist / 3;
      const distDouble = dist * 2;
      const tau = 2 * Math.PI;

      mesh.position.x = Math.random() * distDouble - dist;
      mesh.position.y = Math.random() * distDouble - dist;
      mesh.position.z = Math.random() * distDouble - dist;
      mesh.rotation.x = Math.random() * tau;
      mesh.rotation.y = Math.random() * tau;
      mesh.rotation.z = Math.random() * tau;

      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();

      group.add(mesh);
    }
    scene.add(group);

    // CREATE TYPOGRAPHY
    const loader = new THREE.FontLoader();
    const textMesh = new THREE.Mesh();
    let textGeomLoaded = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createTypo = (font: any) => {
      const typoProperties = {
        font: font,
        size: cubeSize,
        height: cubeSize / 2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 6,
        bevelOffset: 1,
        bevelSegments: 8
      };

      // Top text
      const text1 = new THREE.TextGeometry("We build", typoProperties);
      text1.computeBoundingBox();
      const mesh1 = new THREE.Mesh(text1, material);
      const xOffset1 = -0.5 * (text1.boundingBox.max.x - text1.boundingBox.min.x);
      mesh1.position.set(xOffset1, cubeSize * 0.6, 0);

      // Bottom text
      const text2 = new THREE.TextGeometry("Creativity.", typoProperties);
      text2.computeBoundingBox();
      const mesh2 = new THREE.Mesh(text2, material);
      const xOffset2 = -0.5 * (text2.boundingBox.max.x - text2.boundingBox.min.x);
      mesh2.position.set(xOffset2, -cubeSize * 0.6, 0);

      textMesh.add(mesh1);
      textMesh.add(mesh2);
      textMesh.position.z = cubeSize * -1;
      
      scene.add(textMesh);
      textGeomLoaded = true;
    };

    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      createTypo
    );

    // MOUSE/TOUCH OVER EFFECT
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - windowHalfX) * 10;
      mouseY = (e.clientY - windowHalfY) * 10;
    };
    
    document.addEventListener("mousemove", onMouseMove, false);

    // RENDER LOOP
    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (mouseY * -1 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      const t = Date.now() * 0.001;
      const rx = Math.sin(t * 0.7) * 0.5;
      const ry = Math.sin(t * 0.3) * 0.5;
      const rz = Math.sin(t * 0.2) * 0.5;
      
      group.rotation.x = rx;
      group.rotation.y = ry;
      group.rotation.z = rz;
      
      if (textGeomLoaded) {
        textMesh.rotation.x = rx;
        textMesh.rotation.y = ry;
        textMesh.rotation.z = rx;
      }

      renderer.render(scene, camera);
    };
    render();

    // RESIZE CANVAS
    const resizeCanvas = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resizeCanvas, false);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("mousemove", onMouseMove, false);
      window.removeEventListener("resize", resizeCanvas, false);
      
      if (el) {
        el.innerHTML = '';
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (textMesh.geometry) textMesh.geometry.dispose();
    };
  }, [isLoaded]);

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/108/three.min.js" 
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      <div 
        ref={containerRef} 
        id="canvas-wrapper" 
        aria-label="floating" 
        className={styles.modal3D}
      />
    </>
  );
}
