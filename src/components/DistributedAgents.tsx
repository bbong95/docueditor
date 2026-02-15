import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, PerspectiveCamera, Environment } from '@react-three/drei';
import LegoAgent from './3d/LegoAgent';
import { useEditorStore } from '../store/useEditorStore';

export default function DistributedAgents() {
    const isUploading = useEditorStore(state => state.isUploading);
    const selectedBox = useEditorStore(state => state.selectedBox);
    const isExporting = useEditorStore(state => state.isExporting);

    // Refs for DOM targets (where the agents will appear)
    const architectRef = useRef<HTMLDivElement>(null);
    const developerRef = useRef<HTMLDivElement>(null);
    const designerRef = useRef<HTMLDivElement>(null);
    const analystRef = useRef<HTMLDivElement>(null);

    // Determine Agent Status
    const isDesigning = !!selectedBox;

    // Layout configuration: Left-aligned cluster starting after Logo
    const VIEW_WIDTH = '80px';
    const VIEW_HEIGHT = '60px';
    const BASE_TOP = '4px';

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
            {/* ── DOM Anchors (Header Row - Center-Right Cluster) ── */}
            {/* Shifted right to avoid Logo overlap (Start at 500px) */}

            {/* Architect */}
            <div ref={architectRef} className="agent-anchor"
                style={{ position: 'absolute', top: BASE_TOP, left: '500px', width: VIEW_WIDTH, height: VIEW_HEIGHT }} />

            {/* Designer */}
            <div ref={designerRef} className="agent-anchor"
                style={{ position: 'absolute', top: BASE_TOP, left: '600px', width: VIEW_WIDTH, height: VIEW_HEIGHT }} />

            {/* Developer */}
            <div ref={developerRef} className="agent-anchor"
                style={{ position: 'absolute', top: BASE_TOP, left: '700px', width: VIEW_WIDTH, height: VIEW_HEIGHT }} />

            {/* Analyst */}
            <div ref={analystRef} className="agent-anchor"
                style={{ position: 'absolute', top: BASE_TOP, left: '800px', width: VIEW_WIDTH, height: VIEW_HEIGHT }} />

            {/* ── Shared Canvas ── */}
            <Canvas eventSource={document.getElementById('root')!} className="agent-canvas" style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
                <Environment preset="city" />
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />

                {/* View 1: Architect (Always Active) */}
                <View track={architectRef as React.RefObject<HTMLDivElement>}>
                    <PerspectiveCamera makeDefault position={[0, 1, 3.5]} fov={50} />
                    <LegoAgent
                        name="Architect" role="Lead" color="#3b82f6" type="businessman"
                        status="working"
                        animation="jump-spin"
                        position={[0, -0.8, 0]}
                    />
                </View>

                {/* View 2: Designer */}
                <View track={designerRef as React.RefObject<HTMLDivElement>}>
                    <PerspectiveCamera makeDefault position={[0, 1, 3.5]} fov={50} />
                    <LegoAgent
                        name="Designer" role="UI/UX" color="#ec4899" type="casual"
                        status={isDesigning ? 'working' : 'idle'}
                        animation={isDesigning ? 'jump-spin' : 'idle'}
                        position={[0, -0.8, 0]}
                    />
                </View>

                {/* View 3: Developer */}
                <View track={developerRef as React.RefObject<HTMLDivElement>}>
                    <PerspectiveCamera makeDefault position={[0, 1, 3.5]} fov={50} />
                    <LegoAgent
                        name="Developer" role="Core" color="#f97316" type="spacesuit"
                        status={isUploading ? 'working' : 'idle'}
                        animation={isUploading ? 'jump-spin' : 'idle'}
                        position={[0, -0.8, 0]}
                    />
                </View>

                {/* View 4: Analyst */}
                <View track={analystRef as React.RefObject<HTMLDivElement>}>
                    <PerspectiveCamera makeDefault position={[0, 1, 3.5]} fov={50} />
                    <LegoAgent
                        name="Analyst" role="QA" color="#8b5cf6" type="detective"
                        status={isExporting ? 'working' : 'idle'}
                        animation={isExporting ? 'jump-spin' : 'idle'}
                        position={[0, -0.8, 0]}
                    />
                </View>
            </Canvas>
        </div>
    );
}
