/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import { getCompanySchools } from 'app/services/schools/schools';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@material-ui/core';
import JwtService from 'app/services/jwtService';
import * as UserActions from 'app/auth/store/actions/user.actions';
import history from '@history';
import axios from 'axios';
import { sendFCMTokenToBackend } from 'app/services/notifications/fcmServices';
import secureLocalStorage from 'react-secure-storage';

function SchoolListDialog() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [isLoading, setIsLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [rows, setRows] = useState([]);
	const [activeId, setActiveId] = useState(null);

	useEffect(() => {
		setIsLoading(true);
		getCompanySchools('', '', '', 1, '', user.role[0] !== 'super_admin')
			.then(res => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					// setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(res.data.data);
				setIsLoading(false);
			})
			.catch(err => {
				setIsLoading(false);
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			});
		// eslint-disable-next-line
	}, []);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getCompanySchools('', '', '', page, '', user.role[0] !== 'super_admin')
			.then(res => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(rows.concat(res.data.data));
				setFetchingMore(false);
			})
			.catch(err => {
				setFetchingMore(false);
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			});
	};


	return (
		<div className="bg-white px-32 school-list-card">
			<div className="flex justify-between school-list-header">
				<div>
					<h1 style={{ fontSize: '20px', fontWeight: '700' }}> Select School</h1>
				</div>
				<div>
					<i
						style={{ cursor: 'pointer' }}
						className="fas fa-times"
						onClick={() => dispatch(Actions.closeDialog())}
					/>
				</div>
			</div>
			<div id="scrollable-list" className="school-list-cont w-full">
				{isLoading ? (
					<div className="w-1/12 mx-auto mt-16">
						<CircularProgress size={35} />
					</div>
				) : (
					rows
						?.filter(school => school.status)
						?.map((school, i, arr) => {
							return (
								<div
									onClick={() => setActiveId(school.id)}
									style={{
										cursor: 'pointer',
										background: school.id === activeId ? '#F0F9FF' : 'white'
									}}
									key={school.id}
								>
									<div className="p-16 flex justify-between">
										<div className="hd-school hd-schooling">
											<h5>{school.name}</h5>
										</div>
										<div
											className="tick-wrapper-custom school-ticket"
											style={{ background: school.id === activeId ? '#4DA0EE' : 'white' }}
										>
											<i className="fas fa-check" />
										</div>
									</div>
									{i !== arr.length - 1 && <hr style={{ borderColor: 'lightgray' }} />}
								</div>
							);
						})
				)}
				{fetchingMore ? (
					<div className="w-1/12 mx-auto">
						<CircularProgress size={35} />
					</div>
				) : (
					<></>
				)}
			</div>
			<div className="w-full flex justify-center">
				{loading ? (
					<div className="w-1/12 mx-auto mt-24">
						<CircularProgress size={35} />
					</div>
				) : (
					<button
						type="button"
						className="view-school-btn"
					>
						View School
					</button>
				)}
			</div>
			<InfiniteScroll
				dataLength={rows.length}
				next={handleLoadMore}
				hasMore={hasMore}
				scrollableTarget="scrollable-list"
			/>
		</div>
	);
}

export default SchoolListDialog;
