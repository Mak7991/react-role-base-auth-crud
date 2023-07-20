import LoginPageConfig from './auth/login/LoginPageConfig';
import ResetPasswordPageConfig from './auth/reset-password/ResetPasswordPageConfig';
import ForgotPasswordPageConfig from './auth/forgot-password/ForgotPasswordPageConfig';
import Error404PageConfig from './errors/404/Error404PageConfig';
import Error500PageConfig from './errors/500/Error500PageConfig';
import OtpConfig from './auth/otp/OtpConfig';
import SuccessfulPageConfig from './auth/Succesful/SuccessfulPageConfig';
import StudentFormConfig from './parent/studentForm/StudentFormConfig';

const pagesConfigs = [
	StudentFormConfig,
	LoginPageConfig,
	ResetPasswordPageConfig,
	ForgotPasswordPageConfig,
	OtpConfig,
	SuccessfulPageConfig,
	Error404PageConfig,
	Error500PageConfig
];

export default pagesConfigs;
