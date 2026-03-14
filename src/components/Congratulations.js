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
          <h1>Congratulations, You have Won!</h1>
        </div>
      ) : (
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '2.3rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              marginBottom: '0.5rem',
              color: '#b91c1c',
              textTransform: 'uppercase',
            }}
          >
            Better luck next time
          </h1>
          <p style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>😔</p>
          <p style={{ fontSize: '0.98rem', color: '#4b5563' }}>
            None of your bonds matched in this draw. Keep your bonds safe and try again on the next
            official result day.
          </p>
        </div>
      )}
    </div>
  );
};

export default Congratulations;