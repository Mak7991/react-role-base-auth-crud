import authRoles from '../../../auth/authRoles';
import FileUpload from './FileUpload';

const FileUploadConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/fileUpload',
			component: FileUpload
		}
	],
	auth: authRoles.admin
};

export default FileUploadConfig;
