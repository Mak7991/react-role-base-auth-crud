/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { CircularProgress } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { enableImmunizations } from 'app/services/immunizations/Immunization';

function ImmunizationListDialog({ rows, enabled, studentId, refresh, setRefresh }) {
	const dispatch = useDispatch();
	const [sending, setSending] = useState(false);
	const [activeImm, setActiveImm] = useState(enabled.filter(imm => imm.is_enabled).map(imm => imm.immunization_id));

	const handleEnableDisable = id => {
		if (activeImm.indexOf(id) === -1) {
			setActiveImm([...activeImm, id]);
		} else {
			setActiveImm([...activeImm.slice(0, activeImm.indexOf(id)), ...activeImm.slice(activeImm.indexOf(id) + 1)]);
		}
	};

	const handleSubmit = () => {
		setSending(true);
		enableImmunizations({ student_id: studentId, immunization_id: activeImm })
			.then(res => {
				setRefresh(refresh + 1);

				dispatch(Actions.closeDialog());
			})
			.catch(err => {
				setSending(false);
				dispatch(
					Actions.showMessage({
						message: 'Please select atleast one immunization.'
					})
				);
			});
	};

	return (
		<div className="bg-white px-32 school-list-card">
			<div className="flex justify-between align-top school-list-header">
				<div>
					<h1 className="mb-0" style={{ fontSize: '20px', fontWweight: '700' }}>
						Immunization Settings
					</h1>
					<p style={{ fontSize: '12px', color: '#818181', fontWeight: '300' }}>
						Which immunization should appear on reports and student records?
					</p>
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
				{rows?.map((immu, i, arr) => {
					return (
						<div
							style={{
								cursor: 'pointer'
							}}
							key={immu.id}
						>
							<div
								className="p-16 flex justify-between items-center"
								onClick={() => handleEnableDisable(immu.id)}
								style={{ gap: 10 }}
							>
								<div>{immu.name.split('-')[0]}</div>
								<div
									className="tick-wrapper-custom"
									style={{
										background: activeImm.includes(immu.id) ? '#4DA0EE' : 'white',
										padding: '2px 5px'
									}}
								>
									<i className="fas fa-check" />
								</div>
							</div>
							{i !== arr.length - 1 && <hr style={{ borderColor: 'lightgray' }} />}
						</div>
					);
				})}
			</div>
			<div className="w-full flex justify-center">
				{sending ? (
					<div className="w-1/12 mx-auto mt-24">
						<CircularProgress size={35} />
					</div>
				) : (
					<div className="flex mt-24" style={{ gap: '10px' }}>

						<CustomButton onClick={() => dispatch(Actions.closeDialog())} variant="secondary">
							Cancel
						</CustomButton>
						<CustomButton onClick={handleSubmit} variant="primary">
							Apply
						</CustomButton>
					</div>
				)}
			</div>
		</div>
	);
}

export default ImmunizationListDialog;
