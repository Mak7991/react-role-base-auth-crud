// Internet Explorer 11 requires polyfills and partially supported by this project.
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-muli';
import './i18n';
import './react-chartjs-2-defaults';
import './react-table-defaults';
import './styles/index.css';
import App from 'app/App';
import axios from 'axios';
import JwtService from 'app/services/jwtService';
import * as serviceWorker from './serviceWorker';
// import ReactGA from 'react-ga4';

axios.defaults.baseURL = process.env.REACT_APP_API_ENDPOINT;
axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(err) => {
		return new Promise((resolve, reject) => {
			if (err?.response?.status === 401 && err?.config && !err?.config?.__isRetryRequest) {
				// if you ever get an unauthorized response, logout the user
				JwtService.logout();
				JwtService.emit('onAutoLogout', err?.response?.data?.message);
			}
			throw err;
		});
	}
);

// ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID || '');

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
