import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import React, { useEffect, useState } from 'react';
import './Settings.css';
import { stripConnect } from 'app/services/settings/settings';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import SuccessDialog from './SuccessDialog';
import * as Actions from 'app/store/actions';
import { CircularProgress } from '@material-ui/core';

export default function Account() {
	const dispatch = useDispatch();
	const connectId = useSelector(({ auth }) => auth?.user?.school);
	const [openimage, setopenImage] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// const queryString = window.location.search;
	// const sp = new URLSearchParams(queryString);
	// sp.get('showModal');
	// let { showModal } = useParams();
	// console.log(sp.get('showModal'), 'param');
	// useEffect(() => {
	// 	if (sp?.get('showModal') === 'true') {
	// 		setopenImage(true);
	// 	}
	// }, [sp]);
	const handleSubmit = () => {
		setIsLoading(true);
		stripConnect(connectId?.connect_account_id)
			.then(res => {
				// console.log(res.data);
				window.open(res?.data?.url, '_self');
				setIsLoading(false);
			})
			.catch(error => {
				setIsLoading(false);
				console.error('data is invalid', error);
			});
		// console.log(param);
	};
	return (
		<div className="m-32">
			<div className="setinfo flex items-center flex-nowrap justify-between mx-auto">
				<span className="totalRooms-heading" style={{ fontWeight:'700'}}>Account</span>
			</div>
			<div className="bg-white rounded mt-28 p-32">
				<span className="" style={{fontSize:'18px' , fontWeight:'700'}}>Account Information</span>
				<div className="flex justify-center">
					<div className="content-div">
						<div className="header">
							{connectId?.account_connected_status
								? 'Stripe account connected'
								: 'Connect your account to Stripe'}
						</div>

						{/* <div class="header">Stripe account connected</div> */}

						<div className="description">
							We use Stripe to make sure you get paid on time and keep your personal and bank details
							secure.
						</div>
						<div>
							{isLoading ? (
								<div className="flex justify-center">
									<CircularProgress className="mx-auto" />
								</div>
							) : (
								<CustomButton
									variant="primary"
									width="161px"
									height="35px"
									// fontSize="15px"
									marginRight="22px"
									onClick={handleSubmit}
								>
									{connectId?.account_connected_status ? 'UPDATE PAYMENT' : 'SET UP PAYMENT'}
								</CustomButton>
							)}
						</div>
					</div>
				</div>
			</div>
			{/* <SuccessDialog open={openimage} setopenImage={setopenImage} /> */}
		</div>
	);
}
