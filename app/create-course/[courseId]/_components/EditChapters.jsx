import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { HiPencilSquare } from 'react-icons/hi2';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const EditChapters = ({ course, index, setCourse }) => {
    const [chapters, setChapters] = useState([]);
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');

    useEffect(() => {
        if (course) {
            let output = course.courseOutput;
            if (typeof output === 'string') {
                try {
                    output = JSON.parse(output);
                } catch {
                    output = {};
                }
            }
            setChapters(output?.Chapters || []);
        }
    }, [course]);

    useEffect(() => {
        if (chapters[index]) {
            setName(chapters[index].ChapterName || chapters[index].name);
            setAbout(chapters[index].About || chapters[index].about || chapters[index].description);
        }
    }, [chapters, index]);

    const handleUpdate = async () => {
        const updatedChapters = [...chapters];
        updatedChapters[index] = {
            ...updatedChapters[index],
            ChapterName: name,
            About: about,
            name: name, // Ensure compatibility
            about: about
        };

        // Optimistic Update
        setCourse(prev => {
            let output = prev.courseOutput;
            if (typeof output === "string") {
                try { output = JSON.parse(output); } catch { output = {}; }
            }
            output.Chapters = updatedChapters;

            return {
                ...prev,
                courseOutput: typeof prev.courseOutput === "string" ? JSON.stringify(output) : output
            };
        });

        try {
            await fetch(`/api/update-course/${course.courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapters: updatedChapters
                })
            });
        } catch (error) {
            console.error("Failed to update chapter:", error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-xl p-2 text-gray-500 hover:text-primary transition-colors">
                    <HiPencilSquare />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Chapter</DialogTitle>
                    <DialogDescription>
                        Update the chapter details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Chapter Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            className="h-32"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleUpdate}>Update Chapter</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditChapters;
