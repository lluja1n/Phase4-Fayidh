import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate } from '../../data/mockHelpers.js';
import { ADMIN_LINKS, SideLayout } from '../../components/Layout.jsx';
import { Badge, EmptyState, PageHeader, SelectField, TextField } from '../../components/ui.jsx';

//M5 - User Management (FR 3.4.1)

export function accountTypeLabel(user) {
  if (user.role === 'student') return 'University Student';
  return user.orgType === 'educational' ? 'Educational Institution' : 'Business';
}

export function statusLabel(user) {
  if (user.status === 'pending') return 'Pending activation';
  return user.status === 'active' ? 'Active' : 'Suspended';
}

export default function UserManagement() {
  const { users } = useApp();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');

  //Get the selected filters from the URL
  const type = params.get('type') || '';
  const status = params.get('status') || '';

  //Update the URL when a filter changes
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);

    if (value) next.set(key, value);
    else next.delete(key);

    setParams(next, { replace: true });
  };

  //Search and filter users, excluding admin accounts
  const rows = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return users
      .filter((user) => user.role !== 'admin')
      .filter((user) =>
        !searchText ||
        user.name.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText)
      )
      .filter((user) =>
        !type || (type === 'student' ? user.role === 'student' : user.orgType === type)
      )
      .filter((user) => !status || user.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [users, search, type, status]);

  return (
    <SideLayout links={ADMIN_LINKS}>
      <PageHeader
        title="User Management"
        subtitle="All registered organizations and students."
      />

      <div className="toolbar">
        <TextField
          className="search"
          label="Search"
          type="search"
          placeholder="Name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <SelectField
          label="Account type"
          value={type}
          onChange={(e) => setFilter('type', e.target.value)}
          placeholder="All types"
          options={[
            { value: 'business', label: 'Business' },
            { value: 'educational', label: 'Educational Institution' },
            { value: 'student', label: 'University Student' },
          ]}
        />

        <SelectField
          label="Status"
          value={status}
          onChange={(e) => setFilter('status', e.target.value)}
          placeholder="All statuses"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'pending', label: 'Pending activation' },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No users found" message="Try another search or filter." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Account type</th>
                <th>Joined</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <div className="small muted">{user.email}</div>
                  </td>
                  <td>{accountTypeLabel(user)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <Badge status={user.status}>
                      {statusLabel(user)}
                    </Badge>
                  </td>
                  <td>
                    <Link to={`/admin/users/${user.id}`} className="btn btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SideLayout>
  );
}
