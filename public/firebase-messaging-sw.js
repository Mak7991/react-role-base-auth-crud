importScripts('https://js.pusher.com/beams/service-worker.js');

importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');
self.addEventListener('fetch', () => {
	const urlParams = new URLSearchParams(location.search);
	self.firebaseConfig = Object.fromEntries(urlParams);
});
PusherPushNotifications.onNotificationReceived = ({ pushEvent, payload }) => {
	let active = false;
	self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function(clients) {
		//you can see your main window client in this list.
		clients.forEach(function(client) {
			client.postMessage({ ...payload, isBg: true });
			if (client.visibilityState === 'visible') {
				console.log('Window active, not showing popup');
				active = true;
			}
		});
	});
	// NOTE: Overriding this method will disable the default notification
	// handling logic offered by Pusher Beams. You MUST display a notification
	// in this callback unless your site is currently in focus
	// https://developers.google.com/web/fundamentals/push-notifications/subscribing-a-user#uservisibleonly_options

	// Your custom notification handling logic here 🛠️
	// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
	if (!active) {
		console.log('Window not active, showing popup');
		pushEvent.waitUntil(
			self.registration.showNotification(payload.notification.title, {
				body: payload.notification.body,
				icon: payload.notification.icon,
				data: payload.data
			})
		);
	}
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const defaultConfig = {
	apiKey: true,
	authDomain: true,
	projectId: true,
	storageBucket: true,
	messagingSenderId: true,
	appId: true,
	measurementId: true
};

firebase.initializeApp(self.firebaseConfig || defaultConfig);

// Retrieve firebase messaging
firebase.messaging();

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('../firebase-messaging-sw.js')
		.then(function(registration) {
			// registration.active.postMessage("your message");
			console.log('Registration successful, scope is:', registration.scope);
		})
		.catch(function(err) {
			console.log('Service worker registration failed, error:', err);
		});
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
	console.log('ABC ', payload);
	self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function(clients) {
		//you can see your main window client in this list.
		clients.forEach(function(client) {
			console.log(client);
			client.postMessage(payload);
		});
	});
	// Customize notification here
	if (payload.notification) {
		const notificationTitle = payload.notification.title;
		const notificationOptions = {
			body: payload.notification.body,
			icon: payload.notification.title
		};
		self.registration.showNotification(notificationTitle, notificationOptions);
	}
});
