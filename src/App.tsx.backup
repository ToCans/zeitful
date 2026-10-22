// App.tsx
import 'primereact/resources/themes/tailwind-light/theme.css';
import 'primereact/resources/primereact.min.css';
import './index.css';

import { PrimeReactProvider } from 'primereact/api';
import { useRef, useEffect } from 'react';
import NavBar from './components/NavBar/navBar';
import UserPage from './pages/users/components/userPage';
import Settings from './pages/settings/components/settings';
import Statistics from './pages/statistics/components/statistics';
import { Toast } from 'primereact/toast';
import Timer from './pages/timer/components/timer';

// Zustand Stores
import { useNavigationStore } from './stores/useNavigationStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useDataStore } from './stores/useDataStore';
import { useRefsStore } from './stores/useRefsStore';

function App() {
	const activePage = useNavigationStore((state) => state.activePage);
	const appSettings = useSettingsStore((state) => state.appSettings);
	const loadData = useDataStore((state) => state.loadData);
	const { initializeRefs, cleanup, setToast, setPermission, setSubscription } = useRefsStore();

	const toast = useRef<Toast>(null);

	// Initialize refs on mount
	useEffect(() => {
		initializeRefs();
		return cleanup;
	}, []);

	// Set toast ref
	useEffect(() => {
		if (toast.current) {
			setToast(toast.current);
		}
	}, [setToast]);

	// Load data on mount
	useEffect(() => {
		loadData((msg) => toast.current?.show(msg));
	}, [loadData]);

	// Push notifications setup
	useEffect(() => {
		if ('serviceWorker' in navigator && window.isSecureContext) {
			(async () => {
				try {
					const swRegistration = await navigator.serviceWorker.register('/sw.js');
					console.log('SW registered', swRegistration);
					const pushManager = swRegistration.pushManager;
					if (!pushManager) {
						console.warn('Push manager unsupported');
						return;
					}
					const permissionState = await pushManager.permissionState();
					setPermission(permissionState);
					if (permissionState === 'granted') {
						const subscription = await pushManager.getSubscription();
						setSubscription(subscription);
						console.log('Push registered', subscription);
					}
				} catch (e) {
					console.error('SW registration failed:', e);
				}
			})();
		}
	}, [setPermission, setSubscription]);

	// Prevent scrolling
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, []);

	return (
		<div
			className={`flex flex-col h-dvh w-dvw ${appSettings.darkMode
					? 'bg-zinc-800 text-zinc-100 fill-gray-200 hover:fill-gray-400'
					: 'bg-zinc-100 text-black fill-gray-400'
				} overflow-hidden`}
		>
			<PrimeReactProvider>
				<Toast ref={toast} />
				<div className='flex-1 flex flex-col justify-center items-center overscroll-none'>
					{activePage === 'Timer' && <Timer />}
					{activePage === 'Statistics' && <Statistics />}
					{activePage === 'UserPage' && <UserPage />}
					{activePage === 'Settings' && <Settings />}
				</div>
				<NavBar />
			</PrimeReactProvider>
		</div>
	);
}

export default App;