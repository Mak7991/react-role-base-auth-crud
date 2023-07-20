import React from 'react'
import './index.css';
import history  from '@history';

function BigPlus() {


    return (
        <div className="flex justify-center items-center "
         onClick={  () => {
        history.push('/livestreaming-CameraRegistration');
        }} >
            <div className="w-full video-player-box rounded-lg bg-color">
                <img src='assets/images/plus-big.png'></img>
            </div>
        </div>
    )
}

export default BigPlus