import { initializeApp } from 'firebase/app';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const getAgeDetails = (oldDate, newDate) => {
	if (oldDate.isValid()) {
		const years = newDate.diff(oldDate, 'year');
		const allMonths = newDate.diff(oldDate, 'month');
		const months = newDate.diff(oldDate, 'month') - years * 12;
		const days = newDate.diff(oldDate.add(years, 'year').add(months, 'month'), 'day');
		return {
			years,
			months,
			allMonths,
			days,
			allDays: newDate.diff(oldDate, 'day'),
		};
	} else {
		return null;
	}
};

const generateAgeString = (dob) => {
	const details = getAgeDetails(dayjs(dob), dayjs());
	if (details) {
		return `${details.years !== 0 ? `${details.years} year` : ''}${details.years > 1 ? 's' : ''}${
			details.months !== 0 ? ` ${details.months} month` : ''
		}${details.months > 1 ? 's' : ''}${details.days !== 0 ? ` ${details.days} day` : ''}${
			details.days > 1 ? 's' : ''
		}`;
	} else {
		return '-';
	}
};

const scrollIntoView = (id) => {
	const element = document.getElementById(id);
	if (element) {
		element.scrollIntoView();
	}
};

// Initialize Firebase
const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID,
	measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);

const getImageUrl = (file) => {
	const file_Name = file.name;
	const fileExtension = file_Name.split('.').pop();
	const uuid = uuidv4();
	const newFileName = `${uuid}.${fileExtension}`;
	const filename = `web/public/profile_images/${newFileName}`;
	return filename;
};

function convertTimeTo12HourFormat(time) {
	let timeArray = time.split(':');
	let hours = parseInt(timeArray[0]);
	let minutes = timeArray[1];
	let period = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12 || 12;
	return hours + ':' + minutes + ' ' + period;
}

const getDay_time = (e) => {
	// Get the current date and time
	const now = dayjs(`${e}Z`);
	// Get the date and time for yesterday
	const yesterday = dayjs(`${e}Z`).subtract(1, 'day');

	// Get the date and time for the day before yesterday
	const dayBeforeYesterday = dayjs(`${e}Z`).subtract(2, 'day');

	// Calculate the string based on the relative time
	let result = '';
	if (now.isSame(dayjs(), 'day')) {
		result = 'Today ' + now.format('h:mm A');
	} else if (yesterday.isSame(dayjs(), 'day')) {
		result = 'Yesterday ' + yesterday.format('h:mm A');
	} else if (dayBeforeYesterday.isSame(dayjs(), 'day')) {
		result = dayBeforeYesterday.format('DD/MM/YY ') + dayBeforeYesterday.format('h:mm A');
	}
	return result;
};

// const today = new Date();
// const filedate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
// const time = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
// const dateTime = `${filedate}-${time}`;
// const filename = `web/public/profile_images/${dateTime}_${selectedFile.name.split(' ').join('_')}`;

export { getAgeDetails, scrollIntoView, app, generateAgeString, getImageUrl, convertTimeTo12HourFormat, getDay_time };
