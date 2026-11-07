import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      aria-label="Добавить долг"
      size="icon-lg"
      className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-full shadow-xl"
    >
      <Plus />
    </Button>
  )
}
