import { useState, useEffect } from 'react';
import { Users, Building2, Copy, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.log("Stats loading failed:", error.message);
      setStats(null); // keep safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      label: 'Total Customers',
      value: stats?.totalCustomers,
      icon: Users,
      color: 'yellow',
      iconBg: 'rgba(232,197,71,0.12)',
      iconColor: 'var(--accent)'
    },
    {
      label: 'Properties',
      value: stats?.totalProperties,
      icon: Building2,
      color: 'green',
      iconBg: 'rgba(62,207,142,0.12)',
      iconColor: 'var(--success)'
    },
    {
      label: 'Duplicates Found',
      value: stats?.totalDuplicates,
      icon: Copy,
      color: 'red',
      iconBg: 'rgba(255,77,77,0.12)',
      iconColor: 'var(--danger)'
    },
    {
      label: 'Files Processed',
      value: stats?.processedFiles,
      icon: FileCheck,
      color: 'blue',
      iconBg: 'rgba(92,124,250,0.12)',
      iconColor: 'var(--info)'
    }
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your BI</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/upload')}
        >
          + Upload Files
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((s) => (
          <div className={`stat-card ${s.color}`} key={s.label}>
            <div
              className="stat-icon"
              style={{ background: s.iconBg }}
            >
              <s.icon size={20} style={{ color: s.iconColor }} />
            </div>

            <div className="stat-value">
              {loading ? (
                <span style={{ opacity: 0.4 }}>—</span>
              ) : typeof s.value === 'number' ? (
                s.value.toLocaleString()
              ) : (
                '—'
              )}
            </div>

            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}