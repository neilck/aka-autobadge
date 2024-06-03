"use client";

interface AwardButtonProps {
  token: string;
  disabled: boolean;
}

export const AwardButton = (props: AwardButtonProps) => {
  const { token, disabled } = props;
  const handleClick = () => {
    console.log(`AwardButton token: ${token}`);
  };

  return (
    <button disabled={disabled} onClick={handleClick}>
      Award Badge
    </button>
  );
};
