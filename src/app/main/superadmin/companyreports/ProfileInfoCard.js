/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Avatar, IconButton, Dialog, makeStyles } from '@material-ui/core';
import { Close, VisibilityOutlined, VisibilityOffOutlined } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import React, { useState } from 'react';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { Link } from 'react-router-dom';
import { BsEnvelope } from 'react-icons/bs';
// import './profileInfoCard.css';

const useStyles = makeStyles(() => ({
	backDrop: {
		backdropFilter: 'blur(10px)',
		backgroundColor: 'rgba(0,0,30,0.4)'
	}
}));

const test = `${window.location.origin}/assets/images/profile1.jpg`;

function ProfileInfoCard({ row, self }) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const isParent = self.role === 'parent' ? 1 : '';
	const canPickup = self.can_pickup;
	const [isHidden, setIsHidden] = useState(true);
	const [pictureLarge, setPictureLarge] = useState(false);

	const PictureLarge = () => {
		setPictureLarge(true);
		// dispatch(Actions.openDialog({ children: <Profile row={row} self={self} /> }));
	};
	return (
		<>
			{pictureLarge && (
				<Dialog
					open={pictureLarge}
					BackdropProps={{
						classes: {
							root: classes.backDrop
						}
					}}
					onClose={() => {
						setPictureLarge(false);
					}}
				>
					<div className="larg_image flex flex-col">
						<div
							className="self-end cursor-pointer absolute profile-close"
							onClick={() => setPictureLarge(false)}
						>
							<Close />
						</div>
						<img alt={self.first_name} src={self?.photo ? self?.photo : test} />
					</div>
				</Dialog>
			)}
			<div className="bg-white profile-card-wrapper p-16">
				<div
					className="flex flex-col items-center"
					style={{
						gap:
							self.relation_with_child === 'Father' || self.relation_with_child === 'Mother'
								? 'auto'
								: '4px'
					}}
				>
					<div className="self-end mb-14 cursor-pointer" onClick={() => dispatch(Actions.closeDialog())}>
						<Close />
					</div>
					<div className="">
						<Avatar
							style={{ height: 70, width: 70 }}
							src={self?.photo ? self?.photo : test}
							onClick={PictureLarge}
						/>
					</div>
					<div className="mt-8 font-bold text-lg text-center w-full break-word">
						{self.first_name} {self.last_name}
					</div>
					<div className="mt-2" style={{ textTransform: 'capitalize' }}>
						{self.relation_with_child}
					</div>
					{/* <div className="flex justify-evenly w-7/12 my-8">
						{isParent && (
							<CustomButton variant="primary" className="impppp">
								<img
									width="16px"
									style={{ display: 'inline' }}
									src="/assets/images/chat-1.png"
									alt="chat"
								/>{' '}
								Message
							</CustomButton>
						)}
						<Link
							className="link"
							to="#"
							onClick={e => {
								window.location = `mailto:${self?.email}`;
								e.preventDefault();
							}}
						>
							<CustomButton variant="secondary">
								<div className="flex items-center justify-center gap-x-6">
									<BsEnvelope /> <span className="ml-2">Email</span>
								</div>
							</CustomButton>
						</Link>
					</div> */}
					<div className="pl-20 pr-32 mt-10">
						<div
							className="grid grid-cols-3"
							style={{
								gap:
									self.relation_with_child === 'Father' || self.relation_with_child === 'Mother'
										? 'auto'
										: '8px'
							}}
						>
							<div className="my-8">
								<div style={{ fontSize: 10 }}>Child Name</div>
								<div style={{ fontSize: 13 }} className="font-bold turncate break">
									{row.first_name} {row.last_name}
								</div>
							</div>
							<div className="my-8" />
							<div className="my-8">
								<div style={{ fontSize: 10 }}>Phone Number</div>
								<div style={{ fontSize: 13 }} className="font-bold">
									{self.phone}
								</div>
							</div>
							<div className="my-8">
								<div style={{ fontSize: 10 }}>Email Address</div>
								<div style={{ fontSize: 13 }} className="font-bold">
									{self?.email?.length < 25
										? self.email
										: `${self?.email?.slice(0, 25)}\n${self?.email?.slice(25)}`}
									{/* {self.email} */}
								</div>
							</div>
							<div className="my-8" />
							{/* <div className="my-8">
								<div style={{ fontSize: 10 }}>Can pick up</div>
								<div className="flex">
									<div
										className="tick-wrapper-profile mr-12"
										style={{ background: canPickup ? '#4DA0EE' : 'white' }}
									>
										<i style={{ fontSize: 10 }} className="fas fa-check mr-2" />
									</div>
									<span className="font-bold">Yes</span>
									<div
										className="tick-wrapper-profile ml-12 mr-8"
										style={{ background: !canPickup ? '#4DA0EE' : 'white' }}
									>
										<i style={{ fontSize: 10 }} className="fas fa-check mr-2" />
									</div>
									<span className="font-bold">No</span>
								</div>
							</div> */}
							{/* {isParent && (
								<div className="my-8">
									<div style={{ fontSize: 10 }}>Check-in Code</div>
									<div style={{ fontSize: 13 }} className="font-bold">
										{isHidden
											? self.checkin_code
													.split('')
													.map(() => '*')
													.join('')
											: self.checkin_code}
										<IconButton onClick={() => setIsHidden(!isHidden)}>
											{isHidden ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
										</IconButton>
									</div>
								</div>
							)} */}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default ProfileInfoCard;
