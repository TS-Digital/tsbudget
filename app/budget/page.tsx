import Nav from '@/components/Nav'
import BudgetAllocator from '@/components/BudgetAllocator'

export default function BudgetPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
            Budget Planner
          </h1>
          <p className="text-[#7a8599]">
            Allocate every pound of your take-home pay. Choose your budgeting method and customise
            each category.
          </p>
        </div>

        <BudgetAllocator />

        <footer className="mt-12 text-center text-xs text-[#7a8599]">
          TSBudget provides estimates for guidance only. Consult a qualified accountant for
          regulated financial advice.
        </footer>
      </main>
    </>
  )
}
