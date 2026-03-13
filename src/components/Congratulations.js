import React from 'react';
import Confetti from 'react-confetti';

const Congratulations = ({ isWin, bondNumber, prize, onReset }) => {
  const confettiStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    pointerEvents: 'none',
  };

  return (
    <div>
      {isWin && (
        <Confetti
          run={true}
          recycle={true}
          numberOfPieces={500}
          style={confettiStyle}
        />
      )}
      {isWin ? (
        <div>
          <h1>Congratulations, You have Won</h1>
          <p>Bond Number: {bondNumber}</p>
          <p>Prize: {prize}</p>
          <button onClick={onReset} style={{ padding: '10px 20px', marginTop: '20px' }}>Try Again</button>
        </div>
      ) : (
        <div>
          <h1>Better luck next time</h1>
          <p>😭</p>
          <button onClick={onReset} style={{ padding: '10px 20px', marginTop: '20px' }}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default Congratulations;