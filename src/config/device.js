import { v4 as uuidv4 } from "uuid";
import {localStorage} from "window";

export const getDeviceInfo = () => {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("deviceId", deviceId);
  }

  return {
    deviceId,
    deviceType: "WEB",
    deviceName: "Chrome Browser",
    fcmToken: localStorage.getItem("fcmToken") || null,
  };
};