import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Rocket, Users } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { ConfettiField, DecorCircle, IconBadge, StickerCard } from '@/components/ui';
import { useProfileStore } from '@/stores/profile-store';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ensureActiveChild = useProfileStore((s) => s.ensureActiveChild);

  const handleKid = () => {
    ensureActiveChild();
    router.push('/kid/grade');
  };

  const handleParent = () => {
    router.push('/parent');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ position: 'absolute', top: -120, alignSelf: 'center' }} pointerEvents="none">
        <DecorCircle size={380} color={theme.colors.tertiary} opacity={0.55} />
      </View>
      <ConfettiField />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: theme.space[6] }}>
          <View style={{ alignItems: 'center', marginBottom: theme.space[10] }}>
            <Text
              style={{
                fontFamily: theme.fontFamily.headingExtraBold,
                fontSize: theme.fontSize['5xl'],
                color: theme.colors.foreground,
                textAlign: 'center',
              }}
            >
              Chiron
            </Text>
            <Text
              style={{
                marginTop: theme.space[3],
                fontFamily: theme.fontFamily.bodyMedium,
                fontSize: theme.fontSize.lg,
                color: theme.colors.mutedForeground,
                textAlign: 'center',
              }}
            >
              A learning adventure that adapts to you.
            </Text>
          </View>

          <View style={{ gap: theme.space[5] }}>
            <StickerCard
              title="I'm a Kid"
              subtitle="Start learning and playing"
              accentColor={theme.colors.accent}
              icon={<IconBadge size={48} backgroundColor={theme.colors.accent} icon={<Rocket size={22} color="#fff" strokeWidth={2.5} />} />}
              onPress={handleKid}
              testID="home-kid-card"
            />
            <StickerCard
              title="I'm a Parent"
              subtitle="See progress and guidance"
              accentColor={theme.colors.secondary}
              icon={<IconBadge size={48} backgroundColor={theme.colors.secondary} icon={<Users size={22} color="#fff" strokeWidth={2.5} />} />}
              onPress={handleParent}
              testID="home-parent-card"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
