import axios from 'axios';

const registerCamera = data => {
	return axios.post('api/v1/school/register-camera', data);
};

const getRooms = (search = '', status = '', page = 1) => {
	return axios.get(
		`api/v1/school/streaming/rooms?page=${page}&search=${search}&active=${
			status === 1 ? 'true' : status === 2 ? 'false' : ''
		}`
	);
};
// const getHistoryVideo = (date, id) => {
// 	return axios.get(`api/v1/school/streaming/recorded-clips?date=${date}&room_id=${id}`);
// };
const getHistoryVideo = (startDate, endDate, id) => {
	return axios.post(`${process.env.REACT_APP_HISTORY_VIDEO_URL}api/school-session-url/`, {
		room_id: id,
		start_time: startDate,
		end_time: endDate
	});
};

const getCameraListing = page => {
	return axios.get(`api/v1/school/camera?page=${page}`);
};

const deleteCamera = id => {
	return axios.delete(`api/v1/school/camera/${id}`);
};

const getclips = page => {
	return axios.get(`api/v1/school/streaming/saved-clips?page=${page}`);
};

const deleteclip = id => {
	return axios.delete(`api/v1/school/clip/${id}`);
};

const saveRoomClips = data => {
	return axios.post('api/v1/school/streaming/store-clip', data);
};
const getMutedClip = clipId => {
	return axios.post('https://stage.iot.perfectdaylive.com/api/stream-download', {
		clip_id: clipId,
		is_audio_enabled: 0
	});
};
export {
	registerCamera,
	getRooms,
	getCameraListing,
	deleteCamera,
	getclips,
	deleteclip,
	getHistoryVideo,
	saveRoomClips,
	getMutedClip
};
