import React from "react";
import { Button } from "antd";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NoClassMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full pb-28">
            <p className="font-semibold mb-6 text-2xl">
                No Classes Available
            </p>
            <p className="text-gray-600 mb-8 text-center text-base">
                It looks like you haven't created any classes yet.
                <br />Let's join your first class!
            </p>
            <Button size="large" shape="round" className="!text-primary !border-primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => {}} />
        </div>
    );
};

export default NoClassMessage;
