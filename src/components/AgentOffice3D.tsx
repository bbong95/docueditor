import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Environment,
    Float,
    Html
} from '@react-three/drei';
import * as THREE from 'three';
import ThreeErrorBoundary from './ThreeErrorBoundary';

type AgentType = 'businessman' | 'casual' | 'spacesuit' | 'detective';

interface AgentProps {
    position: [number, number, number];
    color: string;
    name: string;
    role: string;
    type: AgentType;
    status: 'idle' | 'working' | 'thinking';
    animation?: 'idle' | 'jump' | 'spin' | 'jump-spin';
}

function LegoAgent({ position, color, name, role, type, status, animation = 'idle' }: AgentProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [_hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();

        // Base floating
        let yOffset = Math.sin(t * 1.5 + position[0]) * 0.1;
        let rotY = Math.sin(t * 0.5) * 0.2;

        // Animation Logic
        if (animation === 'jump' || animation === 'jump-spin') {
            // Jump: Fast bounce
            yOffset += Math.abs(Math.sin(t * 8)) * 0.8;
        }

        if (animation === 'spin' || animation === 'jump-spin') {
            // Spin: Continuous rotation
            rotY += t * 5;
        } else if (status === 'working') {
            rotY += 0.05; // Slow rotate working
        }

        groupRef.current.position.y = position[1] + yOffset;
        groupRef.current.rotation.y = rotY;
    });

    return (
        <group position={position} ref={groupRef}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <group scale={[1.2, 1.2, 1.2]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>

                    {/* ── Head (Classic Yellow Base) ── */}
                    <group position={[0, 1.5, 0]}>
                        <mesh castShadow>
                            <cylinderGeometry args={[0.35, 0.35, 0.6, 32]} />
                            <meshStandardMaterial color="#FFD500" roughness={0.1} />
                        </mesh>
                        {/* Stud */}
                        <mesh position={[0, 0.35, 0]} castShadow>
                            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                            <meshStandardMaterial color="#FFD500" />
                        </mesh>

                        {/* Eyes */}
                        <mesh position={[0.15, 0.1, 0.32]} castShadow>
                            <sphereGeometry args={[0.04, 16, 16]} />
                            <meshStandardMaterial color="black" />
                        </mesh>
                        <mesh position={[-0.15, 0.1, 0.32]} castShadow>
                            <sphereGeometry args={[0.04, 16, 16]} />
                            <meshStandardMaterial color="black" />
                        </mesh>

                        {/* Mouth */}
                        <mesh position={[0, -0.05, 0.33]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
                            <meshStandardMaterial color="black" />
                        </mesh>

                        {/* ── HAIR / HATS ── */}
                        {type === 'businessman' && (
                            <mesh position={[0, 0.25, 0]} castShadow>
                                <sphereGeometry args={[0.42, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                                <meshStandardMaterial color="#1e1e1e" />
                            </mesh>
                        )}

                        {type === 'casual' && (
                            <group position={[0, 0.2, 0]}>
                                <mesh castShadow>
                                    <sphereGeometry args={[0.42, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
                                    <meshStandardMaterial color="#633116" />
                                </mesh>
                                {/* Long hair back side */}
                                <mesh position={[0, -0.2, -0.1]} castShadow>
                                    <boxGeometry args={[0.6, 0.4, 0.2]} />
                                    <meshStandardMaterial color="#633116" />
                                </mesh>
                            </group>
                        )}

                        {type === 'spacesuit' && (
                            <group>
                                {/* Helmet Base */}
                                <mesh position={[0, 0, 0]} castShadow>
                                    <sphereGeometry args={[0.45, 32, 32]} />
                                    <meshStandardMaterial color={color} transparent opacity={0.3} roughness={0} />
                                </mesh>
                                <mesh position={[0, 0.1, 0]} castShadow>
                                    <cylinderGeometry args={[0.47, 0.47, 0.5, 32]} />
                                    <meshStandardMaterial color={color} />
                                </mesh>
                            </group>
                        )}

                        {type === 'detective' && (
                            <group position={[0, 0.35, 0]}>
                                <mesh castShadow>
                                    <cylinderGeometry args={[0.45, 0.5, 0.15, 32]} />
                                    <meshStandardMaterial color="#7c6e52" />
                                </mesh>
                                <mesh position={[0, 0.15, 0]} castShadow>
                                    <sphereGeometry args={[0.25, 16, 16]} />
                                    <meshStandardMaterial color="#7c6e52" />
                                </mesh>
                            </group>
                        )}
                    </group>

                    {/* ── Torso ── */}
                    <group position={[0, 0.7, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[0.8, 0.9, 0.4]} />
                            <meshStandardMaterial color={type === 'businessman' ? '#0f172a' : color} roughness={0.2} />
                        </mesh>

                        {/* OUTFIT DETAILS */}
                        {type === 'businessman' && (
                            <group position={[0, 0, 0.21]}>
                                {/* Rainbow Tie */}
                                <mesh position={[0, 0.1, 0]}>
                                    <boxGeometry args={[0.15, 0.5, 0.01]} />
                                    <meshBasicMaterial color="#ec4899" /> {/* Using simplified single color tie for stability */}
                                </mesh>
                                {/* Lapel V */}
                                <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
                                    <boxGeometry args={[0.3, 0.05, 0.02]} />
                                    <meshStandardMaterial color="white" />
                                </mesh>
                            </group>
                        )}

                        {type === 'casual' && (
                            <group position={[0, 0.25, 0.21]}>
                                {/* Polo Collar */}
                                <mesh rotation={[0, 0, 0.5]}>
                                    <boxGeometry args={[0.2, 0.05, 0.01]} />
                                    <meshStandardMaterial color="white" />
                                </mesh>
                                <mesh position={[0, -0.1, 0]}>
                                    <sphereGeometry args={[0.04, 8, 8]} />
                                    <meshStandardMaterial color="white" />
                                </mesh>
                            </group>
                        )}

                        {type === 'spacesuit' && (
                            <group position={[0, 0, 0.21]}>
                                {/* Planet Logo */}
                                <mesh position={[0.15, 0.15, 0]}>
                                    <circleGeometry args={[0.15, 32]} />
                                    <meshStandardMaterial color="#FFD500" />
                                </mesh>
                                <mesh position={[0.15, 0.15, 0.01]} rotation={[0, 0, 0.5]}>
                                    <ringGeometry args={[0.18, 0.2, 32]} />
                                    <meshStandardMaterial color="white" />
                                </mesh>
                            </group>
                        )}

                        {type === 'detective' && (
                            <group position={[0, 0, 0.21]}>
                                {/* Plaid Buttons */}
                                {[0.2, 0, -0.2].map(py => (
                                    <mesh key={py} position={[0, py, 0]}>
                                        <sphereGeometry args={[0.04, 8, 8]} />
                                        <meshStandardMaterial color="#1e293b" />
                                    </mesh>
                                ))}
                            </group>
                        )}
                    </group>

                    {/* ── Arms ── */}
                    <mesh position={[0.5, 0.8, 0]} rotation={[0, 0, -0.3]} castShadow>
                        <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
                        <meshStandardMaterial color={type === 'businessman' ? '#0f172a' : color} />
                    </mesh>
                    <mesh position={[-0.5, 0.8, 0]} rotation={[0, 0, 0.3]} castShadow>
                        <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
                        <meshStandardMaterial color={type === 'businessman' ? '#0f172a' : color} />
                    </mesh>

                    {/* Hands */}
                    <mesh position={[0.6, 0.55, 0]} castShadow>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshStandardMaterial color="#FFD500" />
                    </mesh>
                    <mesh position={[-0.6, 0.55, 0]} castShadow>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshStandardMaterial color="#FFD500" />
                    </mesh>

                    {/* ── Legs ── */}
                    <mesh position={[0.2, 0.2, 0]} castShadow>
                        <boxGeometry args={[0.3, 0.4, 0.3]} />
                        <meshStandardMaterial color={type === 'businessman' ? '#0f172a' : '#334155'} />
                    </mesh>
                    <mesh position={[-0.2, 0.2, 0]} castShadow>
                        <boxGeometry args={[0.3, 0.4, 0.3]} />
                        <meshStandardMaterial color={type === 'businessman' ? '#0f172a' : '#334155'} />
                    </mesh>

                </group>
            </Float>

            {/* Role Label */}
            <Html position={[0, 2.8, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 1)', padding: '4px 12px', borderRadius: '20px',
                    border: `3px solid ${color}`, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'scale(1.2)'
                }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#1e293b' }}>{name}</p>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: color }}>{role}</p>
                </div>
            </Html>
        </group>
    );
}

export default function AgentOffice3D({ status, viewMode = 'full' }: { status: string, viewMode?: 'mini' | 'full' }) {
    const agents = useMemo(() => [
        { name: 'Architect', role: 'Lead', color: '#3b82f6', pos: [-3.5, 0, 0], type: 'businessman' as AgentType },
        { name: 'Designer', role: 'UI/UX', color: '#ec4899', pos: [-1.2, 0, 1.5], type: 'casual' as AgentType },
        { name: 'Developer', role: 'Core', color: '#f97316', pos: [1.2, 0, -1.5], type: 'spacesuit' as AgentType },
        { name: 'Analyst', role: 'QA', color: '#8b5cf6', pos: [3.5, 0, 0], type: 'detective' as AgentType },
    ], []);

    const isMini = viewMode === 'mini';

    return (
        <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
            <ThreeErrorBoundary>
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera
                        makeDefault
                        position={isMini ? [0, 5, 10] : [0, 6, 12]}
                        fov={isMini ? 45 : 35}
                    />
                    <OrbitControls
                        enablePan={false}
                        enableZoom={!isMini}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 2.5}
                        makeDefault
                    />
                    <ambientLight intensity={1.5} />
                    <pointLight position={[10, 10, 10]} intensity={2} castShadow />
                    <Environment preset="city" />
                    <group position={[0, -0.5, 0]}>
                        {agents.map((agent) => (
                            <group key={agent.name} position={agent.pos as [number, number, number]}>
                                <LegoAgent
                                    name={agent.name} role={agent.role}
                                    color={agent.color} position={[0, 0, 0]}
                                    type={agent.type} status={status === 'active' && agent.name === 'Developer' ? 'working' : 'idle'}
                                />
                                {/* Role Label - Optimized for Mini Mode */}
                                <Html
                                    position={[0, isMini ? 2.5 : 2.8, 0]}
                                    center
                                    distanceFactor={isMini ? 12 : 10}
                                    style={{ pointerEvents: 'none', zIndex: 100 }}
                                >
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        padding: isMini ? '2px 6px' : '4px 12px',
                                        borderRadius: '20px',
                                        border: `2px solid ${agent.color}`,
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        opacity: isMini ? 0.9 : 1
                                    }}>
                                        <p style={{ margin: 0, fontSize: isMini ? '10px' : '13px', fontWeight: 900, color: '#1e293b' }}>{agent.name}</p>
                                        {!isMini && (
                                            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: agent.color }}>
                                                {agent.role}
                                            </p>
                                        )}
                                    </div>
                                </Html>
                            </group>
                        ))}
                    </group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
                        <planeGeometry args={[30, 30]} />
                        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
                    </mesh>
                    <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.15} far={15} color="#000000" />
                </Canvas>
            </ThreeErrorBoundary>
        </div>
    );
}
