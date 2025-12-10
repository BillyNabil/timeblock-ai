"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Star, Layout, Smile, ArrowRight } from "lucide-react";

interface Props {
    onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
    return (
        <div className="fixed inset-0 z-[9999] bg-yellow-200 flex flex-col items-center overflow-y-auto overflow-x-hidden custom-scrollbar">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Floating Shapes */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 text-cyan-400 w-32 h-32 opacity-80"
                >
                    <svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="50" /></svg>
                </motion.div>
                <motion.div
                    animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 right-10 text-pink-400 w-40 h-40 opacity-80"
                >
                    <svg viewBox="0 0 100 100" fill="currentColor"><rect width="100" height="100" rx="20" /></svg>
                </motion.div>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-20 text-purple-400 w-16 h-16 opacity-80"
                >
                    <Star size={64} fill="currentColor" strokeWidth={0} />
                </motion.div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/3 right-1/4 text-green-400 w-24 h-24 opacity-80"
                >
                    <Smile size={96} strokeWidth={2.5} />
                </motion.div>
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="z-10 text-center max-w-4xl px-4 py-20"
            >
                <div className="mb-8 inline-flex items-center gap-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full px-5 py-2 rotate-[-2deg]">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-black">
                        <svg viewBox="0 0 512 512" className="w-6 h-6">
                            <circle cx="256" cy="256" r="200" fill="white" stroke="#8B5CF6" strokeWidth="20"/>
                            <rect x="246" y="120" width="20" height="80" rx="10" fill="#8B5CF6"/>
                            <rect x="246" y="256" width="20" height="60" rx="10" fill="#EC4899" transform="rotate(90 256 256)"/>
                            <circle cx="256" cy="256" r="16" fill="#1F2937"/>
                        </svg>
                    </div>
                    <span className="font-black text-lg uppercase tracking-wider">
                        TimeBlock.ai
                    </span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-black leading-[0.9] mb-8 tracking-tighter drop-shadow-sm">
                    STOP <span className="text-white bg-black px-2 skew-x-[-10deg] inline-block">BORING</span><br />
                    PLANNING.
                </h1>

                <p className="text-xl md:text-2xl font-bold text-black/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Turn your to-do list into a game. Level up, earn XP, and crush your goals with our AI-powered time blocking tool.
                </p>

                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={onStart}
                            className="btn-neo bg-pink-400 text-black text-2xl h-20 px-12 rounded-2xl hover:bg-pink-300 border-[4px]"
                        >
                            Get Started <ArrowRight className="ml-3 w-8 h-8" strokeWidth={4} />
                        </Button>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
                    <FeatureCard
                        icon={<Layout size={32} />}
                        title="Visual Blocking"
                        desc="Drag & drop your day into colorful blocks."
                        color="bg-cyan-200"
                    />
                    <FeatureCard
                        icon={<Zap size={32} />}
                        title="AI Auto-Pilot"
                        desc="Let AI organize your messy inbox instantly."
                        color="bg-green-200"
                    />
                    <FeatureCard
                        icon={<Star size={32} />}
                        title="Gamified XP"
                        desc="Earn rewards for being productive. It's addictive!"
                        color="bg-purple-200"
                    />
                </div>
            </motion.div>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color}`}
        >
            <div className="bg-white w-12 h-12 rounded-full border-[3px] border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {icon}
            </div>
            <h3 className="text-xl font-black mb-2 uppercase">{title}</h3>
            <p className="font-bold text-sm leading-tight opacity-90">{desc}</p>
        </motion.div>
    );
}
