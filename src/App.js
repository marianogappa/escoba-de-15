import { useState, useEffect } from 'react';
import { createRoot } from "react-dom/client";
import React, { StrictMode } from "react";
import { GameStateManager } from './gameState';
import PlayerSection from './PlayerSection';
import Hand from './Hand';
import { playAudio, stopAudio, setMasterSwitchAudioOn } from './audio';
import { getRoundOverContent } from './roundOver';
import { isCardSelectable, isCardSelected, findMatchingAction } from './cardSelectionLogic';
// import Diagnostics from './Diagnostics';
import './styles_diagnostics.css';

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

      // Check if the new selection matches any available action
      const matchingAction = findMatchingAction({ selectedCards: newSelection, playerCards, possibleActions });

      if (matchingAction) {
        // Auto-execute the action
        setTimeout(() => {
          setSelectedCards([]); // Clear selections
          // playAudio('reveal_card', { volume: 80 }); // Action execution sound
          handleAction(matchingAction);
        }, 300); // Small delay for better UX
      } else {
        playAudio('select', { volume: 70 }); // Selection sound
      }
    }
  }


  function removeModalAndHandleAction() {
    const modalOverlay = document.getElementById('roundOverModalOverlay');
    modalOverlay.classList.remove('show');
    modalOverlay.classList.add('hidden');
    stopAudio();
    setTimeout(() => {
      handleAction({ forceBotAction: true }); // trigger a bot action
    }, 1000);
  }

  function removeModalAndLeaveGame(action) {
    const modalOverlay = document.getElementById('gameOverModalOverlay');
    modalOverlay.classList.remove('show');
    modalOverlay.classList.add('hidden');
    window.location.href = window.location.href;
  }

  const gameState = manager.gameState;
  const isHumanTurn = gameState.turnPlayerID === 0;
  const isBotTurn = gameState.turnPlayerID === 1;

  useEffect(() => {
    if (gameState.setJustStarted && gameState.scores[0] + gameState.scores[1] > 0) {
      // Show round over modal when points change
      const modalOverlay = document.getElementById('roundOverModalOverlay');
      modalOverlay.classList.remove('hidden');
      modalOverlay.classList.add('show');
    }
  }, [gameState.setJustStarted]);

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

  let winnerImgSrc = `${process.env.PUBLIC_URL}/img/human.png`

  useEffect(() => {
    const botSrc = `${process.env.PUBLIC_URL}/img/bot.png`;

    if (gameState.isEnded) {
      if (gameState.lastSetResults.pointsAwarded[0] < gameState.lastSetResults.pointsAwarded[1]) {
        playAudio('lose', { waitMs: 500 });
      } else if (gameState.lastSetResults.pointsAwarded[0] > gameState.lastSetResults.pointsAwarded[1]) {
        playAudio('win', { waitMs: 500 });
      } else {
        playAudio('draw', { waitMs: 500 });
      }
      const modalOverlay = document.getElementById('gameOverModalOverlay');
      if (gameState.winnerPlayerID === 1) {
        const winnerImgElem = document.getElementById('winnerImg');
        winnerImgElem.src = botSrc;
      }

      modalOverlay.classList.remove('hidden');
      modalOverlay.classList.add('show');
    }
  }, [gameState.isEnded]);

  useEffect(() => {
    if (gameState.roundJustStarted && !gameState.isEnded) {
      playAudio('sfx', { waitMs: 500 });
    }
    if (gameState.turnPlayerID === 0 && gameState.lastCapturerPlayerID === 1) {
      const lastAction = gameState.actions[gameState.actions.length - 1];
      const lastActionsCards = [lastAction.card, ...lastAction.capturedTableCards];
      if (lastActionsCards.length >= 2) {
        showCardRevealModal(lastActionsCards);
      }
    }
  }, [gameState]);

  function showCardRevealModal(cards) {
    playAudio('sfx', { volume: 80 });

    const modalOverlay = document.getElementById('cardRevealModalOverlay');
    const modal = document.getElementById('cardRevealModal');
    const cardsContainer = document.getElementById('revealedCardsContainer');

    // Clear previous cards
    cardsContainer.innerHTML = '';

    // Add cards to modal
    cards.forEach(card => {
      const cardImg = document.createElement('img');
      cardImg.className = 'revealedCard';
      cardImg.src = `${process.env.PUBLIC_URL}/img/${card.number < 10 ? '0' + card.number : card.number}-${card.suit}s.png`;
      cardsContainer.appendChild(cardImg);
    });

    // Show modal
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('show');

    // Auto-hide after 1.5 seconds
    setTimeout(() => {
      modal.classList.add('fadeOut');
      setTimeout(() => {
        modalOverlay.classList.remove('show');
        modalOverlay.classList.add('hidden');
        modal.classList.remove('fadeOut');
      }, 300); // Wait for fade out animation
    }, 1500);
  }

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
              imgSrc={`${process.env.PUBLIC_URL}/img/human.png`}
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
          <button onClick={() => removeModalAndHandleAction()}>
            Continuar
          </button>
        </div>
      </div>
      <div id="gameOverModalOverlay" className="hidden">
        <div id="modal">
          <div id="gameOverText">
            <span>🏆</span>
            <img id="winnerImg" className="playerImg" src={winnerImgSrc} />
            <span>🏆</span>
          </div>
          <button onClick={() => removeModalAndLeaveGame()}>
            Jugar de nuevo
          </button>
        </div>
      </div>
      <div id="cardRevealModalOverlay" className="hidden">
        <div id="cardRevealModal">
          <h3>Bot se lleva</h3>
          <div id="revealedCardsContainer" className="revealedCardsContainer">
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
            <a id="startGameButton" onClick={() => startGame({})}>
              <div className="vsContainer">
                <img className="startGameHuman" src={`${process.env.PUBLIC_URL}/img/human.png`} />
                <span className="startGameVs">VS</span>
                <img className="startGameBot" src={botSrc} />
              </div>
            </a>
            <span id="info_link" onClick={showInfoModal}>info</span>
          </div>
          <div className="sideColumn"></div>
        </div>
      </div>
      <div id="infoModal" className="hidden">
        <div id="infoText">
          <p>Este juego está creado sin fines de lucro, para disfrutar y difundir el juego tradicional argentino de cartas españolas Escoba de 15.</p>

          <p>El motor es open source, con licencia MIT, y acepto issues & PRs. Soporta multijugador (humano vs humano).
            Está construído para ser fácilmente extensible: se pueden crear distintas UIs, se pueden agregar nuevos bots, etc.
          </p>
          <hr />
          <p>This game was created without profit in mind, to enjoy and spread the traditional argentine spanish-card game Escoba de 15.</p>

          <p>The engine is open source, MIT licensed, and I accept issues & PRs. It supports multiplayer (human vs human).
            It's built to be easily extensible: different UIs can be created, new bots can be added, etc.
          </p>

          <p><a href="https://github.com/marianogappa/escoba" target="_blank">Game engine & UI</a></p>
          {/* <ActionButton action={continueAction} handleAction={hideInfoModal} /> */}
        </div>
      </div>

      <div id="game"></div>
    </>
  )
}
