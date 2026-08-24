import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RecStepByStep from "../pages/RecStepByStep";

jest.mock('../../assets/audio/alarm.wav', () => 'alarm-mock.wav');

import Alarm from "../assets/alarm.wav";

jest.mock('react-router-dom', () => {
    const original = jest.requireActual('react-router-dom');
    return {
        ...original,
        useParams: jest.fn(),
        useNavigate: jest.fn(),
    };
});

import { useParams, useNavigate } from 'react-router-dom';

jest.mock('../backend/public/recipes/Recommendations.json', () => ({
    recipes: [
      {
        "id": 1,
        "name": "Good Food",
        "description": "Good Food",
        "ingredients": [
        "Yum",
        "Great",
        "200 tons of soy sauce"
        ],
        "instructions": [
            "Step 1",
            "Step 2",
            "Step 3",
        ],
        "image": "dce.jpg"
      },
    ],
  }));

import recipes from '../backend/public/recipes/Recommendations.json';

describe("RecStepByStep Page", () => {
    let mockNavigate;
  
    beforeEach(() => {
      useParams.mockReturnValue({ id: "1" });
      mockNavigate = jest.fn();
      useNavigate.mockReturnValue(mockNavigate);
    });
  
    test("renders recipe and first step", () => {
      render(
        <MemoryRouter>
          <RecStepByStep />
        </MemoryRouter>
      );
  
      expect(screen.getByText("Good Food")).toBeInTheDocument();
      expect(screen.getByText("Step 1")).toBeInTheDocument();
    });
  
    test("navigates between steps", () => {
      render(
        <MemoryRouter>
          <RecStepByStep />
        </MemoryRouter>
      );
  
      const nextButton = screen.getByText("Next Step");
      fireEvent.click(nextButton);
      expect(screen.getByText("Step 2")).toBeInTheDocument();
  
      const prevButton = screen.getByText("Previous Step");
      fireEvent.click(prevButton);
      expect(screen.getByText("Step 1")).toBeInTheDocument();
    });
  
    test("return button calls navigate", () => {
      render(
        <MemoryRouter>
          <RecStepByStep />
        </MemoryRouter>
      );
  
      const returnButton = screen.getByText("Return to Instructions");
      fireEvent.click(returnButton);
      expect(mockNavigate).toHaveBeenCalledWith("/rec-instructions/1");
    });
  
    test("timer works: start, pause, reset", () => {
        jest.useFakeTimers();
    
        render(
            <MemoryRouter>
            <RecStepByStep />
            </MemoryRouter>
        );
    
        const input = screen.getByPlaceholderText("Enter time in minutes");
        const startBtn = screen.getByText("Start");
        const pauseBtn = screen.getByText("Pause");
        const resetBtn = screen.getByText("Reset");
    
        fireEvent.change(input, { target: { value: "1" } });
        expect(screen.getByText("1:00")).toBeInTheDocument();
    
        fireEvent.click(startBtn);
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText("0:59")).toBeInTheDocument();
    
        fireEvent.click(pauseBtn);
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(screen.getByText("0:59")).toBeInTheDocument();
    
        fireEvent.click(resetBtn);
        expect(screen.getByText("0:00")).toBeInTheDocument();
  
        jest.useRealTimers();
    });
  });