import React from 'react';
import type { FileItem } from '../types';
import { Plus } from 'lucide-react';

interface FileNotesProps {
  item: FileItem;
}

const FileNotes: React.FC<FileNotesProps> = ({ item }) => {
    const notes = item.notes || [];

    return (
        <div className="space-y-4">
             {notes.length === 0 && (
                <div className="text-center text-gray-500 pt-16">
                    <p className="font-medium">No notes yet</p>
                    <p className="text-sm">Add notes, reminders, or feedback.</p>
                </div>
            )}
            {notes.map(note => (
                <div key={note.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">{note.content}</p>
                    <p className="text-xs text-yellow-600 mt-2 text-right">{note.timestamp}</p>
                </div>
            ))}
            <div className="relative mt-4">
                <textarea 
                    placeholder="Add a new note..."
                    className="w-full bg-gray-100 border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                />
                <button className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-md hover:bg-primary-hover">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FileNotes;
