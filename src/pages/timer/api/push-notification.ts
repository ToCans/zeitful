// api/push-notification.ts
import { useRefsStore } from "../../../stores/useRefsStore";

// Helper function to convert VAPID key
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Subscribe to Push Notifications Function
export const subscribeToPush = async (): Promise<void> => {
  try {
    // Check for service worker support
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      console.warn("Service workers or secure context not available");
      return;
    }

    // Service Worker Registration
    const swRegistration = await navigator.serviceWorker.getRegistration();
    if (!swRegistration) {
      console.log("Service worker not registered");
      return;
    }

    // Push Manager Handling
    const pushManager = swRegistration.pushManager;
    if (!pushManager) {
      console.log("No push manager available");
      return;
    }

    // Request notification permission first
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    // Public Vapid Key and Push Notification Setup
    const vapidPublicKey =
      "BHGdYzDyrzWfiOnGnsP4BeQoSJsz87wECZKcGp_scaEQi3Zdzh1xiF6Gb_6NHEHArCZwmuinG4lZW3sG12R8NMM";
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    const pushSubscription = await pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey as BufferSource,
    });

    // Update Zustand store with permission and subscription
    const { setPermission, setSubscription } = useRefsStore.getState();
    setPermission(permission);
    setSubscription(pushSubscription);

    console.log("Push subscription successful", pushSubscription);
  } catch (error) {
    console.error("Subscription error", error);
  }
};

// Send Push Notification Interface
interface PushNotificationParams {
  cycleNumber: number;
  subscription: PushSubscription | null;
}

// Send Push Notification Function
export const sendPushNotification = async ({
  cycleNumber,
  subscription,
}: PushNotificationParams) => {
  if (subscription === null) {
    console.log("No push subscription available");
    return;
  }

  try {
    // Sends notification based on cycle number
    const response = await fetch(
      "https://zeitful-server.vercel.app/api/send-push-notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cycleNumber,
          pushSubscription: subscription,
        }),
      },
    );

    // Notification Server Response
    if (response.ok) {
      console.log("Notification request sent to server!");
    } else {
      console.error("Failed to send notification");
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
