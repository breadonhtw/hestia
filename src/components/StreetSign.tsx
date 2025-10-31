type StreetSignProps = {
  text?: string;
  className?: string;
  textClassName?: string;
};

export function StreetSign({
  text = "Neighbourhood's",
  className = "",
  textClassName = "text-white",
}: StreetSignProps) {
  return (
    <span
      className={
        "inline-block align-middle relative select-none rounded-full leading-none " +
        className
      }
      aria-label={text}
      style={{
        backgroundImage: "url(/signage.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        padding: "0.3em 0.7em",
        height: "1.8em",
        verticalAlign: "middle",
      }}
    >
      <span
        className={
          "font-semibold tracking-wide transition-colors duration-300 " +
          textClassName
        }
        style={{
          fontSize: "1em",
          lineHeight: 1,
        }}
      >
        {text}
      </span>
    </span>
  );
}

export default StreetSign;
