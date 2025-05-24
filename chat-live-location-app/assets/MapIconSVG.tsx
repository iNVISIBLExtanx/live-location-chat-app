import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

type MapIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

const MapIconSVG: React.FC<MapIconProps> = ({ 
  width = 200, 
  height = 200,
  color = '#4285F4'
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="90" fill="white" />
      <Path
        d="M100 30C61.34 30 30 61.34 30 100C30 138.66 61.34 170 100 170C138.66 170 170 138.66 170 100C170 61.34 138.66 30 100 30ZM100 60C111.05 60 120 68.95 120 80C120 91.05 111.05 100 100 100C88.95 100 80 91.05 80 80C80 68.95 88.95 60 100 60ZM100 154C83.33 154 68.67 146.67 60 134.67C60.33 117.33 77.67 110 100 110C122.33 110 139.67 117.33 140 134.67C131.33 146.67 116.67 154 100 154Z"
        fill={color}
      />
    </Svg>
  );
};

export default MapIconSVG;
