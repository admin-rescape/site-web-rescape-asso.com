"use client";

import Link from "next/link";
import { Mascot } from "@/components/ui/Mascot";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section id="hero-section" className="relative w-full min-h-[calc(100dvh-5rem)] bg-background flex items-center overflow-hidden">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/paper-texture.svg')] bg-repeat mix-blend-multiply" aria-hidden="true"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        id="hero-content"
                        data-motion-wrapper="true"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.8, staggerChildren: 0.2 }
                            }
                        }}
                        className="relative text-center lg:text-left z-10 space-y-8"
                    >

                        <motion.h1
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                            }}
                            className="text-5xl lg:text-7xl font-pacifico text-primary leading-tight drop-shadow-sm"
                        >
                            <span className="relative inline-block">
                                Ensemble,
                                <div id="rotating-badge" style={{ width: "clamp(64px, 8vw, 120px)", height: "clamp(64px, 8vw, 120px)" }} className="absolute -top-[40%] -right-[30%] aspect-square pointer-events-none z-0">
                                    <Badge className="w-full h-full" />
                                </div>
                            </span>
                            <br />
                            <span className="text-dark">rien ne se perd.</span><br />
                            <span className="text-secondary">Tout se partage.</span>
                        </motion.h1>

                        <motion.p
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                            }}
                            className="text-xl text-textLight font-lato max-w-lg mx-auto lg:mx-0 leading-relaxed"
                        >
                            <span>Lutte Anti Gaspillage Solidaire à Aniche (59580).</span><br />
                            <span>Rejoignez <span className="font-bold text-primary">une aventure humaine</span> où chaque geste compte.</span>
                            
                        </motion.p>

                        <motion.div
                            id="hero-cta"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                            }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
                        >
                            <Link href="/histoire">
                                <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-4 shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    Découvrir notre histoire
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 bg-white/50 hover:bg-white">
                                    Faire un don ou déposer
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                        }}>
                            <OpeningStatus />
                        </motion.div>
                    </motion.div>

                    {/* Visual */}
                    <div id="hero-visual" className="relative flex justify-center items-center z-10 mt-8 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            id="hero-mascot" className="relative w-64 h-64 lg:w-96 lg:h-96 animate-bounce-slow"
                        >
                            <Mascot className="w-full h-full drop-shadow-2xl" />
                        </motion.div>

                        {/* Decorative blur */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[31.25rem] h-[31.25rem] bg-secondary/5 rounded-full blur-3xl -z-10" aria-hidden="true"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
