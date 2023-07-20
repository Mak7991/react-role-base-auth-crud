import { Avatar, TableCell } from '@material-ui/core';
import * as Actions from 'app/store/actions';
import { useDispatch } from 'react-redux';
import { generateAgeString } from 'utils/utils';


function RoomsByIdRow({ roomId, row }) {
    const dispatch = useDispatch();

	const handleClick = row => {
		console.log(row);
		dispatch(
			Actions.openDialog({
				children: (
					<div className="bg-white student-list-card">
						<div className="flex justify-between student-list-header">
							<div>
								<h1>Students</h1>
							</div>
							<div>
								<i
									style={{ cursor: 'pointer' }}
									className="fas fa-times"
									onClick={() => dispatch(Actions.closeDialog())}
								/>
							</div>
						</div>
						<div id="scrollable-list" className="student-list-cont w-full">
							{row?.parent?.family_child
								.filter(child => child.school_id === row.school_id)
								.slice(2)
								.map((child, i) => (
									<div className="flex items-center " style={{ padding: 14 }} key={i}>
										<Avatar className="mr-6" alt="student-face" src={child.photo} />
										<div className="flex flex-col items-start">
											<div className="student-name truncate break-word">
												{child.first_name} {child.last_name}
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				)
			})
		);
	};

	return (
		<>
			{roomId === 'All' ? (
				<>
					<TableCell style={{ fontWeight: 700 }}>
						<div className="flex">
							{row?.parent?.family_child
								.filter(child => child.school_id === row.school_id)
								?.map((child, index) => (
									<div className="flex cursor-pointer mr-10 student-div">
										<Avatar className="mr-6" alt="student-face" src={child?.photo} />
										<div className="flex flex-col items-start">
											<div className="medication-homeroom break-word">
												{child?.home_room?.name}
											</div>
											<div className="report-medication break-word">
												{`${child?.first_name} ${child?.last_name}`}{' '}
											</div>
											<div className="font-normal student-age-font">{generateAgeString(child?.date_of_birth)}</div>
										</div>
									</div>
								))
								.splice(0, 2)}
						</div>
					</TableCell>
					<TableCell style={{ padding: 0 }}>
						<div>
							{row?.parent?.family_child.filter(child => child.school_id === row.school_id)?.length >
							2 ? (
								<>
									<div
										onClick={() => handleClick(row)}
										style={{
											cursor: 'pointer',
											fontSize: '11px',
											color: '#008dff',
											fontWeight: 700,
											marginLeft: -12
										}}
									>
										{' '}
										+
										{`${row?.parent?.family_child.filter(child => child.school_id === row.school_id)
											?.length - 2} Others`}
									</div>
								</>
							) : (
								''
							)}
						</div>
					</TableCell>
				</>
			) : (
				<>
					<TableCell style={{ fontWeight: 700 }}>
						<div className="flex">
							{row?.parent?.family_child
								.filter(child => child.home_room.id === roomId)
								?.map((child, index) => (
									<div className="flex cursor-pointer mr-10 student-div">
										<Avatar className="mr-6" alt="student-face" src={child?.photo} />
										<div className="flex flex-col items-start">
											<div className="medication-homeroom break-word">
												{child?.home_room?.name}
											</div>
											<div className="report-medication break-word">
												{`${child?.first_name} ${child?.last_name}`}{' '}
											</div>
											<div className="font-normal student-age-font">{generateAgeString(child?.date_of_birth)}</div>
										</div>
									</div>
								))
								.splice(0, 2)}
						</div>
					</TableCell>
					<TableCell style={{ padding: 0 }}>
						<div>
							{row?.parent?.family_child.filter(child => child.home_room.id === roomId)?.length > 2 ? (
								<>
									<div
										onClick={() => handleClick(row)}
										style={{
											cursor: 'pointer',
											fontSize: '11px',
											color: '#008dff',
											fontWeight: 700,
											marginLeft: -12
										}}
									>
										{' '}
										+
										{`${row?.parent?.family_child.filter(child => child.home_room.id === roomId)
											?.length - 2} Others`}
									</div>
								</>
							) : (
								''
							)}
						</div>
					</TableCell>
				</>
			)}
		</>
	);
}

export default RoomsByIdRow;
