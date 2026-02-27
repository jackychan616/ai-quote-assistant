import Link from 'next/link';

type QuoteItem = { id: string; item_name: string; quantity: number; unit_price: number; line_total: number };
type QuotePayload = {
  quote: {
    id: string;
    currency: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    ai_summary?: string;
    leads?: { full_name?: string; email?: string };
  };
  items: QuoteItem[];
};

async function getQuote(id: string): Promise<QuotePayload | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/quotes/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data ?? null;
}

export default async function QuoteViewPage({ params }: { params: { id: string } }) {
  const payload = await getQuote(params.id);

  if (!payload) {
    return <main className="mx-auto max-w-3xl px-6 py-10">Quote not found.</main>;
  }

  const { quote, items } = payload;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Quote Proposal</h1>
        <p className="mt-1 text-sm text-slate-600">For: {quote.leads?.full_name || 'Client'}</p>

        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2">{i.item_name}</td>
                <td className="py-2 text-right">{i.quantity}</td>
                <td className="py-2 text-right">{quote.currency} {Number(i.unit_price).toFixed(2)}</td>
                <td className="py-2 text-right">{quote.currency} {Number(i.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 space-y-1 text-right text-sm">
          <p>Subtotal: {quote.currency} {Number(quote.subtotal).toFixed(2)}</p>
          <p>Discount: {quote.currency} {Number(quote.discount_amount).toFixed(2)}</p>
          <p>Tax: {quote.currency} {Number(quote.tax_amount).toFixed(2)}</p>
          <p className="text-lg font-semibold">Total: {quote.currency} {Number(quote.total_amount).toFixed(2)}</p>
        </div>

        {quote.ai_summary ? <p className="mt-5 text-sm text-slate-700">{quote.ai_summary}</p> : null}

        <div className="mt-6">
          <Link href="/" className="btn-secondary">Back</Link>
        </div>
      </div>
    </main>
  );
}
