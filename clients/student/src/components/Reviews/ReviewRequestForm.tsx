import { Button, Input, Select, message } from "antd";
import React, { useMemo, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import useAppSelector from "~/hooks/useAppSelector";
import "./editor.css";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClassType } from "~/store/reducers/classSlice";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import authStorage from "~/utils/auth.storage";
import useAppDispatch from "~/hooks/useAppDispatch";
import { pushReview } from "~/store/reducers/reviewSlice";

interface ReviewRequestFormProps {
    details: ClassType;
}

const ReviewRequestForm: React.FC<ReviewRequestFormProps> = ({ details }) => {
    const { classID } = useParams();

    const dispatch = useAppDispatch();

    const userInfo = useAppSelector((state) => state.user.profile);
    const [gradeComposition, setGradeComposition] = React.useState<string>("");
    const [currentGrade, setCurrentGrade] = React.useState<number | string>(
        "N/A"
    );
    const [expectedGrade, setExpectedGrade] = React.useState<number | string>(
        ""
    );

    const [messageApi, contextHolder] = message.useMessage();

    const editorRef = useRef<any>(null);

    const navigate = useNavigate();

    const handleOpenReview = () => {
        const reason = editorRef.current.getContent();
        const expected = Number(expectedGrade);
        const grade = Number(currentGrade);
        const student_id = details.studentID;
        const composition = gradeComposition;

        if (!student_id) {
            return messageApi.error(
                "Please note that your student ID has not been submitted yet !"
            );
        }

        if (
            !classID ||
            reason === "" ||
            isNaN(expected) ||
            isNaN(grade) ||
            composition === ""
        ) {
            return messageApi.error(
                "Please fill in all fields to open a review request !"
            );
        }

        axios
            .post(
                `${process.env.REACT_APP_BACKEND_HOST}/v1/review/${classID}`,
                {
                    reason,
                    expected,
                    grade,
                    composition,
                },
                {
                    headers: {
                        Authorization: `Bearer ${
                            authStorage.isLogin()
                                ? authStorage.getAccessToken()
                                : ""
                        }`,
                    },
                }
            )
            .then((res) => {
                dispatch(pushReview(res.data.data.review));
                messageApi.success(
                    "Open review request successfully !",
                    1.5,
                    () => {
                        navigate(
                            `/classes/reviews/${classID}/view/${res.data.data.review._id}`
                        );
                    }
                );
            })
            .catch((error) => {
                messageApi.error(
                    error?.response?.data?.message ?? "Something went wrong !"
                );
            });
    };

    const onChange = (value: string) => {
        setCurrentGrade(
            details.gradeList[0]?.grade.find((el: any) => el.col === value)
                ?.value ?? ""
        );
        setGradeComposition(value);
    };

    const filterOption = (
        input: string,
        option?: { label: string; value: string }
    ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

    const gradeCompositions = useMemo(
        () => details.gradeList[0]?.grade ?? [],
        [details]
    );
    const gradeCompositionNames = useMemo(
        () =>
            gradeCompositions.map((el: any) => ({
                value: el.col,
                label: el.col,
            })),
        [gradeCompositions]
    );

    const validateExpecetedGrade = (e: any) => {
        const value = e.target.value;

        if (!isNaN(parseInt(String(currentGrade))) && !isNaN(parseInt(value))) {
            const grade = parseInt(value);

            if (grade > 10 || grade < 0) {
                setExpectedGrade(10);
            } else {
                setExpectedGrade(grade);
            }
        } else setExpectedGrade("");
    };

    return (
        <>
            {contextHolder}
            <div className="p-3 flex gap-8 items-start">
                <div className="flex items-center gap-3">
                    <div className="rounded-full overflow-hidden border">
                        <img width="50px" src={userInfo?.avatar} alt="avatar" />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-medium">{userInfo?.username}</div>
                        <small className="capitalize">
                            {details.studentID}
                        </small>
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-stretch justify-between">
                        <div className="flex gap-3">
                            <Select
                                className="!w-35 !h-auto"
                                style={{
                                    minWidth: 150,
                                }}
                                popupMatchSelectWidth={false}
                                showSearch
                                placeholder="Select a grade composition"
                                optionFilterProp="children"
                                onChange={onChange}
                                filterOption={filterOption}
                                options={gradeCompositionNames}
                            />
                            {currentGrade ? (
                                <div className="flex items-center bg-primary text-white px-5 rounded-md">
                                    <span className="font-semibold">
                                        Grade: {currentGrade}
                                    </span>
                                </div>
                            ) : null}
                            <span className="flex items-center border !border-blue-400 px-4 rounded-md">
                                <span className="!font-medium !text-lg text-blue-500">
                                    Expected:
                                </span>
                                <Input
                                    className="!h-auto !w-14 !bg-slate-100 !ml-3 !py-1 !text-center !text-lg !border-none !font-medium !ring-0 !outline-none !p-0"
                                    placeholder="N/A"
                                    onChange={validateExpecetedGrade}
                                    max={10}
                                    maxLength={2}
                                    value={expectedGrade}
                                    disabled={isNaN(Number(currentGrade))}
                                />
                            </span>
                        </div>
                        <div className="flex gap-5">
                            <span className="flex"></span>
                        </div>
                        <Button
                            onClick={handleOpenReview}
                            type="primary"
                            className="!py-3 !px-4 !h-auto !font-medium"
                            icon={<FontAwesomeIcon icon={faBullhorn} />}
                        >
                            Open Request
                        </Button>
                    </div>
                    <Editor
                        apiKey='8f04qq8qzvwiezrbvgk61dd59ejncsww11olmcqhng8k7fsa'
                        onInit={(evt, editor) => editorRef.current = editor}
                        init={{
                            height: 250,
                            menubar: false,
                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                            toolbar: 'blocks fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                            tinycomments_mode: 'embedded',
                            content_style: 'body { font-family: Arial, sans-serif; font-size:14px }',
                            placeholder: 'Enter your reason...',
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default ReviewRequestForm;
