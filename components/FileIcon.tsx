import React from 'react';
import { FileIcon as ReactFileIcon, DefaultExtensionType, defaultStyles } from 'react-file-icon';

interface FileIconProps {
    fileName: string;
    mimeType?: string;
    size?: number;
}

const FileIcon: React.FC<FileIconProps> = ({ fileName, mimeType, size = 40 }) => {
    // Extract extension from filename
    const getExtension = (name: string): string => {
        const parts = name.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    };

    const extension = getExtension(fileName);

    return (
        <div style={{ width: size, height: size }}>
            <ReactFileIcon
                extension={extension as DefaultExtensionType}
                {...defaultStyles[extension as DefaultExtensionType]}
            />
        </div>
    );
};

export default FileIcon;
