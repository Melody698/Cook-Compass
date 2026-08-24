import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/StepByStep.css"; 
import Alarm from "../assets/alarm.wav";

const SavedStepByStep = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const res = await fetch(`http://localhost:5000/api/saved-recipes?userId=${userId}`);
        const data = await res.json();
        const match = data.recipes?.find(r => r._id === id);
        setSelectedRecipe(match || null);
      } catch (err) {
        console.error("Error fetching saved recipe:", err);
      }
    };

    fetchSavedRecipes();
  }, [id]);

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => setTime(prev => prev - 1), 1000);
    } else if (time === 0) {
      if (isRunning) {
        const timesUp = new Audio(Alarm);
        timesUp.play();
      }
      clearInterval(timer);
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  if (!selectedRecipe) return <p>Recipe not found.</p>;

  const handleNext = () => {
    if (currentStep < selectedRecipe.instructions.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleReturn = () => navigate(`/saved-instructions/${id}`);

  const progressPercentage = ((currentStep + 1) / selectedRecipe.instructions.length) * 100;

  const handleStartTimer = () => time > 0 && setIsRunning(true);
  const handlePauseTimer = () => setIsRunning(false);
  const handleResetTimer = () => { setIsRunning(false); setTime(0); };

  const handleInputChange = (e) => {
    const inputValue = parseInt(e.target.value);
    setTime(isNaN(inputValue) ? 0 : inputValue * 60);
  };

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const speakInstruction = async () => {
    const instructionText = selectedRecipe.instructions[currentStep];

    try {
      const response = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: instructionText }),
      });

      if (!response.ok) throw new Error("TTS request failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      newAudio.play();
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  return (
    <div className="step-container">
      <div className="header">
        <h1>{selectedRecipe.name}</h1>
        <p>Step By Step Instructions</p>
        <button className="return-btn" onClick={handleReturn}>
          Return to Instructions
        </button>
      </div>

      <div className="content">
        <img src={selectedRecipe.image} alt={selectedRecipe.name} className="recipe-img" />
        <p className="instruction-text">{selectedRecipe.instructions[currentStep]}</p>
        <button onClick={speakInstruction} className="tts-btn">
          🔈 Speak Instructions
        </button>
      </div>

      <div className="controls">
        <button onClick={handlePrevious} disabled={currentStep === 0} className="nav-btn">Previous Step</button>
        <button onClick={handleNext} disabled={currentStep === selectedRecipe.instructions.length - 1} className="nav-btn">Next Step</button>
      </div>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className="timer-container">
        <h2>Timer</h2>
        <div className="timer-controls">
          <input type="number" placeholder="Enter time in minutes" onChange={handleInputChange} disabled={isRunning} />
          <div className="timer-display">{formatTime()}</div>
          <div className="timer-buttons">
            <button onClick={handleStartTimer} disabled={isRunning || time === 0}>Start</button>
            <button onClick={handlePauseTimer} disabled={!isRunning}>Pause</button>
            <button onClick={handleResetTimer}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedStepByStep;
