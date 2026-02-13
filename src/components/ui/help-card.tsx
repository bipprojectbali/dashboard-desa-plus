import { Card, useMantineTheme, useComputedColorScheme } from '@mantine/core';
import type { CardProps } from '@mantine/core';
import type { ReactNode } from 'react';

interface HelpCardProps extends CardProps {
  children: ReactNode;
  icon?: ReactNode;
  title?: string;
  minHeight?: string | number; // Allow specifying a minimum height
}

export const HelpCard = ({
  children,
  icon,
  title,
  minHeight = 'auto', // Default to auto, but allow override
  ...props
}: HelpCardProps) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const isDark = colorScheme === 'dark';

  return (
    <Card
      shadow="sm"
      padding="xl"
      radius="md"
      withBorder
      style={{
        backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
        borderRadius: '16px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: `1px solid ${
          isDark ? theme.colors.dark[4] : theme.colors.gray[3]
        }`,
        minHeight, // Apply the minimum height
        display: 'flex',
        flexDirection: 'column',
      }}
      {...props}
    >
      {(icon || title) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {icon && (
            <div
              style={{
                backgroundColor: isDark
                  ? theme.colors.blue[8]
                  : theme.colors.blue[0],
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}

          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: isDark
                  ? theme.colors.dark[0]
                  : theme.colors.dark[9],
              }}
            >
              {title}
            </h3>
          )}
        </div>
      )}

      <div style={{ flex: 1 }}>
        {children}
      </div>
    </Card>
  );
};
