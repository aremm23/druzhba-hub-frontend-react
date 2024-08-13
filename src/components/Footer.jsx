// Footer.jsx
import React from 'react';

function Footer() {
    return (
        <footer className="bg-white px-10 py-10 rounded-3xl border-2 border-gray-200 mt-auto text-center">
            <p className="font-thin text-base">Ищу фронтендера который сделает красивый UI. Платить не буду, работать нужно за идею</p>
            <p className="mt-2">
                <a href="https://github.com/aremm23" target="_blank" rel="noopener noreferrer" className="text-violet-500 text-base font-medium">
                    GitHub проекта
                </a>
            </p>
            <p className="mt-2">
                <a href="https://t.me/Aremm" target="_blank" rel="noopener noreferrer" className="text-violet-500 text-base font-medium">
                    Мой тг
                </a>
            </p>
        </footer>
    );
}

export default Footer;
