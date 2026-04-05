import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import unbankedRates from '@/data/unbankedRates.json';
import acsIncome from '@/data/acsIncome.json';
import cfpbComplaints from '@/data/cfpbComplaints.json';

// ── Color helpers ─────────────────────────────────────────────────────────────
const BAR_COLORS = ['#f5e000','#e8c800','#d4b400','#c0a000','#ac8c00','#988000','#846c00','#705800','#5c4400','#483000'];

// ── Source credit ─────────────────────────────────────────────────────────────
function SourceCredit({ text }: { text: string }) {
  return <p className="text-[10px] text-gray-400 mt-2 italic">{text}</p>;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      <p className="text-gray-700">{payload[0].value.toLocaleString()} complaints</p>
    </div>
  );
}

export default function DataInsights() {
  // Sort income ascending, take bottom 10
  const lowestIncome = [...acsIncome]
    .sort((a, b) => a.median_household_income - b.median_household_income)
    .slice(0, 10);

  const az = unbankedRates.find(r => r.state === 'Arizona')!;
  const nat = unbankedRates.find(r => r.state === 'National Average')!;

  return (
    <div className="space-y-8">

      {/* Why This Matters */}
      <div className="rounded-2xl p-6 border-l-4 border-yellow-400 bg-gray-900 text-white">
        <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-2">Why This Matters</p>
        <p className="text-lg font-heading font-bold leading-snug">
          Redreemer was built for the people in these zip codes.
        </p>
        <p className="text-gray-300 text-sm mt-2">Real data. Real gaps. Real help.</p>
      </div>

      {/* Complaint Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">
          Most Complained-About Financial Products in Arizona
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          These are the products that hurt Arizona residents most — many target low-income communities.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={cfpbComplaints} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="product"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {cfpbComplaints.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <SourceCredit text="Source: CFPB Consumer Complaint Database (Arizona, 2023)" />
      </div>

      {/* Banking Access */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">Banking Access in Arizona</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-semibold text-gray-700">Unbanked</span> means no checking or savings account at all.{' '}
          <span className="font-semibold text-gray-700">Underbanked</span> means having an account but still relying on check cashers, payday loans, or money orders.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Arizona', data: az, color: '#f5e000' },
            { label: 'National Average', data: nat, color: '#d1d5db' },
          ].map(({ label, data, color }) => (
            <div key={label} className="rounded-xl border border-gray-100 p-5 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">{label}</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">Unbanked</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">{data.unbanked_pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${data.unbanked_pct * 5}%`, backgroundColor: color }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">Underbanked</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">{data.underbanked_pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${data.underbanked_pct * 3}%`, backgroundColor: color }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
          <p className="text-xs text-gray-700">
            <span className="font-semibold">In Arizona:</span> Nearly 1 in 5 residents is unbanked or underbanked — that's over 1.4 million people who pay more for basic financial services than those with bank accounts.
          </p>
        </div>
        <SourceCredit text="Source: FDIC How America Banks Survey 2023" />
      </div>

      {/* Income by Zip Code */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">
          Lowest-Income Zip Codes in Arizona
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          These are the communities Redreemer serves. Rows highlighted in yellow are below $35,000 median household income.
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zip Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Area</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Median Income</th>
              </tr>
            </thead>
            <tbody>
              {lowestIncome.map((row, i) => {
                const isLow = row.median_household_income < 35000;
                return (
                  <tr key={row.zipcode}
                    className={`border-b border-gray-50 last:border-0 transition-colors ${isLow ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50'}`}>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{row.zipcode}</td>
                    <td className="px-4 py-3 text-gray-700">{row.name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-bold ${isLow ? 'text-yellow-700' : 'text-gray-900'}`}>
                        ${row.median_household_income.toLocaleString()}
                      </span>
                      {isLow && (
                        <span className="ml-2 text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full font-semibold">LOW</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SourceCredit text="Source: U.S. Census Bureau American Community Survey 5-Year Estimates 2022" />
      </div>

    </div>
  );
}
