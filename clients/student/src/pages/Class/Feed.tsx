import { Editor } from "@tinymce/tinymce-react";
import { Button } from "antd";
import React, { useRef } from "react";

const Feed: React.FC = () => {
    const editorRef = useRef<any>(null);

    return (
        <div className="flex gap-4 items-start">
            <div className="flex flex-col border shadow-sm rounded-md px-6 py-6 gap-5">
                <span className="text-gray-700 font-medium text-md">
                    Upcoming
                </span>
                <span className="text-sm text-gray-600">
                    Woohoo, no work due soon!
                </span>
            </div>
            <div className="flex-1 flex flex-col gap-3 w-full border shadow-sm p-4 rounded-md">
                <Editor
                    apiKey="8f04qq8qzvwiezrbvgk61dd59ejncsww11olmcqhng8k7fsa"
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    init={{
                        height: 200,
                        menubar: false,
                        plugins:
                            "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                        toolbar:
                            "blocks fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                        tinycomments_mode: "embedded",
                        content_style:
                            "body { font-family: Arial, sans-serif; font-size:14px }",
                        placeholder: "Enter your reason...",
                        statusbar: false,
                    }}
                />
                <div className="flex gap-3 justify-end">
                    <Button className="!py-1.5 !px-5 !h-auto" type="text">Cancel</Button>
                    <Button className="!py-1.5 !px-5 !h-auto" type="primary">Post</Button>
                </div>
            </div>
        </div>
    );
};

export default Feed;
