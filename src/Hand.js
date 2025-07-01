import Card from './Card.js';

export default function Hand({
    cards,
    possibleActions,
    handleCardSelection,
    selectedCards,
    isCardSelected,
    isCardSelectable,
    isBot }) {
    cards = cards || [];
    return (
        <div className="hand">
            {[...Array(3)].map((_, i) => (
                i < cards.length ? (
                    isBot ? (
                        // Bot cards are shown face down
                        <Card key={i} card={{ is_backwards: true }} />
                    ) : (
                        // Human cards are shown face up with selection logic
                        <Card
                            key={i}
                            card={cards[i]}
                            handleCardSelection={(card) => handleCardSelection({ card })}
                            isCardSelected={isCardSelected({ card: cards[i], selectedCards })}
                            isCardSelectable={isCardSelectable({ card: cards[i], selectedCards, playerCards: cards, possibleActions })}
                        />
                    )
                ) : (
                    <Card key={i} card={{ number: null, suit: null }} />
                )
            ))}
        </div>
    )
}
