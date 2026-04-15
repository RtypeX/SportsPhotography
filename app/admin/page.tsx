import Image from "next/image";
import Link from "next/link";

import { requireAdminUser } from "@/lib/auth";
import { collectionDefinitions, getCollectionDefinition, getCollectionPhotos } from "@/lib/site-content";

import { signOutAction } from "../auth/login/actions";
import { updatePhotoAction } from "./actions";

type AdminPageProps = {
  searchParams: Promise<{
    collection?: string;
    message?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const { user } = await requireAdminUser();
  const selectedCollection = getCollectionDefinition(params.collection);
  const photos = await getCollectionPhotos(selectedCollection.slug);

  return (
    <main className="admin-shell" id="main-content">
      <section className="admin-header">
        <div>
          <p className="section-label">Admin Panel</p>
          <h1>{selectedCollection.collectionName}</h1>
          <p className="admin-copy">
            Signed in as {user.email}. Edit captions, titles, featured status, and sort order for the selected collection below.
          </p>
        </div>

        <div className="admin-header__actions">
          <Link href="/" className="admin-link">
            View collection
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="admin-link admin-link--button">
              Sign out
            </button>
          </form>
        </div>
      </section>

      {params.message ? <p className="admin-message">{params.message}</p> : null}

      <section className="filter-bar">
        {collectionDefinitions.map((collection) => (
          <Link
            key={collection.slug}
            href={`/admin?collection=${collection.slug}`}
            className={`filter-chip${collection.slug === selectedCollection.slug ? " filter-chip--active" : ""}`}
          >
            {collection.teamName}
          </Link>
        ))}
      </section>

      <section className="admin-grid">
        {photos.map((photo) => (
          <article key={photo.id} className="admin-card">
            <div className="admin-card__image">
              <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="240px" />
            </div>

            <form action={updatePhotoAction} className="admin-card__form">
              <input type="hidden" name="collectionSlug" value={selectedCollection.slug} />
              <input type="hidden" name="filename" value={photo.filename} />
              <label>
                Filename
                <input type="text" value={photo.filename} readOnly />
              </label>
              <label>
                Title
                <input type="text" name="title" defaultValue={photo.title} />
              </label>
              <label>
                Caption
                <textarea name="caption" defaultValue={photo.caption} rows={3} />
              </label>
              <label>
                Sort order
                <input type="number" name="sortOrder" defaultValue={photo.sortOrder} />
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" name="featured" defaultChecked={photo.featured} />
                Featured
              </label>
              <button type="submit">Save photo</button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
