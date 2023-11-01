import React, { useState } from "react";
import ReactAudioPlayer from "react-audio-player";

const SequentialAudioPlayer = ({ audioList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAudioEnded = () => {
    if (currentIndex < audioList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false); // All tracks have been played
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <div>
      {currentIndex < audioList.length && (
        <>
          <ReactAudioPlayer src={audioList[currentIndex]} autoPlay={isPlaying} controls onEnded={handleAudioEnded} />
          <button onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
        </>
      )}
    </div>
  );
};

export default SequentialAudioPlayer;
