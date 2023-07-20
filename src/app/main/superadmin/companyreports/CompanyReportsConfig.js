import authRoles from '../../../auth/authRoles';
import CompanyReports from './CompanyReports';
import AllergyReports from './Allergy';
import EmergencyContact from './EmergencyContact';
import Staff from './Staff';
import EnrolledStudent from './EnrolledStudent';
import ParentReports from './ParentReports';
import SchoolRoyaltiesReport from './SchoolRoyaltiesReport';
import ImmunizationReport from './ImmunizationReport';

// import  ParentReports from './ParentReports';

const CompanyReportsConfig = {
	settings: {
		layout: {
			Config: {}
		}
	},
	routes: [
		{
			path: '/company-reports',
			component: CompanyReports
		},
		{
			path: '/allergy-report',
			component: AllergyReports
		},
		{
			path: '/ParentReports',
			component: ParentReports
		},
		{
			path: '/emergencyContact-report',
			component: EmergencyContact
		},
		{
			path: '/staff-report',
			component: Staff
		},
		{
			path: '/enrolledStudent-report',
			component: EnrolledStudent
		},
		{
			path: '/schoolRoyalties-report',
			component: SchoolRoyaltiesReport
		},
		{
			path: '/immunization-report',
			component: ImmunizationReport
		}
	],
	auth: authRoles.admin
};

export default CompanyReportsConfig;
