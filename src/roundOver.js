export function getRoundOverContent(gameState) {
  if (!gameState.lastSetResults) {
    return <div>Ronda terminada</div>;
  }

  const results = gameState.lastSetResults;
  const humanPlayerID = 0;
  const botPlayerID = 1;

  return (
    <div id="roundOverContent">
      <h3>Resultado del set</h3>

      <div className="setResults">
        <div className="playerResults">
          <h4>Vos</h4>
          <div className="resultItem">
            <span>Cartas: {results.cardCounts[humanPlayerID] || 0}</span>
          </div>
          <div className="resultItem">
            <span>Oros: {results.oroCardCounts[humanPlayerID] || 0}</span>
          </div>
          <div className="resultItem">
            <span>7 de oro: {results.hasSieteDeOro[humanPlayerID] ? 'Sí' : 'No'}</span>
          </div>
          <div className="resultItem">
            <span>La setenta: {results.setentaScores[humanPlayerID] || 0}</span>
          </div>
          <div className="resultItem">
            <span>Escobas: {results.escobasThisSet[humanPlayerID] || 0}</span>
          </div>
          <div className="resultItem total">
            <strong>Puntos ganados: {results.pointsAwarded[humanPlayerID] || 0}</strong>
          </div>
        </div>

        <div className="playerResults">
          <h4>Bot</h4>
          <div className="resultItem">
            <span>Cartas: {results.cardCounts[botPlayerID] || 0}</span>
          </div>
          <div className="resultItem">
            <span>Oros: {results.oroCardCounts[botPlayerID] || 0}</span>
          </div>
          <div className="resultItem">
            <span>7 de oro: {results.hasSieteDeOro[botPlayerID] ? 'Sí' : 'No'}</span>
          </div>
          <div className="resultItem">
            <span>La setenta: {results.setentaScores[botPlayerID] || 0}</span>
          </div>
          <div className="resultItem">
            <span>Escobas: {results.escobasThisSet[botPlayerID] || 0}</span>
          </div>
          <div className="resultItem total">
            <strong>Puntos ganados: {results.pointsAwarded[botPlayerID] || 0}</strong>
          </div>
        </div>
      </div>

      <div className="currentScores">
        <h4>Puntajes actuales</h4>
        <div className="scoreRow">
          <span>Vos: {gameState.scores[humanPlayerID] || 0} puntos</span>
          <span>Bot: {gameState.scores[botPlayerID] || 0} puntos</span>
        </div>
      </div>
    </div>
  );
}
