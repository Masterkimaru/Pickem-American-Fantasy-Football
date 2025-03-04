import { View, Text, Switch } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Notifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mockNotifications] = useState([
    { id: '1', text: 'Week 1 results are in!', date: '2023-11-01' },
    { id: '2', text: 'Reminder: Picks lock in 2 hours', date: '2023-11-05' },
  ]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white p-4 rounded-lg mb-4">
        <Text className="text-lg font-bold mb-2">Notification Settings</Text>
        <View className="flex-row justify-between items-center">
          <Text>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
      </View>

      <Text className="text-lg font-bold mb-2">Recent Notifications</Text>
      {mockNotifications.map(notification => (
        <View key={notification.id} className="bg-white p-4 rounded-lg mb-2">
          <Text className="text-gray-600 text-sm mb-1">{notification.date}</Text>
          <Text>{notification.text}</Text>
        </View>
      ))}
    </SafeAreaView>
  );
}
