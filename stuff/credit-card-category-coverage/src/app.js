'use strict';

// npx babel --watch stuff/credit-card-category-coverage/src --out-dir stuff/credit-card-category-coverage/build

/* TODO
points being worth more than a cent
style the page
subcategories (ex: Amazon is a part of online shopping)
show/hide categories
special cases
 - custom cash card
 - rotating categories
 - wells fargo rewards tiers
add custom card
spending caps
*/

// CARDS is defined in cards.js

const { useState, useRef, useEffect } = React;

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const CATEGORIES = [
  { id: 'grocery', name: 'Groceries'},
  { id: 'dining', name: 'Dining '},
  { id: 'diningTakeout', name: 'Dining (Takeout)'},
  { id: 'drugstore', name: 'Drug Stores'},
  { id: 'gas', name: 'Gas'},
  { id: 'transit', name: 'Transit'},
  { id: 'entertainment', name: 'Entertainment'},
  { id: 'hotels', name: 'Hotels'},
  { id: 'streaming', name: 'Streaming'},
  { id: 'homeImprovement', name: 'Home Improvement Stores'},
  { id: 'fitness', name: 'Fitness Clubs'},
  { id: 'travelChasePortal', name: 'Travel via Chase Portal'},
  { id: 'verizon', name: 'Verizon '},
  { id: 'amazon', name: 'Amazon '},
];

const getBestReward = (cat, selectedCards, customSelections) => {
  let best = 0;
  let bestCard = {};
  CARDS.filter(c => selectedCards.has(c.id)).forEach(card => {
    if (card.custom && card.id in customSelections && customSelections[card.id] !== cat.id) {
      return;
    }

    if (cat.id in card.rewards) {
      if (card.rewards[cat.id] > best) {
        best = card.rewards[cat.id];
        bestCard = card;
      } else if (card.rewards[cat.id] === best) {
        bestCard = { name: 'Multiple cards'}
      }
    }
    if (card.rewards.other > best) {
      best = card.rewards.other;
      bestCard = card;
    } else if (card.rewards.other === best) {
      bestCard = { name: 'Multiple cards'}
    }
  })
  let tier = 'bad';
  if (best >= .01) {
    tier = 'meh';
  }
  if (best >= .02) {
    tier = 'ok';
  }
  if (best >= .03) {
    tier = 'good';
  }
  if (best >= .04) {
    tier = 'great';
  }
  if (best >= .05) {
    tier = 'best';
  }
  return (<>
    <span className={`percent tier-${tier}`}>{`${best * 100}%`}</span>{`${bestCard.name ? ` via ${bestCard.name}` : '' }`}
  </>);
}

const Card = ({ card, selectedCards, selectCard, unSelectCard, customSelections, setCustomSelections }) => {
  const validCats = CATEGORIES.filter(c => c.id in card.rewards);
  const initial = validCats.length ? validCats[0].id : '';
  const [customCat, setCustomCat] = useState(initial);

  useEffect(() => {
    if (card.custom && selectedCards.has(card.id)) {
       setCustomSelections({
         ...customSelections,
         [card.id]: customCat
       });
    }
  }, [customCat, selectedCards])

  return (
    <div>
      <input
        name={`${card.id}-checkbox`}
        type="checkbox"
        onChange={e => {
          if (e.target.checked) {
            selectCard(card.id);
          } else {
            unSelectCard(card.id);
          }
        }}
      />
      <label className="label" htmlFor={`${card.id}-checkbox`}>{card.name}</label>
      {card.custom &&
        <select
          className="label"
          name="cars"
          id="cars"
          onChange={e => {
            setCustomCat(e.target.value);
          }}
        >
          {validCats.map(cat =>
            <option key={`${cat.id}-${card.id}`} value={cat.id}>{cat.name}</option>
          )}
        </select>
      }
    </div>
  );
}


const Category = ({ cat, selectedCards, customSelections }) =>
  <div>
    <span className="cat-name">{cat.name}</span>
    {getBestReward(cat, selectedCards, customSelections)}
  </div>

const App = () => {
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [customSelections, setCustomSelections] = useState({});

  const selectCard = (cardId) => {
    selectedCards.add(cardId);
    setSelectedCards(new Set(selectedCards));
  }

  const unSelectCard = (cardId) => {
    selectedCards.delete(cardId);
    setSelectedCards(new Set(selectedCards));
  }

  return (
    <div>
      <div className="cards">
        <span>Cards:</span>
        {CARDS.map(card => (
          <Card
            selectedCards={selectedCards}
            selectCard={selectCard}
            customSelections={customSelections}
            setCustomSelections={setCustomSelections}
            unSelectCard={unSelectCard}
            key={card.id}
            card={card}
          />))}
      </div>
      <div className="categories">
        <span>Categories:</span>
        {CATEGORIES.map(cat => (<Category selectedCards={selectedCards} customSelections={customSelections} key={cat.id} cat={cat} />))}
      </div>
      <br/>
      <br/>
      <br/>
      <div className="instructions">
        <h3>Welcome to the Credit Card Category Coverage Chart (Alpha)</h3>
        <p>This allows you to find category gaps in your credit card setup. Just select which cards you have/want and see your rewards per category.
        More functionality coming soon. Feel free to contribute changes to the <a traget="_blank" href="https://github.com/keithkade/keithkade.github.io/tree/master/stuff/credit-card-category-coverage">code repo</a></p>
      </div>
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
