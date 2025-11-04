import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const InputModal: React.FC<InputProps> = ({ label, ...inputProps }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm mb-1">{label}</label>
            <input 
                {...inputProps} 
                className="w-full border rounded-md p-2" 
            />
        </div>
    );
}