// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
// Utils Imports
import getWaveFillColor from "../utils/waveAnimation";

// Interface Definition
interface WavesAnimationProps {
  progress: number;
  timerColor: string;
}

// Component Definition
const WavesAnimation = ({ progress, timerColor }: WavesAnimationProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);

  // Handling animation offset when the container is nearly full
  const nearlyFullProgress = (progress: number): number => {
    let fillHeightOffset: number;
    if (progress > 90) {
      fillHeightOffset = (25 * (progress - 90)) / 10;
      return fillHeightOffset;
    }
    return 0;
  };

  return (
    <div
      className="absolute z-10 bottom-0 left-0 w-full transition-all duration-500 ease-out overflow-hidden"
      style={{
        height: `${progress}%`,
        backgroundColor: `#${timerColor}`,
      }}
    >
      <svg
        className="relative top-0 w-full h-[25px] rotate-180"
        style={{ top: `-${nearlyFullProgress(progress)}px` }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 
                          58 18 88 18 v44h-352z"
          />
        </defs>
        <g className="parallax">
          <use
            href="#gentle-wave"
            x="48"
            y="0"
            fill={getWaveFillColor(darkMode, 0.7)}
            className="animate-move-forever [animation-delay:-2s] [animation-duration:7s]"
          />
          <use
            href="#gentle-wave"
            x="48"
            y="3"
            fill={getWaveFillColor(darkMode, 0.5)}
            className="animate-move-forever [animation-delay:-3s] [animation-duration:10s]"
          />
          <use
            href="#gentle-wave"
            x="48"
            y="5"
            fill={getWaveFillColor(darkMode, 0.3)}
            className="animate-move-forever [animation-delay:-4s] [animation-duration:13s]"
          />
          <use
            href="#gentle-wave"
            x="48"
            y="7"
            fill={getWaveFillColor(darkMode, 1.0)}
            className="animate-move-forever [animation-delay:-5s] [animation-duration:20s]"
          />
        </g>
      </svg>
    </div>
  );
};

export default WavesAnimation;
