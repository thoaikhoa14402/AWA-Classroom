import { useEffect, useState } from "react";

const useRandomColor = () => {
    const [randomColor, setRandomColor] = useState("transparent");

    useEffect(() => {
        const generateRandomColor = () => {
            const letters = "0123456789ABCDEF";
            let color = "#";
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };

        const updateColor = () => {
            const newColor = generateRandomColor();
            setRandomColor(newColor);
        };

        updateColor();

    }, []); // Empty dependency array ensures the effect runs only once on mount

    return randomColor;
};

export default useRandomColor;
