import { calculateTax } from '@/lib/taxEngine'
import type { TaxInput } from '@/types/finance'

export async function POST(request: Request) {
  const body: TaxInput = await request.json()
  const result = calculateTax(body)
  return Response.json(result)
}
