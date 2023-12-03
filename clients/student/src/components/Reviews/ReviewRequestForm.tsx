import { Button, Input, Select } from 'antd';
import React, { useMemo, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useAppSelector from '~/hooks/useAppSelector';
import './editor.css';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ClassType } from '~/store/reducers/classSlice';

interface ReviewRequestFormProps {
    details: ClassType;
}

const ReviewRequestForm: React.FC<ReviewRequestFormProps> = ({ details }) => {

    const userInfo = useAppSelector(state => state.user.profile);
    const [currentGrade, setCurrentGrade] = React.useState<number | string>('N/A');

    const editorRef = useRef<any>(null);
    
    const log = () => {
        if (editorRef.current) {
            console.log(editorRef.current.getContent());
        }
    };

    const onChange = (value: string) => {
        setCurrentGrade(details.gradeList[0]?.grade.find((el: any) => el.col === value)?.value ?? '');
        console.log(`selected ${value}`);
    };
      
    const onSearch = (value: string) => {
        console.log('search:', value);
    };
      
    const filterOption = (input: string, option?: { label: string; value: string }) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const gradeCompositions = useMemo(() => details.gradeList[0]?.grade ?? [], [details]);
    const gradeCompositionNames = useMemo(() => gradeCompositions.map((el: any) => ({
        value: el.col,
        label: el.col,
    })), [gradeCompositions]);

    const validateExpecetedGrade = (e: any) => {
        const value = e.target.value;
        
        if (value !== 'N/A') {
            const grade = parseInt(value);

            // if (grade >= currentGrade && grade <= 10) {

            // }
        }
    }

    return (
        <div className='p-3 flex gap-8 items-start'>
            <div className='flex items-center gap-3'>
                <div className='rounded-full overflow-hidden border'>
                    <img width='50px' src={userInfo?.avatar} alt='avatar' />
                </div>
                <div className='flex flex-col'>
                    <div className='font-medium'>{userInfo?.username}</div>
                    <small className='capitalize'>{userInfo?.role}</small>
                </div>
            </div>
            <div className='flex-1 flex flex-col gap-3'>
                <div className='flex items-stretch justify-between'>
                    <div className='flex gap-5'>
                        <Select
                            className='!w-35 !h-auto'
                            style={{
                                minWidth: 150
                            }}
                            popupMatchSelectWidth={false}
                            showSearch
                            placeholder="Select a grade composition"
                            optionFilterProp="children"
                            onChange={onChange}
                            onSearch={onSearch}
                            filterOption={filterOption}
                            options={gradeCompositionNames}
                        />
                        { currentGrade 
                            ? 
                            <div className='flex items-center bg-primary text-white px-5 rounded-md'>
                                <span className='font-semibold'>
                                    Review Grade: { currentGrade }
                                </span>
                            </div>
                            : null
                        }
                        <span className='flex items-center border !border-blue-400 px-4 rounded-md'>
                            <span className='!font-medium !text-lg text-blue-500'>Expected</span>
                            <Input 
                                className='!h-auto !w-14 !bg-slate-100 !ml-3 !py-1 !text-center !text-lg !border-none !font-medium !ring-0 !outline-none !p-0' 
                                placeholder='N/A'
                                onChange={validateExpecetedGrade}
                            />
                        </span>
                    </div>
                    <div className='flex gap-5'>
                        <span className='flex'>
                        </span>
                    </div>
                    <Button onClick={log} type='primary' className='!py-3 !px-4 !h-auto !font-medium' icon={<FontAwesomeIcon icon={faBullhorn} />}>Open Request</Button>
                </div>
                <Editor
                    textareaName='review'
                    apiKey='8f04qq8qzvwiezrbvgk61dd59ejncsww11olmcqhng8k7fsa'
                    onInit={(evt, editor) => editorRef.current = editor}
                    init={{
                        height: 250,
                        menubar: false,
                        plugins: 'tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
                        toolbar: 'blocks fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                        tinycomments_mode: 'embedded',
                        content_style: 'body { font-family: Arial, sans-serif; font-size:14px }',
                    }}
                />
            </div>
        </div>
    );
};

export default ReviewRequestForm;