/*
    card: { number: number, suit: string }
    selectedCards: { number: number, suit: string }[]
    playerCards: { number: number, suit: string }[]
    possibleActions: { name: string, card: { number: number, suit: string }, capturedTableCards: { number: number, suit: string }[] }[]
*/
function isCardSelectable({ card, selectedCards, playerCards, possibleActions }) {
    const cardKey = cardToKey(card);
    const selectedCardsKeys = cardsToKeys(selectedCards);
    const playerCardsKeys = cardsToKeys(playerCards);
    const possibleActionsKeys = possibleActions.map(action => [{ number: action.card.number, suit: action.card.suit }, ...action.capturedTableCards]).map(cards => cardsToKeys(cards));

    // If card is in playerCards and any selectedCard is in playerCards, then the card is not selectable
    if (playerCardsKeys.includes(cardKey) && selectedCardsKeys.some(selectedCardKey => playerCardsKeys.includes(selectedCardKey))) {
        return false;
    }

    // Calculate possible actions including all selected cards (upon selecting cards, less actions remain possible)
    const possibleActionsIncludingAllSelectedCards = possibleActionsKeys.filter(cardKeys => {
        return selectedCardsKeys.every(selectedCardKey => cardKeys.includes(selectedCardKey));
    });

    // From previously possible actions, filter out the ones that don't include the card
    const possibleActionsIncludingCard = possibleActionsIncludingAllSelectedCards.filter(cardKeys => {
        return cardKeys.includes(cardKey);
    });

    return possibleActionsIncludingCard.length > 0;
}

function isCardSelected({ card, selectedCards }) {
    const cardKey = cardToKey(card);
    const selectedCardsKeys = cardsToKeys(selectedCards);

    return selectedCardsKeys.includes(cardKey);
}

function findMatchingAction({ selectedCards, playerCards, possibleActions }) {
    const selectedCardsKeys = cardsToKeys(selectedCards);
    const playerCardsKeys = cardsToKeys(playerCards);

    // If intersection of selectedCardsKeys and playerCardsKeys has length != 1, then there's a bug! No matching action!
    if (selectedCardsKeys.filter(key => playerCardsKeys.includes(key)).length !== 1) {
        return null;
    }

    // Find the first actions on which the intersection of selectedCardsKeys and possibleActionKeys matches the length of both:
    const matchingAction = possibleActions.find(possibleAction => {
        const possibleActionKeys = [possibleAction.card, ...possibleAction.capturedTableCards].map(card => cardToKey(card));
        return possibleActionKeys.filter(key => selectedCardsKeys.includes(key)).length === possibleActionKeys.length;
    });

    return matchingAction;
}

function cardToKey(card) {
    return `${card.number}-${card.suit}`;
}

function cardsToKeys(cards) {
    return cards.map(card => cardToKey(card));
}

export { isCardSelectable, isCardSelected, findMatchingAction };
