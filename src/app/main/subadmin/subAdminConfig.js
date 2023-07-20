import SubAdminDashboardConfig from './home/SubAdminDashboardConfig';
import CheckInOutConfig from './checkinout/CheckInOutConfig';
import StudentsConfig from './students/StudentsConfig';
import StudentInformationConfig from './studentInformation/StudentInformationConfig';
import RoomsConfig from './rooms/RoomsConfig';
import StaffConfig from './staff/StaffConfig';
import StaffScheduleConfig from './staffSchedules/StaffScheduleConfig';
import CalendarConfig from './calendar/CalendarConfig';
import EventConfig from './TopEvents/EventsConfig';
import MessagingConfig from './messaging/MessagingConfig';
import SubAdminProfileConfig from './profile/profileConfig';
import ReportsConfig from './reports/ReportsConfig';
import SettingsConfig from './settings/SettingsConfig';
import LivestreamingConfig from './livestreaming/LivestreamingConfig';
import SchoolAdminConfig from './schooladmin/SchoolAdminConfig';
import CompanyReportsConfig from './reports/ReportsConfig'

const subAdminConfig = [
	SubAdminProfileConfig, // done / no need
	SubAdminDashboardConfig, // done / no need
	CheckInOutConfig, //	done / no need
	CalendarConfig, // done / url = '/calendar'
	EventConfig, // done / url='/calendar'
	StudentsConfig, // 	done / url='/students'
	StudentInformationConfig, // done / url ='/students'
	RoomsConfig, // done / url='/rooms'
	StaffConfig, // done / url = '/staff'
	StaffScheduleConfig, // done / url = '/staff-schedule'
	MessagingConfig, // done / url = '/messaging'
	SettingsConfig,
	ReportsConfig, // done / url ='/reports'
	LivestreamingConfig, // done / url ='/livestreaming'
	SchoolAdminConfig,
	CompanyReportsConfig  
];

export default subAdminConfig;
