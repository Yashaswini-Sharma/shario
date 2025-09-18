import { useGame } from '@/lib/game-context'

export function GameTimer() {
  const { gamePhase, timeRemaining } = useGame()

  if (gamePhase !== 'styling' && gamePhase !== 'voting') return null

  return (
    <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
      <span>{gamePhase === 'styling' ? 'Time Left:' : 'Voting:'}</span>
      <span className="bg-primary text-white rounded px-2 py-1">
        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
      </span>
    </div>
  )
}
