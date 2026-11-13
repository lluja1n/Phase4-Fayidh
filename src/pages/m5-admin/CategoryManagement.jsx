
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { ADMIN_LINKS, SideLayout } from '../../components/Layout.jsx';
import { Alert, ConfirmModal, EmptyState, Modal, PageHeader, TextAreaField, TextField } from '../../components/ui.jsx';
import { isCategoryInUse, validateCategoryName } from '../../utils/rules.js';

// M5 - Add, edit and delete categories (FR 3.4.8 - 3.4.9)
function CategoryModal({ category, onClose }) {
  const { categories, addCategory, updateCategory, toast } = useApp();
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const problem = validateCategoryName(name, categories, category?.id || null);

    if (problem) {
      setError(problem);
      return;
    }

    if (isEdit) {
      updateCategory(category.id, { name: name.trim(), description: description.trim() });
      toast('Category updated successfully.');
    } else {
      addCategory(name, description);
      toast('Category added successfully.');
    }

    onClose();
  };

  return (
    <Modal title={isEdit ? 'Edit Category' : 'Add Category'} onClose={onClose}>
      <form className="stack" onSubmit={onSubmit} noValidate>
        <TextField
          label="Category name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          placeholder="e.g. Medical Equipment"
          maxLength={60}
        />
        <TextAreaField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose} data-close>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Save Changes' : 'Save Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CategoryManagement() {
  const { categories, listings, deleteCategory, toast } = useApp();
  const [editing, setEditing] = useState(null); // null | 'new' | category
  const [deleting, setDeleting] = useState(null);
  const [inUseWarning, setInUseWarning] = useState(null);

  const askDelete = (cat) => {
    // Prevent deleting categories that are used by existing listings.
    if (isCategoryInUse(cat.id, listings)) {
      setInUseWarning(cat);
      return;
    }

    setDeleting(cat);
  };

  const confirmDelete = () => {
    deleteCategory(deleting.id);
    toast('Category deleted successfully.');
    setDeleting(null);
  };

  return (
    <SideLayout links={ADMIN_LINKS}>
      <PageHeader
        title="Categories"
        subtitle="Categories organize listings. Organizations choose one when they create a listing."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            + Add Category
          </button>
        }
      />

      {inUseWarning && (
        <Alert kind="warning" className="mb">
          <p>
            <strong>{inUseWarning.name}:</strong> This category cannot be deleted because it is currently used by existing listings.{' '}
            <button type="button" className="link-btn" onClick={() => setInUseWarning(null)}>
              Dismiss
            </button>
          </p>
        </Alert>
      )}

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Add the first category so organizations can create listings." />
      ) : (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Listings</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td className="muted">{c.description || '—'}</td>
                  <td>{listings.filter((l) => l.categoryId === c.id).length}</td>
                  <td>
                    <div className="row" style={{ flexWrap: 'nowrap' }}>
                      <button type="button" className="btn btn-sm" onClick={() => setEditing(c)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => askDelete(c)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CategoryModal
          category={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete category?"
          message={`"${deleting.name}" will be deleted permanently.`}
          confirmLabel="Confirm Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </SideLayout>
  );
}
