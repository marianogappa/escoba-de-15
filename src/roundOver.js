export function getRoundOverContent(gameState) {
  if (!gameState.lastSetResults) {
    return <div>Ronda terminada</div>;
  }

  const results = gameState.lastSetResults;
  const humanPlayerID = 0;
  const botPlayerID = 1;

  const humanHasCartas = results.cardCounts[humanPlayerID] > results.cardCounts[botPlayerID];
  const botHasCartas = results.cardCounts[botPlayerID] > results.cardCounts[humanPlayerID];
  const humanHasOros = results.oroCardCounts[humanPlayerID] > results.oroCardCounts[botPlayerID];
  const botHasOros = results.oroCardCounts[botPlayerID] > results.oroCardCounts[humanPlayerID];
  const humanHasSieteDeOro = results.hasSieteDeOro[humanPlayerID];
  const botHasSieteDeOro = results.hasSieteDeOro[botPlayerID];
  const humanHasSetenta = results.setentaScores[humanPlayerID] > results.setentaScores[botPlayerID];
  const botHasSetenta = results.setentaScores[botPlayerID] > results.setentaScores[humanPlayerID];
  const humanHasEscobas = results.escobasThisSet[humanPlayerID];
  const botHasEscobas = results.escobasThisSet[botPlayerID];

  return (
    <div id="roundOverContent">
      <h3>Resultado del mazo</h3>

      <div className="setResults">
        <div className="playerResults">
          <h4>Vos</h4>
          {humanHasCartas && <div className="resultItem">
            <span>Cartas ({results.cardCounts[humanPlayerID] || 0})</span>
          </div>}
          {humanHasOros && <div className="resultItem">
            <span>Oros ({results.oroCardCounts[humanPlayerID] || 0})</span>
          </div>}
          {humanHasSieteDeOro && <div className="resultItem">
            <span>7 de oro</span>
          </div>}
          {humanHasSetenta && <div className="resultItem">
            <span>La setenta</span>
          </div>}
          {humanHasEscobas && <div className="resultItem">
            <span>{results.escobasThisSet[humanPlayerID] || 0} escobas</span>
          </div>}
          <div className="resultItem total">
            <strong>{results.pointsAwarded[humanPlayerID] || 0} puntos</strong>
          </div>
        </div>

        <div className="playerResults playerResultsBot">
          <h4>Bot</h4>
          {botHasCartas && <div className="resultItem resultItemBot">
            <span>Cartas ({results.cardCounts[botPlayerID] || 0})</span>
          </div>}
          {botHasOros && <div className="resultItem resultItemBot">
            <span>Oros ({results.oroCardCounts[botPlayerID] || 0})</span>
          </div>}
          {botHasSieteDeOro && <div className="resultItem resultItemBot">
            <span>7 de oro</span>
          </div>}
          {botHasSetenta && <div className="resultItem resultItemBot">
            <span>La setenta</span>
          </div>}
          {botHasEscobas && <div className="resultItem resultItemBot">
            <span>{results.escobasThisSet[botPlayerID] || 0} escobas</span>
          </div>}
          <div className="resultItem total resultItemBot">
            <strong>{results.pointsAwarded[botPlayerID] || 0} puntos</strong>
          </div>
        </div>
      </div>

    </div>
  );
}
