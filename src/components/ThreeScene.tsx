import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Google Color palette (Blue, Red, Yellow, Green)
const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

// Smooth curved line with color changes
function CurvedExtendingLine({ startX, startY, phaseOffset }: any) {
    const lineRef = useRef<THREE.Line>(null);
    const materialRef = useRef<THREE.LineBasicMaterial>(null);
    const pointCount = 80;
    const colorIndex = useRef(Math.floor(Math.random() * colors.length));
    const nextColorTime = useRef(0);
    const currentColor = useRef(new THREE.Color(colors[colorIndex.current]));
    const targetColor = useRef(new THREE.Color(colors[colorIndex.current]));

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(pointCount * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Random color change
        if (t > nextColorTime.current) {
            colorIndex.current = Math.floor(Math.random() * colors.length);
            targetColor.current.set(colors[colorIndex.current]);
            nextColorTime.current = t + 3 + Math.random() * 4;
        }

        // Smooth color lerp
        currentColor.current.lerp(targetColor.current, 0.02);
        if (materialRef.current) {
            materialRef.current.color.copy(currentColor.current);
        }

        // Always show full animation (no scroll dependency)
        const positions = geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < pointCount; i++) {
            const progress = i / pointCount;
            const baseX = startX + progress * 6;
            const baseY = startY - progress * 5;
            const wave = Math.sin(progress * 3 * Math.PI + t * 1.5 + phaseOffset) * 0.4;
            const angle = Math.atan2(-5, 6);

            positions[i * 3] = baseX + wave * -Math.sin(angle);
            positions[i * 3 + 1] = baseY + wave * Math.cos(angle);
            positions[i * 3 + 2] = 0;
        }

        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <line ref={lineRef} geometry={geometry}>
            <lineBasicMaterial ref={materialRef} color={colors[colorIndex.current]} linewidth={2} />
        </line>
    );
}

