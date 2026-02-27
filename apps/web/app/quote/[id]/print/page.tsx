type Quote = {
  id: string;
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  ai_summary?: string;
  leads?: { full_name?: string; email?: string };
};

type LineItem = {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

async function getQuote(id: string): Promise<{ quote: Quote | null; items: LineItem[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const [quoteRes, itemsRes] = await Promise.all([
    fetch(`${baseUrl}/api/quotes?leadId=${id}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/quotes/items?leadId=${id}`, { cache: 'no-store' }),
  ]);

  const quoteBody = await quoteRes.json().catch(() => ({}));
  const itemsBody = await itemsRes.json().catch(() => ({}));

  const quote = (quoteBody.data ?? [])[0] ?? null;
  const items = itemsBody.data ?? [];

  return { quote, items };
}

export default async function QuotePrintPage({ params }: { params: { id: string } }) {
  const { quote, items } = await getQuote(params.id);

  return (
    <main className="mx-auto max-w-3xl bg-white px-8 py-10 print:px-0 print:py-0">
      <h1 className="text-2xl font-semibold">Quote</h1>
      <p className="mt-1 text-sm text-slate-600">Lead: {quote?.leads?.full_name || params.id}</p>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-500">No line items found.</td>
            </tr>
          ) : (
            items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2">{i.item_name}</td>
                <td className="py-2 text-right">{i.quantity}</td>
                <td className="py-2 text-right">{quote?.currency} {Number(i.unit_price).toFixed(2)}</td>
                <td className="py-2 text-right">{quote?.currency} {Number(i.line_total).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-6 space-y-1 text-right text-sm">
        <p>Subtotal: {quote?.currency} {Number(quote?.subtotal || 0).toFixed(2)}</p>
        <p>Discount: {quote?.currency} {Number(quote?.discount_amount || 0).toFixed(2)}</p>
        <p>Tax: {quote?.currency} {Number(quote?.tax_amount || 0).toFixed(2)}</p>
        <p className="text-lg font-semibold">Total: {quote?.currency} {Number(quote?.total_amount || 0).toFixed(2)}</p>
      </div>

      <p className="mt-6 text-sm text-slate-600">{quote?.ai_summary || ''}</p>

      <div className="mt-8 print:hidden">
        <button onClick={() => window.print()} className="btn-primary">Print / Save PDF</button>
      </div>
    </main>
  );
}
