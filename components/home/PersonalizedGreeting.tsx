import React from 'react';

interface PersonalizedGreetingProps {
    userName: string;
    userAvatar?: string;
}

const PersonalizedGreeting: React.FC<PersonalizedGreetingProps> = ({ userName, userAvatar }) => {
    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return { text: 'Olá', emoji: '👋' };
        } else if (hour >= 12 && hour < 18) {
            return { text: 'Olá', emoji: '👋' };
        } else {
            return { text: 'Olá', emoji: '👋' };
        }
    };

    const greeting = getGreeting();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Meu Linkarbox
            </h1>
            <p className="text-sm text-gray-600">
                <span className="mr-1">{greeting.emoji}</span>
                {greeting.text}, <span className="text-indigo-600 font-semibold">{userName}</span>
            </p>
        </div>
    );
};

export default PersonalizedGreeting;
