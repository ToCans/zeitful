// Interface Defintion
interface ColorIconProps {
  color: string;
}
// Component Definition
const ColorIcon = ({ color }: ColorIconProps) => {
  return (
    <span
      className={`min-h-4 min-w-4 h-4 w-4 border-2 mr-2 border-slate-500 rounded-md`}
      style={{ backgroundColor: `${color}` }}
    ></span>
  );
};

export default ColorIcon;
