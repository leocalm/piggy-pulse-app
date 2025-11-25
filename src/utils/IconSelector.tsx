import { useState } from 'react';
import { ActionIcon, Popover, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { getIcon, iconMap } from '@/utils/IconMap';
import classes from './IconSelector.module.css';

interface IconSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  size?: number;
}

export function IconSelector({ value = 'wallet', onChange, size = 20 }: IconSelectorProps) {
  const [opened, setOpened] = useState(false);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpened(false);
  };

  return (
    <Popover width={300} position="bottom-start" opened={opened} onChange={setOpened}>
      <Popover.Target>
        <ActionIcon variant="default" size="lg" onClick={() => setOpened((o) => !o)}>
          {getIcon(value, size)}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <Text size="sm" fw={500} mb="xs">
          Select an icon
        </Text>
        <SimpleGrid cols={5} spacing="xs">
          {Object.keys(iconMap).map((iconName) => (
            <UnstyledButton
              key={iconName}
              onClick={() => handleSelect(iconName)}
              className={classes.iconButton}
              data-active={value === iconName || undefined}
            >
              {getIcon(iconName, 24)}
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Popover.Dropdown>
    </Popover>
  );
}
