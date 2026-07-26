import { Tabs } from 'expo-router';
import { BookOpen, House, MessageCircleHeart } from 'lucide-react-native';

import { IconBadge } from '@/components/ui/icon-badge';
import { BorderWidth, FontWeights, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A custom-styled `Tabs` bar rather than `expo-router/unstable-native-tabs`:
 * the native tab bar can't get the chunky border + pill icon-badge look the
 * design system calls for, so we trade native tab-bar chrome for full
 * control over it.
 */
export default function AppTabs() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: BorderWidth.default,
          borderTopColor: theme.foreground,
          height: 88,
          paddingTop: 10,
        },
        tabBarLabelStyle: { ...Type.xs, ...FontWeights.bodyBold },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <IconBadge
              size={34}
              color={focused ? 'accent' : 'muted'}
              icon={<House size={17} color={focused ? theme.accentForeground : theme.mutedForeground} strokeWidth={2.5} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lesson"
        options={{
          title: 'Lesson',
          tabBarIcon: ({ focused }) => (
            <IconBadge
              size={34}
              color={focused ? 'accent' : 'muted'}
              icon={<BookOpen size={17} color={focused ? theme.accentForeground : theme.mutedForeground} strokeWidth={2.5} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="debrief"
        options={{
          title: 'Debrief',
          tabBarIcon: ({ focused }) => (
            <IconBadge
              size={34}
              color={focused ? 'accent' : 'muted'}
              icon={<MessageCircleHeart size={17} color={focused ? theme.accentForeground : theme.mutedForeground} strokeWidth={2.5} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}
