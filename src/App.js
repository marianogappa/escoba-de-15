import { useState, useEffect } from 'react';
import { createRoot } from "react-dom/client";
import React, { StrictMode } from "react";
import { GameStateManager } from './gameState';
import PlayerSection from './PlayerSection';
import Hand from './Hand';
import { playAudio, stopAudio, setMasterSwitchAudioOn } from './audio';
import { getRoundOverContent } from './roundOver';
import { isCardSelectable, isCardSelected, findMatchingAction } from './cardSelectionLogic';

function Game({ manager }) {
  const [trigger, setTrigger] = useState(0);
  const [hoveredCardAction, setHoveredCardAction] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);

  const botSrc = `${process.env.PUBLIC_URL}/img/bot.png`;

  function handleAction(action) {
    setTrigger(manager.runAction(action, setTrigger))
  }

  function handleCardSelection({ card }) {
    const isSelected = isCardSelected({ card, selectedCards });
    const playerCards = gameState.hands[0].cards;
    const possibleActions = gameState.possibleActions.filter(action => action.name === 'throw_card');

    if (isSelected) {
      // Deselect the card
      setSelectedCards(prev => prev.filter(c => c !== card));
      playAudio('deselect', { volume: 50 }); // Deselection sound
    } else {
      // Select the card
      const newSelection = [...selectedCards, card];
      setSelectedCards(newSelection);
      playAudio('select', { volume: 70 }); // Selection sound

      // Check if the new selection matches any available action
      const matchingAction = findMatchingAction({ selectedCards: newSelection, playerCards, possibleActions });

      if (matchingAction) {
        // Auto-execute the action
        setTimeout(() => {
          setSelectedCards([]); // Clear selections
          playAudio('reveal_card', { volume: 80 }); // Action execution sound
          handleAction(matchingAction);
        }, 300); // Small delay for better UX
      }
    }
  }


  function removeModalAndHandleAction(action) {
    const modalOverlay = document.getElementById('roundOverModalOverlay');
    modalOverlay.classList.remove('show');
    stopAudio();
    handleAction(action);
  }

  function removeModalAndLeaveGame(action) {
    const modalOverlay = document.getElementById('gameOverModalOverlay');
    modalOverlay.classList.remove('show');
    window.location.href = window.location.href;
  }

  const gameState = manager.gameState;
  const isHumanTurn = gameState.turnPlayerID === 0;
  const isBotTurn = gameState.turnPlayerID === 1;

  // Clear selected cards when it's not the human's turn or when game state changes significantly
  useEffect(() => {
    if (!isHumanTurn) {
      setSelectedCards([]);
    }
  }, [isHumanTurn]);

  // Clear selections when the round ends or game ends
  useEffect(() => {
    if (gameState.isEnded) {
      setSelectedCards([]);
    }
  }, [gameState.isEnded]);

  // Clear selections when the table cards change (after an action)
  useEffect(() => {
    setSelectedCards([]);
  }, [gameState.tableCards?.length]);

  let winnerImgSrc = `${process.env.PUBLIC_URL}/img/human.jpeg`

  useEffect(() => {
    const botSrc = `${process.env.PUBLIC_URL}/img/bot.png`;

    if (gameState.isEnded) {
      playAudio('finish', { waitMs: 500 });
      const modalOverlay = document.getElementById('gameOverModalOverlay');
      if (gameState.winnerPlayerID === 1) {
        const winnerImgElem = document.getElementById('winnerImg');
        winnerImgElem.src = botSrc;
      }

      modalOverlay.classList.add('show');
    }
  }, [gameState.isEnded]);

  useEffect(() => {
    if (gameState.possibleActions.length === 1 && gameState.possibleActions[0].name === "confirm_round_finished" && !gameState.isEnded) {
      // This is because the bot has to confirm the round finished too
      manager.runBotAction();
      manager.runBotAction();

      playAudio('end', { waitMs: 500 });
      const modalOverlay = document.getElementById('roundOverModalOverlay');
      modalOverlay.classList.add('show');
    }
  }, [gameState]);

  // Helper function to render table cards
  function renderTableCards() {
    const tableCards = gameState.tableCards || [];
    const playerCards = gameState.hands[0].cards || [];
    const possibleActions = gameState.possibleActions.filter(action => action.name === 'throw_card');
    return (
      <div className="tableCards">
        <div className="tableCardsContainer">
          {tableCards.map((card, index) => {
            const selected = isCardSelected({ card, selectedCards });
            const selectable = isCardSelectable({ card, selectedCards, playerCards, possibleActions });
            const highlighted = isCardSelectable({ card, selectedCards, playerCards, possibleActions });

            let className = 'card tableCard';
            if (selected) {
              className += ' selected';
            } else if (selectable) {
              className += ' selectable';
            }
            if (highlighted) {
              className += ' highlighted';
            }

            return (
              <img
                key={index}
                className={className}
                src={`${process.env.PUBLIC_URL}/img/${card.number < 10 ? '0' + card.number : card.number}-${card.suit}s.png`}
                onClick={selectable || selected ? () => handleCardSelection({ card }) : undefined}
                style={{ cursor: selectable || selected ? 'pointer' : 'default' }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Helper function to render player pile info
  function renderPileInfo(playerID) {
    const pileCount = gameState.piles && gameState.piles[playerID] ? gameState.piles[playerID].length : 0;
    const escobas = gameState.escobas && gameState.escobas[playerID] ? gameState.escobas[playerID] : 0;
    return (
      <div className="pileInfo">
        <span className="pileCount">Cartas: {pileCount}</span>
        <span className="escobasCount">Escobas: {escobas}</span>
      </div>
    );
  }

  return (
    <>
      <div className="viewportContainer">
        <div className="sideColumn"></div>
        <div className="gameContainer">
          <div className="row">
            <PlayerSection
              name="Bot"
              points={gameState.scores ? gameState.scores[1] : 0}
              imgSrc={botSrc}
              isTheirTurn={isBotTurn}
            />
            {renderPileInfo(1)}
          </div>
          <div className="row">
            <div className="botHand column">
              <Hand cards={gameState.hands && gameState.hands[1] ? gameState.hands[1].cards : []} isBot={true} />
            </div>
          </div>

          {renderTableCards()}

          <div className="row">
            <div className="yourHand column">
              <Hand
                cards={gameState.hands && gameState.hands[0] ? gameState.hands[0].cards : []}
                possibleActions={gameState.possibleActions}
                selectedCards={selectedCards}
                handleCardSelection={handleCardSelection}
                isCardSelected={isCardSelected}
                isCardSelectable={isCardSelectable}
                isBot={false}
              />
            </div>
          </div>
          <div className="row actionButtonsRow">
            <PlayerSection
              className="humanPlayerSection"
              name="Vos"
              points={gameState.scores ? gameState.scores[0] : 0}
              imgSrc={`${process.env.PUBLIC_URL}/img/human.jpeg`}
              isTheirTurn={isHumanTurn}
            />
            {renderPileInfo(0)}
          </div>
        </div>
        <div className="sideColumn"></div>
      </div>
      <div id="roundOverModalOverlay" className="hidden">
        <div id="roundOverModal">
          {getRoundOverContent(gameState)}
        </div>
      </div>
      <div id="gameOverModalOverlay" className="hidden">
        <div id="modal">
          <div id="gameOverText">
            <span>🏆</span>
            <img id="winnerImg" className="playerImg" src={winnerImgSrc} />
            <span>🏆</span>
          </div>
        </div>
      </div>
    </>
  );
}

function startGame() {
  stopAudio();
  document.getElementById("startGame").remove();
  const root = createRoot(document.getElementById("game"));
  const manager = new GameStateManager();
  manager.start();

  root.render(
    <StrictMode>
      <Game manager={manager} />
    </StrictMode>
  );
}

export default function GameLandingPage() {
  function showInfoModal() {
    const modalOverlay = document.getElementById('infoModal');
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('show');
  }

  function hideInfoModal() {
    const modalOverlay = document.getElementById('infoModal');
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('show');
  }

  const botSrc = `${process.env.PUBLIC_URL}/img/bot.png`;
  return (
    <>
      <div id="startGame">
        <div className="landingContainer">
          <div className="sideColumn"></div>
          <div className="landingContent">
            <h1>ESCOBA DE 15</h1>
            <div className="vsContainer">
              <img className="startGameHuman" src={`${process.env.PUBLIC_URL}/img/human.jpeg`} />
              <span className="startGameVs">VS</span>
              <img className="startGameBot" src={botSrc} />
            </div>
            <a id="startGameButton" onClick={() => startGame({})}>▶️</a>
            <span id="info_link" onClick={showInfoModal}>info</span>
          </div>
          <div className="sideColumn"></div>
        </div>
      </div>
      <div id="infoModal" className="hidden">
        <div id="infoText">
          <p>Este juego está basado en la tradicional Escoba de 15 argentina,
            un juego de cartas españolas donde el objetivo es sumar 15 puntos capturando cartas de la mesa.
            El juego continúa hasta que un jugador alcance los puntos necesarios para ganar.</p>

          <p>El motor es open source, con licencia MIT, y acepto issues & PRs. Soporta multijugador (humano vs humano).
            Está construído para ser fácilmente extensible: se pueden crear distintas UIs, se pueden agregar nuevos bots, etc.
          </p>
          <hr />
          <p>This game is based on the traditional Argentine Escoba de 15,
            a Spanish card game where the objective is to score 15 points by capturing cards from the table.
            The game continues until a player reaches the required points to win.</p>

          <p>The engine is open source, MIT licensed, and I accept issues & PRs. It supports multiplayer (human vs human).
            It's built to be easily extensible: different UIs can be created, new bots can be added, etc.
          </p>

          <p><a href="https://github.com/marianogappa/escoba-argentina" target="_blank">Game engine & UI</a></p>
          {/* <ActionButton action={continueAction} handleAction={hideInfoModal} /> */}
        </div>
      </div>

      <div id="game"></div>
    </>
  )
}
