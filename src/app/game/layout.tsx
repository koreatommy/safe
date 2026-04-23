import { GameProvider } from './context/GameContext';
import './game-ui.css';

export const metadata = {
  title: '놀이시설 안전관리 퀴즈',
  description: '어린이놀이시설 안전관리 실무 능력을 테스트해보세요!',
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProvider>
      <div 
        data-game
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 font-sans"
      >
        {children}
      </div>
    </GameProvider>
  );
}
