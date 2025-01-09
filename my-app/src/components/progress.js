import { ActionIcon, RingProgress, Center, Text } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';

const ProgressWithPlayButton = () => {
  return (
    <Center style={{ position: 'relative', width: rem(120), height: rem(120) }}>
      <RingProgress
        sections={[{ value: 70, color: 'blue' }]}  // Example: 70% completion
        size={120}
        label={<Text size="lg" align="center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>70%</Text>}
      />
      <ActionIcon
        size="lg"
        color="blue"
        variant="filled"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <IconPlayerPlay size={24} />
      </ActionIcon>
    </Center>
  );
};

export default ProgressWithPlayButton;
