import {ActionIcon,  RingProgress} from "@mantine/core";
import {IconPlayerPlayFilled} from "@tabler/icons-react";
import "./PlayButton.css";

const PlayButton = ({ progress, isPlaying, playCount, stopSnippet, playSnippet }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <RingProgress
        size={150}
        thickness={8}
        rootColor="#44354f"
        sections={[{ value: progress, color: "#73687b" }]}
      />
      <ActionIcon
        size={60}
        className="play-music-button"
        variant="filled"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
        }}
        onClick={isPlaying ? stopSnippet : playSnippet}
        disabled={playCount >= 1}
      >
        <IconPlayerPlayFilled size={30} className="play-icon" style={{ color: "white" }} />
      </ActionIcon>
    </div>
  );
export default PlayButton;