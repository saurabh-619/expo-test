import { Expo } from "expo-server-sdk";

// Create a new Expo SDK client
let expo = new Expo({
  //   accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true, // this can be set to true in order to use the FCM v1 API
});

let tickets: any[] = [];

const sendTestNotifications = async () => {
  let messages = [];
  const somePushTokens: any[] = [
    process.env.TEST_DEVICE_EXPO_TOKEN,
    "ExponentPushToken[p35M3yHNcKsPe405pkjvsfSAURABH]", //incorrect token
  ];
  for (let pushToken of somePushTokens) {
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      body: "This is a test notification",
      data: { withSome: "yooo" },
    });
  }

  let chunks = expo.chunkPushNotifications(messages as any);

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log({ chunk, len: chunk.length, ticketChunk });
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
};

const checkReciepts = async () => {
  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.status === "ok") {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log({ receipts });

      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId] as any;
        if (status === "ok") {
          continue;
        } else if (status === "error") {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            console.error(`The error code is ${details.error}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};






sendTestNotifications();
setTimeout(checkReciepts, 5000);
