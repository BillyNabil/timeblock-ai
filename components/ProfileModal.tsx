import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onSave: (name: string) => void;
}

export function ProfileModal({ isOpen, onClose, currentName, onSave }: Props) {
    const [name, setName] = useState(currentName);

    useEffect(() => {
        setName(currentName);
    }, [currentName, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                        👤 Profile Settings
                    </DialogTitle>
                    <DialogDescription>
                        Update your display name so we know what to call you!
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right font-bold">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3 border-2 border-primary/10 focus-visible:ring-primary/50"
                            placeholder="e.g. Maverick"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="btn-neo bg-primary hover:bg-primary/80 text-white">
                            Save Profile
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
