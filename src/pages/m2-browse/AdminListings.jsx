import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate, simulateRequest } from '../../data/mockHelpers.js';
import { ADMIN_LINKS, SideLayout } from '../../components/Layout.jsx';
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, SelectField, TextField } from '../../components/ui.jsx';

export default function AdminListings() {
  const { listings, getUser, getCategory } = useApp();
  const [params] = useSearchParams();
  const [state, setState] = useState('loading');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(() => {
    setState('loading');
    const fail = params.get('simulateError') === '1' && attempt === 0;
    simulateRequest(true, { fail })
      .then(() => setState('ready'))
      .catch(() => setState('error'));
  }, [params, attempt]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...listings]
      .filter((l) => !s || l.name.toLowerCase().includes(s) || getUser(l.ownerId)?.name.toLowerCase().includes(s))
      .filter((l) => !type || l.type === type)
      .filter((l) => !status || l.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [listings, q, type, status, getUser]);

  return (
    <SideLayout links={ADMIN_LINKS}>
      <PageHeader title="All Listings" subtitle="Review listings and remove inappropriate ones." />
      {state === 'loading' && <LoadingState label="Loading listings…" />}
      {state === 'error' && <ErrorState onRetry={() => setAttempt((a) => a + 1)} />}
      {state === 'ready' && (
        <>
          <div className="toolbar">
            <TextField className="search" label="Search" type="search" placeholder="Item or seller name…" value={q} onChange={(e) => setQ(e.target.value)} />
            <SelectField
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="All types"
              options={[
                { value: 'sale', label: 'For Sale' },
                { value: 'donation', label: 'For Donation' },
              ]}
            />
            <SelectField
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="All statuses"
              options={[
                { value: 'available', label: 'Available' },
                { value: 'unavailable', label: 'Out of stock' },
                { value: 'removed', label: 'Removed' },
              ]}
            />
          </div>
          {rows.length === 0 ? (
            <EmptyState title="No listings found" message={listings.length ? 'Try another search or filter.' : 'No listings have been created yet.'} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Seller</th>
                    <th>Type</th>
                    <th>Posted</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.name}</strong>
                        <div className="small muted">{getCategory(l.categoryId)?.name || 'Uncategorized'}</div>
                      </td>
                      <td>{getUser(l.ownerId)?.name}</td>
                      <td>
                        <Badge status={l.type} />
                      </td>
                      <td>{formatDate(l.createdAt)}</td>
                      <td>
                        <Badge status={l.status} />
                      </td>
                      <td>
                        <Link to={`/admin/listings/${l.id}`} className="btn btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </SideLayout>
  );
}