// Morphing note with very smooth, visible transitions and color changes
function MorphingNote({ startX, startY, scale, speed, phaseOffset }: any) {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Mesh>(null);
    const stemRef = useRef<THREE.Mesh>(null);
    const flag1Ref = useRef<THREE.Mesh>(null);
    const flag2Ref = useRef<THREE.Mesh>(null);
    const restRef = useRef<THREE.Group>(null);
    const restPart1Ref = useRef<THREE.Mesh>(null);
    const restPart2Ref = useRef<THREE.Mesh>(null);

    // Color management
    const colorIndex = useRef(Math.floor(Math.random() * colors.length));
    const nextColorTime = useRef(0);
    const currentColor = useRef(new THREE.Color(colors[colorIndex.current]));
    const targetColor = useRef(new THREE.Color(colors[colorIndex.current]));

    // Smooth morphing values with staggered timing
    const morphValues = useRef({
        headScale: 1,
        headRotation: 0,
        headY: 0,
        stemScale: 1,
        stemRotation: 0,
        flag1Scale: 0,
        flag1Rotation: 0,
        flag2Scale: 0,
        flag2Rotation: 0,
        restScale: 0,
        restRotation: 0,
    });

    // Previous targets for detecting changes
    const prevType = useRef(0);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Random color change
        if (t > nextColorTime.current) {
            colorIndex.current = Math.floor(Math.random() * colors.length);
            targetColor.current.set(colors[colorIndex.current]);
            nextColorTime.current = t + 2 + Math.random() * 3;
        }
        currentColor.current.lerp(targetColor.current, 0.025);

        let scrollProgress = 0;
        if (typeof window !== 'undefined') {
            const scroll = window.scrollY || 0;
            const height = window.innerHeight || 1;
            scrollProgress = Math.min(scroll / height, 5.0);
        }
        if (!Number.isFinite(scrollProgress)) scrollProgress = 0;

        const extensionProgress = 0.1 + scrollProgress * 0.9;

        // Slower morph cycle for more visible transitions
        const morphCycle = (t * 0.15 + phaseOffset) % 4;
        const currentType = Math.floor(morphCycle);
        const transitionProgress = morphCycle % 1; // 0-1 within each type

        // Smooth easing function for transitions
        const easeInOut = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

        // Calculate a "transition zone" at the boundaries
        const transitionZone = 0.4; // Size of transition zone (0-1)
        let transitionFactor = 0;
        if (transitionProgress > 1 - transitionZone) {
            transitionFactor = easeInOut((transitionProgress - (1 - transitionZone)) / transitionZone);
        }

        // Target values based on note type with smooth interpolation
        let targetHead = 1, targetHeadY = 0, targetHeadRot = 0;
        let targetStem = 1, targetStemRot = 0;
        let targetFlag1 = 0, targetFlag1Rot = 0;
        let targetFlag2 = 0, targetFlag2Rot = 0;
        let targetRest = 0, targetRestRot = 0;

        // Current type targets
        if (currentType === 0) {
            // Quarter note - larger head, no flags
            targetHead = 1.4; targetHeadY = 0; targetHeadRot = 0;
            targetStem = 1; targetStemRot = 0;
            targetFlag1 = 0; targetFlag2 = 0; targetRest = 0;
        } else if (currentType === 1) {
            // 8th note - one flag emerges
            targetHead = 1; targetHeadY = 0;
            targetStem = 1; targetStemRot = 0;
            targetFlag1 = 1; targetFlag1Rot = 0;
            targetFlag2 = 0; targetRest = 0;
        } else if (currentType === 2) {
            // 16th note - two flags
            targetHead = 0.9; targetHeadY = 0;
            targetStem = 1; targetStemRot = 0;
            targetFlag1 = 1; targetFlag1Rot = 0;
            targetFlag2 = 1; targetFlag2Rot = 0;
            targetRest = 0;
        } else {
            // Rest - transform into rest shape
            targetHead = 0; targetHeadY = 0.2;
            targetStem = 0; targetStemRot = Math.PI * 0.5;
            targetFlag1 = 0; targetFlag2 = 0;
            targetRest = 1; targetRestRot = 0;
        }

        // Very slow lerp for extremely smooth visible transitions
        // Different speeds for different elements create staggered effect
        const headLerp = 0.015;
        const stemLerp = 0.02;
        const flag1Lerp = 0.025;
        const flag2Lerp = 0.018;
        const restLerp = 0.022;

        morphValues.current.headScale += (targetHead - morphValues.current.headScale) * headLerp;
        morphValues.current.headY += (targetHeadY - morphValues.current.headY) * headLerp;
        morphValues.current.headRotation += (targetHeadRot - morphValues.current.headRotation) * headLerp;

        morphValues.current.stemScale += (targetStem - morphValues.current.stemScale) * stemLerp;
        morphValues.current.stemRotation += (targetStemRot - morphValues.current.stemRotation) * stemLerp;

        morphValues.current.flag1Scale += (targetFlag1 - morphValues.current.flag1Scale) * flag1Lerp;
        morphValues.current.flag1Rotation += (targetFlag1Rot - morphValues.current.flag1Rotation) * flag1Lerp;

        morphValues.current.flag2Scale += (targetFlag2 - morphValues.current.flag2Scale) * flag2Lerp;
        morphValues.current.flag2Rotation += (targetFlag2Rot - morphValues.current.flag2Rotation) * flag2Lerp;

        morphValues.current.restScale += (targetRest - morphValues.current.restScale) * restLerp;
        morphValues.current.restRotation += (targetRestRot - morphValues.current.restRotation) * restLerp;

        // Position animation
        if (groupRef.current) {
            const noteProgress = ((Math.sin(t * speed + phaseOffset) + 1) / 2) * extensionProgress;
            const baseX = startX + noteProgress * 6;
            const baseY = startY - noteProgress * 5;
            const wave = Math.sin(noteProgress * 3 * Math.PI + t * 1.5 + phaseOffset) * 0.4;
            const angle = Math.atan2(-5, 6);

            groupRef.current.position.x = baseX + wave * -Math.sin(angle);
            groupRef.current.position.y = baseY + wave * Math.cos(angle);

            // Add subtle rotation during morphing
            const morphActivity = Math.abs(targetHead - morphValues.current.headScale) +
                Math.abs(targetStem - morphValues.current.stemScale);
            groupRef.current.rotation.z = Math.sin(t * 2 + phaseOffset) * 0.15 + morphActivity * 0.3;
        }

        // Apply smooth morphing with additional animation effects
        if (headRef.current) {
            const breathe = 1 + Math.sin(t * 3 + phaseOffset) * 0.05;
            headRef.current.scale.setScalar(morphValues.current.headScale * breathe);
            headRef.current.position.y = morphValues.current.headY;
            headRef.current.rotation.z = morphValues.current.headRotation + Math.sin(t * 2) * 0.1;
            (headRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (stemRef.current) {
            const scaleY = morphValues.current.stemScale;
            stemRef.current.scale.set(morphValues.current.stemScale, scaleY, morphValues.current.stemScale);
            stemRef.current.rotation.x = morphValues.current.stemRotation * 0.1;
            // Move stem up/down during scale change for smooth transition
            stemRef.current.position.y = 1.0 + (1 - scaleY) * 0.3;
            (stemRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (flag1Ref.current) {
            const breathe = 1 + Math.sin(t * 4 + phaseOffset) * 0.08;
            flag1Ref.current.scale.setScalar(morphValues.current.flag1Scale * breathe);
            // Swing in from the side during appearance
            flag1Ref.current.rotation.z = -0.4 + (1 - morphValues.current.flag1Scale) * 0.8;
            flag1Ref.current.position.x = 0.65 - (1 - morphValues.current.flag1Scale) * 0.3;
            (flag1Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (flag2Ref.current) {
            const breathe = 1 + Math.sin(t * 4.5 + phaseOffset + 0.5) * 0.08;
            flag2Ref.current.scale.setScalar(morphValues.current.flag2Scale * breathe);
            // Swing in from the side during appearance
            flag2Ref.current.rotation.z = -0.4 + (1 - morphValues.current.flag2Scale) * 0.8;
            flag2Ref.current.position.x = 0.6 - (1 - morphValues.current.flag2Scale) * 0.3;
            (flag2Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (restRef.current) {
            restRef.current.scale.setScalar(morphValues.current.restScale);
            // Spin during appearance
            restRef.current.rotation.z = morphValues.current.restRotation +
                (1 - morphValues.current.restScale) * Math.PI * 2 +
                Math.sin(t * 3) * 0.2;
        }

        if (restPart1Ref.current) {
            (restPart1Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }
        if (restPart2Ref.current) {
            (restPart2Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        prevType.current = currentType;
    });

    const initialColor = colors[colorIndex.current];

    return (
        <group ref={groupRef} scale={scale}>
            {/* Note head - scales and breathes */}
            <mesh ref={headRef}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>

            {/* Stem - stretches and rotates */}
            <mesh ref={stemRef} position={[0.3, 1.0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 1.8, 16]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>

            {/* Flag 1 - swings in */}
            <mesh ref={flag1Ref} position={[0.65, 1.6, 0]} rotation={[0, 0, -0.4]}>
                <boxGeometry args={[0.7, 0.18, 0.05]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>

            {/* Flag 2 - swings in slightly delayed */}
            <mesh ref={flag2Ref} position={[0.6, 1.3, 0]} rotation={[0, 0, -0.4]}>
                <boxGeometry args={[0.6, 0.15, 0.05]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>

            {/* Rest symbol - spins in */}
            <group ref={restRef}>
                <mesh ref={restPart1Ref} position={[0, 0.3, 0]} rotation={[0, 0, 0.3]}>
                    <boxGeometry args={[0.15, 0.6, 0.08]} />
                    <meshStandardMaterial color={initialColor} metalness={0.6} roughness={0.2} />
                </mesh>
                <mesh ref={restPart2Ref} position={[0.15, 0, 0]} rotation={[0, 0, -0.3]}>
                    <boxGeometry args={[0.15, 0.5, 0.08]} />
                    <meshStandardMaterial color={initialColor} metalness={0.6} roughness={0.2} />
                </mesh>
            </group>
        </group>
    );
}

function MusicScene() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.rotation.y = Math.sin(t * 0.12) * 0.08;
        }
    });

    // 5 staff lines (standard musical notation)
    const staffLines = [
        { x: -4.5, y: 3.5, phase: 0 },    // Line E (top)
        { x: -4.5, y: 3.0, phase: 0.4 },  // Line G
        { x: -4.5, y: 2.5, phase: 0.8 },  // Line B
        { x: -4.5, y: 2.0, phase: 1.2 },  // Line D
        { x: -4.5, y: 1.5, phase: 1.6 },  // Line F (bottom)
    ];

    // Musical scale positions (relative to staff)
    // Each note follows a different melody pattern
    const melodyPatterns = [
        [0, 2, 4, 5, 7, 5, 4, 2],      // C Major scale up and down
        [7, 5, 4, 2, 0, 2, 4, 5],      // Descending then ascending
        [0, 4, 7, 12, 7, 4, 0, -5],    // Arpeggio pattern
        [2, 4, 5, 7, 9, 7, 5, 4],      // D to A melody
        [5, 7, 9, 12, 9, 7, 5, 4],     // F to high C and back
    ];

    return (
        <group ref={group}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
            <pointLight position={[-8, 3, 8]} intensity={2} color="#fbbf24" />
            <pointLight position={[5, -5, 5]} intensity={1.2} color="#a78bfa" />

            {/* Staff lines */}
            {staffLines.map((line, i) => (
                <CurvedExtendingLine
                    key={`line-${i}`}
                    startX={line.x}
                    startY={line.y}
                    phaseOffset={line.phase}
                />
            ))}

            {/* Musical notes with melody patterns */}
            {melodyPatterns.map((melody, i) => (
                <MelodyNote
                    key={`note-${i}`}
                    baseX={-4.5}
                    baseY={2.5}
                    scale={0.22 + (i % 3) * 0.02}
                    speed={0.3 + i * 0.03}
                    phaseOffset={i * 0.8}
                    melody={melody}
                />
            ))}

            {/* Morphing Musical Symbols */}
            <MorphingSymbol baseX={-4.5} baseY={2.5} scale={0.3} speed={0.25} phaseOffset={2.5} />
            <MorphingSymbol baseX={-4.5} baseY={2.5} scale={0.25} speed={0.2} phaseOffset={4.0} />

            {/* Treble Clef */}
            <TrebleClef />
        </group>
    );
}

// Treble Clef using Unicode character
function TrebleClef() {
    const groupRef = useRef<THREE.Group>(null);
    const colorIndex = useRef(Math.floor(Math.random() * colors.length));
    const nextColorTime = useRef(0);
    const currentColorHex = useRef(colors[colorIndex.current]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Color change
        if (t > nextColorTime.current) {
            colorIndex.current = Math.floor(Math.random() * colors.length);
            currentColorHex.current = colors[colorIndex.current];
            nextColorTime.current = t + 3 + Math.random() * 2;
        }

        if (groupRef.current) {
            // Gentle floating
            groupRef.current.position.y = 2.5 + Math.sin(t * 0.6) * 0.2;
            groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={[-5.8, 2.5, 0.5]}>
            <Text
                fontSize={2.5}
                color={currentColorHex.current}
                anchorX="center"
                anchorY="middle"
            >
                𝄞
            </Text>
        </group>
    );
}

// Morphing Musical Symbol (crescendo, decrescendo, fermata, accent)
function MorphingSymbol({ baseX, baseY, scale, speed, phaseOffset }: any) {
    const groupRef = useRef<THREE.Group>(null);

    // Symbol parts refs
    const crescendo1Ref = useRef<THREE.Mesh>(null);
    const crescendo2Ref = useRef<THREE.Mesh>(null);
    const fermataArcRef = useRef<THREE.Mesh>(null);
    const fermataDotRef = useRef<THREE.Mesh>(null);
    const accentRef = useRef<THREE.Mesh>(null);

    // Color management
    const colorIndex = useRef(Math.floor(Math.random() * colors.length));
    const nextColorTime = useRef(0);
    const currentColor = useRef(new THREE.Color(colors[colorIndex.current]));
    const targetColor = useRef(new THREE.Color(colors[colorIndex.current]));

    // Morph values
    const morphValues = useRef({
        crescendoScale: 1,
        crescendoRotation: 0,
        fermataScale: 0,
        accentScale: 0,
    });

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Color change
        if (t > nextColorTime.current) {
            colorIndex.current = Math.floor(Math.random() * colors.length);
            targetColor.current.set(colors[colorIndex.current]);
            nextColorTime.current = t + 2.5 + Math.random() * 2;
        }
        currentColor.current.lerp(targetColor.current, 0.025);

        // Symbol type morphing cycle (4 types)
        const morphCycle = (t * 0.2 + phaseOffset) % 4;
        const currentType = Math.floor(morphCycle);

        // Target values
        let targetCrescendo = 0, targetCrescendoRot = 0;
        let targetFermata = 0;
        let targetAccent = 0;

        if (currentType === 0) {
            // Crescendo <
            targetCrescendo = 1; targetCrescendoRot = 0;
        } else if (currentType === 1) {
            // Decrescendo >
            targetCrescendo = 1; targetCrescendoRot = Math.PI;
        } else if (currentType === 2) {
            // Fermata
            targetFermata = 1;
        } else {
            // Accent
            targetAccent = 1;
        }

        // Smooth lerp
        const lerpSpeed = 0.02;
        morphValues.current.crescendoScale += (targetCrescendo - morphValues.current.crescendoScale) * lerpSpeed;
        morphValues.current.crescendoRotation += (targetCrescendoRot - morphValues.current.crescendoRotation) * lerpSpeed;
        morphValues.current.fermataScale += (targetFermata - morphValues.current.fermataScale) * lerpSpeed;
        morphValues.current.accentScale += (targetAccent - morphValues.current.accentScale) * lerpSpeed;

        // Position along staff (like notes)
        if (groupRef.current) {
            const noteProgress = (Math.sin(t * speed + phaseOffset) + 1) / 2;
            const diagX = baseX + noteProgress * 6;
            const diagY = baseY - noteProgress * 5;
            const wave = Math.sin(noteProgress * 3 * Math.PI + t * 1.5 + phaseOffset) * 0.4;
            const angle = Math.atan2(-5, 6);

            groupRef.current.position.x = diagX + wave * -Math.sin(angle);
            groupRef.current.position.y = diagY + wave * Math.cos(angle);
            groupRef.current.rotation.z = Math.sin(t * 1.5 + phaseOffset) * 0.1;
        }

        // Apply morphing to crescendo/decrescendo
        if (crescendo1Ref.current && crescendo2Ref.current) {
            const s = morphValues.current.crescendoScale;
            crescendo1Ref.current.scale.set(s, s, s);
            crescendo2Ref.current.scale.set(s, s, s);
            crescendo1Ref.current.rotation.z = morphValues.current.crescendoRotation + 0.4;
            crescendo2Ref.current.rotation.z = morphValues.current.crescendoRotation - 0.4;
            (crescendo1Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
            (crescendo2Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        // Apply morphing to fermata
        if (fermataArcRef.current && fermataDotRef.current) {
            const s = morphValues.current.fermataScale;
            fermataArcRef.current.scale.set(s, s, s);
            fermataDotRef.current.scale.set(s, s, s);
            (fermataArcRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
            (fermataDotRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        // Apply morphing to accent
        if (accentRef.current) {
            const s = morphValues.current.accentScale;
            accentRef.current.scale.set(s, s, s);
            accentRef.current.rotation.z = Math.sin(t * 3) * 0.2;
            (accentRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }
    });

    const initialColor = colors[colorIndex.current];

    return (
        <group ref={groupRef} scale={scale}>
            {/* Crescendo/Decrescendo - two angled bars forming < or > */}
            <mesh ref={crescendo1Ref} position={[0.3, 0.2, 0]} rotation={[0, 0, 0.4]}>
                <boxGeometry args={[0.8, 0.12, 0.08]} />
                <meshStandardMaterial color={initialColor} metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh ref={crescendo2Ref} position={[0.3, -0.2, 0]} rotation={[0, 0, -0.4]}>
                <boxGeometry args={[0.8, 0.12, 0.08]} />
                <meshStandardMaterial color={initialColor} metalness={0.7} roughness={0.2} />
            </mesh>

            {/* Fermata - arc with dot */}
            <mesh ref={fermataArcRef} position={[0, 0.15, 0]} rotation={[0, 0, Math.PI]}>
                <torusGeometry args={[0.4, 0.08, 16, 32, Math.PI]} />
                <meshStandardMaterial color={initialColor} metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh ref={fermataDotRef} position={[0, -0.15, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color={initialColor} metalness={0.7} roughness={0.2} />
            </mesh>

            {/* Accent - triangle shape */}
            <mesh ref={accentRef} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.25, 0.8, 3]} />
                <meshStandardMaterial color={initialColor} metalness={0.7} roughness={0.2} />
            </mesh>
        </group>
    );
}


// Note that follows a melody pattern
function MelodyNote({ baseX, baseY, scale, speed, phaseOffset, melody }: any) {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Mesh>(null);
    const stemRef = useRef<THREE.Mesh>(null);
    const flag1Ref = useRef<THREE.Mesh>(null);
    const flag2Ref = useRef<THREE.Mesh>(null);
    const restRef = useRef<THREE.Group>(null);
    const restPart1Ref = useRef<THREE.Mesh>(null);
    const restPart2Ref = useRef<THREE.Mesh>(null);

    // Color management
    const colorIndex = useRef(Math.floor(Math.random() * colors.length));
    const nextColorTime = useRef(0);
    const currentColor = useRef(new THREE.Color(colors[colorIndex.current]));
    const targetColor = useRef(new THREE.Color(colors[colorIndex.current]));

    // Smooth morphing values
    const morphValues = useRef({
        headScale: 1,
        headRotation: 0,
        headY: 0,
        stemScale: 1,
        stemRotation: 0,
        flag1Scale: 0,
        flag1Rotation: 0,
        flag2Scale: 0,
        flag2Rotation: 0,
        restScale: 0,
        restRotation: 0,
    });

    // Melody position tracking
    const currentMelodyY = useRef(0);
    const targetMelodyY = useRef(0);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Random color change
        if (t > nextColorTime.current) {
            colorIndex.current = Math.floor(Math.random() * colors.length);
            targetColor.current.set(colors[colorIndex.current]);
            nextColorTime.current = t + 2 + Math.random() * 3;
        }
        currentColor.current.lerp(targetColor.current, 0.025);

        // Calculate current melody position
        const melodySpeed = 0.5 + phaseOffset * 0.1;
        const melodyIndex = Math.floor((t * melodySpeed + phaseOffset * 2) % melody.length);
        const nextMelodyIndex = (melodyIndex + 1) % melody.length;
        const melodyProgress = ((t * melodySpeed + phaseOffset * 2) % melody.length) - melodyIndex;

        // Interpolate between melody notes
        const currentNote = melody[melodyIndex];
        const nextNote = melody[nextMelodyIndex];
        const noteSpacing = 0.25; // Y spacing per semitone
        targetMelodyY.current = currentNote * noteSpacing + (nextNote - currentNote) * noteSpacing * melodyProgress;

        // Smooth movement to target melody position
        currentMelodyY.current += (targetMelodyY.current - currentMelodyY.current) * 0.05;

        // Slower morph cycle for visible transitions
        const morphCycle = (t * 0.15 + phaseOffset) % 4;
        const currentType = Math.floor(morphCycle);

        // Target values based on note type
        let targetHead = 1, targetHeadY = 0, targetHeadRot = 0;
        let targetStem = 1, targetStemRot = 0;
        let targetFlag1 = 0, targetFlag1Rot = 0;
        let targetFlag2 = 0, targetFlag2Rot = 0;
        let targetRest = 0, targetRestRot = 0;

        if (currentType === 0) {
            targetHead = 1.4; targetHeadY = 0; targetHeadRot = 0;
            targetStem = 1; targetStemRot = 0;
            targetFlag1 = 0; targetFlag2 = 0; targetRest = 0;
        } else if (currentType === 1) {
            targetHead = 1; targetHeadY = 0;
            targetStem = 1; targetStemRot = 0;
            targetFlag1 = 1; targetFlag1Rot = 0;
            targetFlag2 = 0; targetRest = 0;
        } else if (currentType === 2) {
            targetHead = 0.9; targetHeadY = 0;
            targetStem = 1; targetStemRot = 0;
            targetFlag1 = 1; targetFlag1Rot = 0;
            targetFlag2 = 1; targetFlag2Rot = 0;
            targetRest = 0;
        } else {
            targetHead = 0; targetHeadY = 0.2;
            targetStem = 0; targetStemRot = Math.PI * 0.5;
            targetFlag1 = 0; targetFlag2 = 0;
            targetRest = 1; targetRestRot = 0;
        }

        // Very slow lerp for smooth transitions
        const headLerp = 0.015;
        const stemLerp = 0.02;
        const flag1Lerp = 0.025;
        const flag2Lerp = 0.018;
        const restLerp = 0.022;

        morphValues.current.headScale += (targetHead - morphValues.current.headScale) * headLerp;
        morphValues.current.headY += (targetHeadY - morphValues.current.headY) * headLerp;
        morphValues.current.headRotation += (targetHeadRot - morphValues.current.headRotation) * headLerp;
        morphValues.current.stemScale += (targetStem - morphValues.current.stemScale) * stemLerp;
        morphValues.current.stemRotation += (targetStemRot - morphValues.current.stemRotation) * stemLerp;
        morphValues.current.flag1Scale += (targetFlag1 - morphValues.current.flag1Scale) * flag1Lerp;
        morphValues.current.flag1Rotation += (targetFlag1Rot - morphValues.current.flag1Rotation) * flag1Lerp;
        morphValues.current.flag2Scale += (targetFlag2 - morphValues.current.flag2Scale) * flag2Lerp;
        morphValues.current.flag2Rotation += (targetFlag2Rot - morphValues.current.flag2Rotation) * flag2Lerp;
        morphValues.current.restScale += (targetRest - morphValues.current.restScale) * restLerp;
        morphValues.current.restRotation += (targetRestRot - morphValues.current.restRotation) * restLerp;

        // Position with melody movement (no scroll dependency - always full animation)
        if (groupRef.current) {
            const noteProgress = (Math.sin(t * speed + phaseOffset) + 1) / 2;
            const diagX = baseX + noteProgress * 6;
            const diagY = baseY - noteProgress * 5;
            const wave = Math.sin(noteProgress * 3 * Math.PI + t * 1.5 + phaseOffset) * 0.4;
            const angle = Math.atan2(-5, 6);

            // Add melody Y offset
            groupRef.current.position.x = diagX + wave * -Math.sin(angle);
            groupRef.current.position.y = diagY + wave * Math.cos(angle) + currentMelodyY.current;

            const morphActivity = Math.abs(targetHead - morphValues.current.headScale) +
                Math.abs(targetStem - morphValues.current.stemScale);
            groupRef.current.rotation.z = Math.sin(t * 2 + phaseOffset) * 0.15 + morphActivity * 0.3;
        }

        // Apply morphing
        if (headRef.current) {
            const breathe = 1 + Math.sin(t * 3 + phaseOffset) * 0.05;
            headRef.current.scale.setScalar(morphValues.current.headScale * breathe);
            headRef.current.position.y = morphValues.current.headY;
            headRef.current.rotation.z = morphValues.current.headRotation + Math.sin(t * 2) * 0.1;
            (headRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (stemRef.current) {
            const scaleY = morphValues.current.stemScale;
            stemRef.current.scale.set(morphValues.current.stemScale, scaleY, morphValues.current.stemScale);
            stemRef.current.rotation.x = morphValues.current.stemRotation * 0.1;
            stemRef.current.position.y = 1.0 + (1 - scaleY) * 0.3;
            (stemRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (flag1Ref.current) {
            const breathe = 1 + Math.sin(t * 4 + phaseOffset) * 0.08;
            flag1Ref.current.scale.setScalar(morphValues.current.flag1Scale * breathe);
            flag1Ref.current.rotation.z = -0.4 + (1 - morphValues.current.flag1Scale) * 0.8;
            flag1Ref.current.position.x = 0.65 - (1 - morphValues.current.flag1Scale) * 0.3;
            (flag1Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (flag2Ref.current) {
            const breathe = 1 + Math.sin(t * 4.5 + phaseOffset + 0.5) * 0.08;
            flag2Ref.current.scale.setScalar(morphValues.current.flag2Scale * breathe);
            flag2Ref.current.rotation.z = -0.4 + (1 - morphValues.current.flag2Scale) * 0.8;
            flag2Ref.current.position.x = 0.6 - (1 - morphValues.current.flag2Scale) * 0.3;
            (flag2Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }

        if (restRef.current) {
            restRef.current.scale.setScalar(morphValues.current.restScale);
            restRef.current.rotation.z = morphValues.current.restRotation +
                (1 - morphValues.current.restScale) * Math.PI * 2 +
                Math.sin(t * 3) * 0.2;
        }

        if (restPart1Ref.current) {
            (restPart1Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }
        if (restPart2Ref.current) {
            (restPart2Ref.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
        }
    });

    const initialColor = colors[colorIndex.current];

    return (
        <group ref={groupRef} scale={scale}>
            <mesh ref={headRef}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>
            <mesh ref={stemRef} position={[0.3, 1.0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 1.8, 16]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>
            <mesh ref={flag1Ref} position={[0.65, 1.6, 0]} rotation={[0, 0, -0.4]}>
                <boxGeometry args={[0.7, 0.18, 0.05]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>
            <mesh ref={flag2Ref} position={[0.6, 1.3, 0]} rotation={[0, 0, -0.4]}>
                <boxGeometry args={[0.6, 0.15, 0.05]} />
                <meshStandardMaterial color={initialColor} metalness={0.8} roughness={0.12} />
            </mesh>
            <group ref={restRef}>
                <mesh ref={restPart1Ref} position={[0, 0.3, 0]} rotation={[0, 0, 0.3]}>
                    <boxGeometry args={[0.15, 0.6, 0.08]} />
                    <meshStandardMaterial color={initialColor} metalness={0.6} roughness={0.2} />
                </mesh>
                <mesh ref={restPart2Ref} position={[0.15, 0, 0]} rotation={[0, 0, -0.3]}>
                    <boxGeometry args={[0.15, 0.5, 0.08]} />
                    <meshStandardMaterial color={initialColor} metalness={0.6} roughness={0.2} />
                </mesh>
            </group>
        </group>
    );
}

// Responsive camera component
function ResponsiveCamera() {
    useFrame((state) => {
        const width = state.size.width;
        const camera = state.camera as THREE.PerspectiveCamera;

        // Adjust camera for mobile
        const isMobile = width < 768;
        const targetZ = isMobile ? 14 : 10;
        const targetFov = isMobile ? 50 : 45;

        // Smooth camera position transition
        camera.position.z += (targetZ - camera.position.z) * 0.05;
        camera.fov += (targetFov - camera.fov) * 0.05;
        camera.updateProjectionMatrix();
    });

    return null;
}

export default function ThreeScene() {
    return (
        <div className="fixed inset-0 w-full h-full z-10 pointer-events-none opacity-80">
            <Canvas
                camera={{ position: [0, 0, 12], fov: 45 }}
                gl={{ alpha: true }}
            >
                <ResponsiveCamera />
                <MusicScene />
            </Canvas>
        </div>
    )
}

