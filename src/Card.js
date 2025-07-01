export default function Card({
  card,
  handleCardSelection,
  isCardSelected,
  isCardSelectable
}) {

  if (card.is_backwards) {
    return (
      <>
        <img className="card" id={`card-was-${card.number}-${card.suit}`} src={`${process.env.PUBLIC_URL}/img/reverso.png`} />
      </>
    );
  }
  if (card.number === null || card.suit === null) {
    return <div className="card" />;
  }
  if (card.is_hole) {
    return <div className="card" id={`card-was-${card.number}-${card.suit}`} />;
  }


  let className = 'card tableCard';
  if (isCardSelected) {
    className += ' selected';
  } else if (isCardSelectable) {
    className += ' selectable';
  }
  if (isCardSelectable) {
    className += ' highlighted';
  }

  return (
    <img
      className={className}
      src={`${process.env.PUBLIC_URL}/img/${card.number < 10 ? '0' + card.number : card.number}-${card.suit}s.png`}
      onClick={isCardSelectable || isCardSelected ? () => handleCardSelection(card) : undefined}
      style={{ cursor: isCardSelectable || isCardSelected ? 'pointer' : 'default' }}
    />
  );
}
