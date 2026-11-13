import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { ListingCard } from '../../components/ListingCard.jsx';
import { isPubliclyVisible } from '../../utils/rules.js';

export default function Home() {
  const { listings, users, getCategory, getUser, currentUser } = useApp();
  const visible = listings.filter((l) => isPubliclyVisible(l, users));
  const latest = [...visible].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div
          className="container hero-inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 40
          }}
        >
          <div style={{ flex: 1, maxWidth: 650 }}>
            <h1>Give surplus materials a second life</h1>
            <p className="lead">
               Fayidh connects organizations with surplus materials and equipment to businesses, educational institutions, and university students looking to purchase or receive donated items.
            </p>
            <div
              className="row"
              style={{
                marginTop: 28,
                gap: 12,
                flexWrap: 'wrap'
              }}
            >
              <Link to="/browse" className="btn btn-primary">
                Browse listings
              </Link>
              {!currentUser && (
                <Link to="/signup" className="btn">
                  Create an account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>How Fayidh works</h2>
            <p>Three simple steps to give surplus materials a new purpose.</p>
          </div>
          <div className="grid grid-3 steps">
            <div className="card step-card">
              <h3>List surplus items</h3>
              <p className="muted">Organizations post unused materials and equipment for sale or for donation, with photos and details.</p>
            </div>
            <div className="card step-card">
              <h3>Find and request</h3>
              <p className="muted">Browse available materials and submit purchase requests. Verified university students can also request donations.</p>
            </div>
            <div className="card step-card">
              <h3>Accept and hand over</h3>
              <p className="muted">The seller reviews the request. Once accepted, both sides can view the contact details of the other party.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="row-between" style={{ marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>Latest listings</h2>
            <Link to="/browse" className="btn btn-ghost">
              View all →
            </Link>
          </div>
          <div className="listing-grid">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} category={getCategory(l.categoryId)} owner={getUser(l.ownerId)} to={`/listings/${l.id}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid grid-3">
            <div className="card feature-card">
              <div className="feature-icon">B</div>
              <h3>Businesses</h3>
              <p className="muted">Sell what you no longer need and buy affordable materials from other organizations with one account.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">E</div>
              <h3>Educational institutions</h3>
              <p className="muted">Buy affordable materials and offer surplus equipment for sale or donation to support education and sustainability.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">S</div>
              <h3>University students</h3>
              <p className="muted">Verify your university email to buy items or request donations for your studies and projects.</p>
            </div>
          </div>
        </div>
      </section>

      {!currentUser && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="cta-band">
              <div>
                <h2 style={{ color: '#fff' }}>Have surplus items in storage?</h2>
                <p>Create an organization account and list them in minutes.</p>
              </div>
              <Link to="/signup" className="btn">
                Get started
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
