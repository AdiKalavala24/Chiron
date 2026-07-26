import React, { useState } from 'react';
import { View, Text } from 'react-native';
import YoutubePlayer, { PLAYER_STATES } from 'react-native-youtube-iframe';
import { useTheme } from '@/theme';
import { CandyButton } from '@/components/ui';
import type { QuestionItem, VideoPayload } from '@/features/curriculum';
import { QuestionCard } from './question-card';

interface VideoCardProps {
  payload: VideoPayload;
  onItemAnswered: (correct: boolean, item: QuestionItem) => void;
  onFinished: () => void;
}

export function VideoCard({ payload, onItemAnswered, onFinished }: VideoCardProps) {
  const theme = useTheme();
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(false);

  return (
    <View>
      <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.xl, color: theme.colors.foreground, marginBottom: theme.space[4] }}>
        {payload.title}
      </Text>

      <View
        style={{
          borderRadius: theme.radius.md,
          overflow: 'hidden',
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.foreground,
          backgroundColor: '#000',
        }}
      >
        <YoutubePlayer
          height={200}
          play={playing}
          videoId={payload.youtubeId}
          onChangeState={(state: PLAYER_STATES) => {
            if (state === PLAYER_STATES.ENDED) {
              setPlaying(false);
              setWatched(true);
            }
          }}
        />
      </View>

      {!watched ? (
        <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
          <CandyButton
            label={playing ? 'Playing…' : "I've watched it"}
            onPress={() => (playing ? setWatched(true) : setPlaying(true))}
            showArrow={false}
            accentColor={theme.colors.secondary}
          />
        </View>
      ) : null}

      {watched && payload.checkQuestions.length > 0 ? (
        <View style={{ marginTop: theme.space[6] }}>
          <QuestionCard
            payload={{ instructions: 'Quick check before we move on!', items: payload.checkQuestions }}
            onItemAnswered={onItemAnswered}
            mode="once"
            onAllItemsComplete={onFinished}
          />
        </View>
      ) : null}

      {watched && payload.checkQuestions.length === 0 ? (
        <View style={{ marginTop: theme.space[6], alignItems: 'flex-start' }}>
          <CandyButton label="Continue" onPress={onFinished} />
        </View>
      ) : null}
    </View>
  );
}
