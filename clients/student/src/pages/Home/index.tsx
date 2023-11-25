import { faArrowRightToBracket, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, MenuProps } from 'antd';
import React from 'react';
import { NoActivityMessage } from '~/components/Home';
import useAppSelector from '~/hooks/useAppSelector';
import { ReactComponent as LoadingIndicator } from '~/assets/svg/loading-indicator.svg';
import ClassCard from '~/components/Class/ClassCard';

const HomePage: React.FC = () => {

    const classInfo = useAppSelector(state => state.classes);
    const classes = classInfo.classes;
    const isLoading = classInfo.isLoading;

    const items: MenuProps["items"] = [
        {
            key: "join-class",
            label: 'Join a class',
            icon: <FontAwesomeIcon icon={faArrowRightToBracket} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
        }
    ];

    return (
        <>
            {
                !isLoading 
                ? classes.length 
                    ? 
                    <>
                        <div className='flex justify-end items-center h-13 px-3'>
                            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName='!z-10'>
                                <Button shape='circle' className='!w-10 !h-10'>
                                    <FontAwesomeIcon icon={faEllipsis} size='lg' />
                                </Button>
                            </Dropdown>
                        </div>
                        <h1 className='text-2xl font-medium mb-6 mt-0'>All Classes</h1>
                        <div className={`flex flex-wrap gap-10 xl:gap-4 xl:gap-y-4`}>
                            { classes.map((el, _) => (<ClassCard key={el._id} details={el} />)) }
                        </div>
                    </>
                    : <NoActivityMessage />
                : <div className='flex h-full w-full justify-center items-center pb-28'>
                    <LoadingIndicator />
                </div>  
            }  
        </>
    );
};

export default HomePage;