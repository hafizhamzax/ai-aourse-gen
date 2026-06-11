import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function LoadingDialog({ loading, progress }) {
    return (
        <Dialog open={loading}>
            <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none flex flex-col items-center justify-center min-h-[300px]">
                <DialogHeader className="hidden">
                    <DialogTitle>Generating Course</DialogTitle>
                    <DialogDescription>
                        Please wait while we generate your course content.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xs">
                    {/* Card Animation Simulation */}
                    <div className="relative w-32 h-40">
                        <div className="absolute w-full h-full bg-primary/20 rounded-xl border-2 border-primary/50 transform rotate-[-6deg] animate-pulse"></div>
                        <div className="absolute w-full h-full bg-primary/40 rounded-xl border-2 border-primary/50 transform rotate-[6deg] animate-pulse delay-75"></div>
                        <div className="absolute w-full h-full bg-card rounded-xl border-2 border-primary flex items-center justify-center shadow-2xl z-10 animate-bounce">
                            <div className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    </div>

                    <div className="text-center space-y-2 w-full">
                        <h2 className="text-2xl font-bold text-white drop-shadow-md pb-2">Crafting your Course...</h2>
                        <p className="text-gray-200">Sit tight! AI is building your curriculum.</p>

                        {/* Progress Bar */}
                        {(progress !== undefined && progress >= 0) && (
                            <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-4 backdrop-blur-sm border border-white/10">
                                <div
                                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                    style={{ width: `${Math.round(progress)}%` }}
                                ></div>
                                <p className="text-white text-xs mt-2 font-mono">{Math.round(progress)}%</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default LoadingDialog;
