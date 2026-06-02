import React from 'react';
import Svg, { Circle, Line, Path, G } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  status: string;
  size?: number;
  color?: string;
}

export default function WeatherIcon({ status, size = 32, color = colors.accent }: Props) {
  const sw = 2.3;
  const common = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const cloud = 'M15 33 q-7 0 -7 -7 q0 -6 6 -6.6 q1.4 -8 9.6 -8 q7.2 0 8.4 7 q6.6 .2 6.6 7 q0 7.6 -8 7.6 z';

  const renderIcon = () => {
    switch (status) {
      case 'sun':
        return (
          <G {...common}>
            <Circle cx="24" cy="24" r="7.5" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              return (
                <Line key={i}
                  x1={24 + Math.cos(a) * 12.5} y1={24 + Math.sin(a) * 12.5}
                  x2={24 + Math.cos(a) * 17.5} y2={24 + Math.sin(a) * 17.5} />
              );
            })}
          </G>
        );
      case 'partly':
        return (
          <G {...common}>
            <Circle cx="18" cy="18" r="5.5" />
            {[-2.4, -1.2, 0, 1.2, 2.4].map((k, i) => {
              const a = -2.0 + k * 0.55;
              return <Line key={i}
                x1={18 + Math.cos(a) * 8} y1={18 + Math.sin(a) * 8}
                x2={18 + Math.cos(a) * 11.5} y2={18 + Math.sin(a) * 11.5} />;
            })}
            <Path d="M16 36 q-6 0 -6 -6 q0 -5 5.4 -5.6 q1.2 -7 8.6 -7 q6.4 0 7.6 6.2 q5.8 .2 5.8 6.2 q0 6.2 -7 6.2 z" />
          </G>
        );
      case 'mist':
        return (
          <G {...common}>
            {[15, 22, 29, 36].map((y, i) => (
              <Path key={i} d={`M9 ${y} q5 -3 9 0 q5 3 9 0 q5 -3 9 0`} strokeWidth={sw * 0.9} />
            ))}
          </G>
        );
      case 'karl':
        return (
          <G {...common}>
            <Path d={cloud} />
            {[37, 42].map((y, i) => (
              <Path key={i} d={`M12 ${y} q5 -2.6 9 0 q5 2.6 9 0 q4 -2 7 -0.4`} strokeWidth={sw * 0.92} />
            ))}
          </G>
        );
      case 'wind':
        return (
          <G {...common}>
            <Path d="M8 18 h18 a4 4 0 1 0 -4 -4" />
            <Path d="M8 26 h26 a4.5 4.5 0 1 1 -4.5 4.5" />
            <Path d="M8 34 h13 a3.5 3.5 0 1 1 -3.5 3.5" />
          </G>
        );
      case 'rain':
        return (
          <G {...common}>
            <Path d={cloud} />
            {[16, 24, 32].map((x, i) => (
              <Line key={i} x1={x} y1={36} x2={x - 2.5} y2={42.5} strokeWidth={sw * 0.95} />
            ))}
          </G>
        );
      default:
        return <Circle cx="24" cy="24" r="10" {...common} />;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {renderIcon()}
    </Svg>
  );
}
