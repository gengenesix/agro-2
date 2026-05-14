import {
  ProfileIcon, ListProduceIcon, OrdersIcon, AdminIcon, ChevronRightIcon,
} from '@/components/shared/icons'
import { formatGHSCompact } from '@/lib/format'
import Link from 'next/link'

const MOCK_STATS = {
  totalGMV:       4_230_000,
  totalFarmers:   24_180,
  totalDealers:   1_240,
  totalBuyers:    3_890,
  activeListings: 18_540,
  activePledges:  892,
  bnplDisbursed:  1_120_000,
  pendingBNPL:    47,
  pendingVerify:  23,
}

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Platform Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">AgroConnect Ghana — Admin Overview</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total GMV',       value: formatGHSCompact(MOCK_STATS.totalGMV),  color: 'text-lime'            },
          { label: 'Active Farmers',  value: MOCK_STATS.totalFarmers.toLocaleString(), color: 'text-white'          },
          { label: 'Active Listings', value: MOCK_STATS.activeListings.toLocaleString(), color: 'text-white'        },
          { label: 'BNPL Disbursed',  value: formatGHSCompact(MOCK_STATS.bnplDisbursed), color: 'text-lime'         },
        ].map((k) => (
          <div key={k.label} className="bg-white/10 rounded-2xl p-5 border border-white/10">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2">{k.label}</p>
            <p className={`text-2xl font-extrabold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Action queues */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/admin/bnpl',  label: 'BNPL Queue',         count: MOCK_STATS.pendingBNPL,   urgent: true,  Icon: OrdersIcon    },
          { href: '/admin/users', label: 'Pending Verifications', count: MOCK_STATS.pendingVerify, urgent: true,  Icon: ProfileIcon   },
          { href: '/admin/listings',label: 'Active Pledges',   count: MOCK_STATS.activePledges, urgent: false, Icon: ListProduceIcon },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex items-center justify-between p-5 bg-white/10 border border-white/10
                       rounded-2xl hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-white/10 rounded-xl">
                <q.Icon size={20} className="text-white" />
              </span>
              <div>
                <p className="text-white text-sm font-semibold">{q.label}</p>
                <p className={`text-xl font-extrabold font-mono ${q.urgent ? 'text-lime' : 'text-white/70'}`}>
                  {q.count}
                </p>
              </div>
            </div>
            <ChevronRightIcon size={18} className="text-white/30" />
          </Link>
        ))}
      </div>

      {/* Platform breakdown */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Farmers',  value: MOCK_STATS.totalFarmers  },
          { label: 'Dealers',  value: MOCK_STATS.totalDealers  },
          { label: 'Buyers',   value: MOCK_STATS.totalBuyers   },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-white font-extrabold font-mono text-2xl">{s.value.toLocaleString()}</p>
            <p className="text-white/50 text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
