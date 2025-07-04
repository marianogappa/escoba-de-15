// import React from 'react';

// function Diagnostics({ gameState }) {
//     const lastAction = gameState.lastAction; // Assuming lastAction is available in gameState

//     return (
//         <div className="diagnostics-container">
//             <h4>Diagnostics</h4>
//             <div className="diagnostics-content">
//                 <p><strong>Turn:</strong> {gameState.turnPlayerID === 0 ? 'Human' : 'Bot'}</p>
//                 {lastAction && (
//                     <p>
//                         <strong>Last Action:</strong> {lastAction.name} by {lastAction.playerID === 0 ? 'Human' : 'Bot'}
//                     </p>
//                 )}
//                 <p><strong>Human Score:</strong> {gameState.scores[0]}</p>
//                 <p><strong>Bot Score:</strong> {gameState.scores[1]}</p>
//             </div>
//         </div>
//     );
// }

// export default Diagnostics;
