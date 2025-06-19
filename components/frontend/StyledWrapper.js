"use client";
import { styled } from "styled-components";

const StyledWrapper = styled.div`
    .card {
        font-family: Montserrat, sans-serif;
        width: 400px;
        height: 300px;
        translate: -6px -6px;
        background: #ff66a3;
        border: 3px solid #000000;
        box-shadow: 12px 12px 0 #000000;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .card:hover {
        translate: 6px;
    }

    .button {
        position: relative;
        width: 80%;
        height: 50px;
        border: 3px solid #000000;
        box-shadow: 3px 3px 0 #000000;
        font-weight: 750;
        font-size: 16px;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.3s ease;
        background-color: transparent;
    }

    .button span {
        position: relative;
        z-index: 2;
        transition: transform 0.4s ease, opacity 0.4s ease;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        opacity: 1;
    }

    .button:hover span {
        transform: translateY(-100%);
        opacity: 0;
    }

    .button::after {
        content: attr(data-hover);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, 50%);
        z-index: 2;
        font-weight: 750;
        color: black;
        pointer-events: none;
        transition: transform 0.4s ease, opacity 0.4s ease;
        opacity: 0;
    }

    .button:hover::after {
        transform: translate(-50%, -50%);
        opacity: 1;
    }

    .button::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%; /* Start offscreen to the left */
        width: 0; /* Start with zero width */
        height: 6px; /* Slim line */
        background: white;
        transform: rotate(45deg); /* Diagonal angle */
        transform-origin: top left;
        transition: width 0.5s ease, left 0.5s ease, opacity 0.5s ease;
        z-index: 1;
        opacity: 1;
    }

    .button:hover::before {
        width: 200%; /* Extend width to cross the button */
        left: 100%; /* Move to the right */
        opacity: 1;
        visiblity: visible;
    }

    .button:not(:hover)::before {
        width: 0;
        left: -300%;
        top: -200%;
        opacity: 0;
        visibility: hidden;
    }

    .button:hover {
        transform: translateY(2px);
        box-shadow: 1.5px 1.5px 0 #000000;
    }

    .button_login {
        background: #4ade80;
    }

    .button_signup {
        background: #ffd166;
    }

    .button_guest {
        background: #c084fc;
    }

    .button_login:hover {
        background: #22c55e;
    }

    .button_signup:hover {
        background: #fcbf49;
    }

    .button_guest:hover {
        background: #7c3aed;
    }
`;

export default StyledWrapper;
