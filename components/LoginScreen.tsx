"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                
                // Check if user already exists (Supabase returns user with identities = [] for existing users)
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    setMessage({ text: '⚠️ This email is already registered. Please log in instead.', type: 'error' });
                } else if (data.user && !data.session) {
                    setMessage({ text: '🚀 Registration successful! Please check your email.', type: 'success' });
                } else if (data.session) {
                    // Auto logged in
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ text: error.message || 'Authentication failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            setMessage({ text: '📧 Check your email! Click the link, then come back here and log in with your new password.', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message || 'Failed to send reset email', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 relative overflow-hidden">
            {/* Background Decorations (Simplified) */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 left-10 text-yellow-300 w-20 h-20"
                >
                    <svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="50" /></svg>
                </motion.div>
                <motion.div
                    animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 right-10 text-cyan-300 w-24 h-24"
                >
                    <svg viewBox="0 0 100 100" fill="currentColor"><rect width="100" height="100" rx="20" /></svg>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className="w-full max-w-md z-10"
            >
                <Card className="w-full border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="text-center pb-6 pt-8 bg-yellow-300 border-b-[3px] border-black">
                        <CardTitle className="text-4xl font-black tracking-tight text-black uppercase transform -rotate-1">
                            {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Join the Party!' : 'Welcome Back!')}
                        </CardTitle>
                        <CardDescription className="text-base font-bold text-black/70 mt-2">
                            {isForgotPassword ? 'Don’t worry, happens to the best of us.' : (isSignUp ? 'Start your productivity adventure.' : 'Enter your details to create chaos.')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-8 px-8">
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-3 text-sm font-black border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${message.type === 'success' ? 'bg-green-300 text-black' : 'bg-red-300 text-black'}`}
                            >
                                {message.type === 'success' ? <CheckCircle2 size={24} strokeWidth={3} /> : <AlertCircle size={24} strokeWidth={3} />}
                                {message.text}
                            </motion.div>
                        )}

                        {isForgotPassword ? (
                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email" className="font-black text-lg">Email</Label>
                                    <Input
                                        id="reset-email"
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full py-7 text-xl font-black mt-4 btn-neo bg-pink-500 hover:bg-pink-400 text-white border-[3px] rounded-xl"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-6 w-6 animate-spin" strokeWidth={3} />}
                                    {loading ? 'Sending...' : 'Send Reset Link 📧'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-black text-lg">Email</Label>
                                    <Input
                                        id="email"
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="font-black text-lg">Password</Label>
                                        {!isSignUp && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsForgotPassword(true);
                                                    setMessage(null);
                                                }}
                                                className="text-sm font-bold text-gray-500 hover:text-black hover:underline"
                                            >
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-7 text-xl font-black mt-4 btn-neo bg-pink-500 hover:bg-pink-400 text-white border-[3px] rounded-xl"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-6 w-6 animate-spin" strokeWidth={3} />}
                                    {loading ? (isSignUp ? 'Creating...' : 'Logging In...') : (isSignUp ? 'Let’s Go! 🚀' : 'Log In ⚡')}
                                </Button>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-center border-t-[3px] border-black pt-6 pb-6 bg-gray-50">
                        {isForgotPassword ? (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setMessage(null);
                                }}
                                className="text-black/70 hover:text-black font-bold hover:bg-transparent flex items-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setMessage(null);
                                }}
                                className="text-black/70 hover:text-black font-bold hover:bg-transparent underline decoration-dashed underline-offset-4 decoration-2"
                            >
                                {isSignUp ? 'Already have an account? Log In' : "New here? Create an Account"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
